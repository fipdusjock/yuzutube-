function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- 登録チャンネル -----------------------------------------------------
const SUBS_KEY = "tubely_subscriptions";

function isSubscribed(channelId) {
  return getJSON(SUBS_KEY, []).some(s => s.channel_id === channelId);
}

function toggleSubscribe(channelId, meta) {
  const subs = getJSON(SUBS_KEY, []);
  const idx = subs.findIndex(s => s.channel_id === channelId);
  if (idx >= 0) {
    subs.splice(idx, 1);
    setJSON(SUBS_KEY, subs);
    return false;
  }
  subs.unshift({
    channel_id: channelId,
    channel: meta.channel || "",
    thumbnail: meta.thumbnail || "",
  });
  setJSON(SUBS_KEY, subs);
  return true;
}

// --- 高く評価した動画 -----------------------------------------------------
const LIKES_KEY = "tubely_likes";

function isLiked(videoId) {
  return getJSON(LIKES_KEY, []).some(l => l.video_id === videoId);
}

function toggleLike(videoId, meta) {
  const likes = getJSON(LIKES_KEY, []);
  const idx = likes.findIndex(l => l.video_id === videoId);
  if (idx >= 0) {
    likes.splice(idx, 1);
    setJSON(LIKES_KEY, likes);
    return false;
  }
  likes.unshift({
    video_id: videoId,
    title: (meta && meta.title) || "",
    thumbnail: (meta && meta.thumbnail) || "",
    channel: (meta && meta.channel) || "",
    duration: (meta && meta.duration) || null,
    liked_at: Date.now(),
  });
  setJSON(LIKES_KEY, likes);
  return true;
}

// --- 視聴履歴(このブラウザ内でのみ保持する分。全体共有分は/proxy/historyで別管理) ---
const HISTORY_KEY = "tubely_history";
const HISTORY_MAX_ENTRIES = 200;

function addHistory(entry) {
  let hist = getJSON(HISTORY_KEY, []);
  hist = hist.filter(h => h.video_id !== entry.video_id);
  hist.unshift({ ...entry, watched_at: Date.now() });
  if (hist.length > HISTORY_MAX_ENTRIES) hist = hist.slice(0, HISTORY_MAX_ENTRIES);
  setJSON(HISTORY_KEY, hist);
}

// --- マイプレイリスト(ローカルストレージ完結。サーバーには一切保存しない) -----
const MY_PLAYLISTS_KEY = "tubely_my_playlists";
const MY_PLAYLISTS_MAX_COUNT = 200;
const MY_PLAYLIST_MAX_VIDEOS = 5000;
const MY_PLAYLIST_NAME_MAX_LEN = 20;

function getMyPlaylists() {
  return getJSON(MY_PLAYLISTS_KEY, []);
}

function saveMyPlaylists(playlists) {
  setJSON(MY_PLAYLISTS_KEY, playlists);
}

function findMyPlaylist(playlistId) {
  return getMyPlaylists().find(p => p.id === playlistId) || null;
}

function createMyPlaylist(name) {
  const playlists = getMyPlaylists();
  if (playlists.length >= MY_PLAYLISTS_MAX_COUNT) {
    throw new Error(`プレイリストは最大${MY_PLAYLISTS_MAX_COUNT}個までです`);
  }
  const trimmed = (name || "").trim().slice(0, MY_PLAYLIST_NAME_MAX_LEN);
  if (!trimmed) throw new Error("プレイリスト名を入力してください");
  const playlist = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name: trimmed,
    videos: [],
    created_at: Date.now(),
  };
  playlists.unshift(playlist);
  saveMyPlaylists(playlists);
  return playlist;
}

function renameMyPlaylist(playlistId, name) {
  const playlists = getMyPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) throw new Error("プレイリストが見つかりません");
  const trimmed = (name || "").trim().slice(0, MY_PLAYLIST_NAME_MAX_LEN);
  if (!trimmed) throw new Error("プレイリスト名を入力してください");
  playlist.name = trimmed;
  saveMyPlaylists(playlists);
  return playlist;
}

function deleteMyPlaylist(playlistId) {
  const playlists = getMyPlaylists().filter(p => p.id !== playlistId);
  saveMyPlaylists(playlists);
}

function addVideoToMyPlaylist(playlistId, video) {
  const playlists = getMyPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) throw new Error("プレイリストが見つかりません");
  if (playlist.videos.some(v => v.video_id === video.video_id)) return playlist;
  if (playlist.videos.length >= MY_PLAYLIST_MAX_VIDEOS) {
    throw new Error(`このプレイリストには最大${MY_PLAYLIST_MAX_VIDEOS}本までしか追加できません`);
  }
  playlist.videos.push({
    video_id: video.video_id,
    title: video.title || "",
    thumbnail: video.thumbnail || "",
    channel: video.channel || "",
    duration: video.duration || null,
  });
  saveMyPlaylists(playlists);
  return playlist;
}

function removeVideoFromMyPlaylist(playlistId, videoId) {
  const playlists = getMyPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return;
  playlist.videos = playlist.videos.filter(v => v.video_id !== videoId);
  saveMyPlaylists(playlists);
}

// --- 再生位置の保存(「途中まで見た動画をもう一度開くと、続きから再生」) --------
const WATCH_PROGRESS_KEY_PREFIX = "tubely_progress:";
const WATCH_PROGRESS_MIN_SECONDS = 10;       // これ未満はそもそも保存しない(開いてすぐ離脱しただけ)
const WATCH_PROGRESS_END_MARGIN_SECONDS = 15; // 動画の終わり付近(残りこの秒数未満)は「見終わった」とみなす
const WATCH_PROGRESS_MAX_ENTRIES = 200;       // 保存しすぎてlocalStorageを圧迫しないための上限

function saveWatchProgress(videoId, currentTime, duration) {
  try {
    const key = WATCH_PROGRESS_KEY_PREFIX + videoId;
    if (!currentTime || currentTime < WATCH_PROGRESS_MIN_SECONDS) {
      localStorage.removeItem(key);
      return;
    }
    if (duration && currentTime > duration - WATCH_PROGRESS_END_MARGIN_SECONDS) {
      // 最後まで見終わった(とみなせる)ので、次に開いた時は最初から再生できるよう消しておく
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify({ time: currentTime, updated_at: Date.now() }));
    pruneWatchProgressEntries();
  } catch (e) { /* localStorageが使えない環境では何もしない */ }
}

function getWatchProgress(videoId) {
  try {
    const raw = localStorage.getItem(WATCH_PROGRESS_KEY_PREFIX + videoId);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data.time === "number" && data.time > 0 ? data.time : null;
  } catch (e) {
    return null;
  }
}

function pruneWatchProgressEntries() {
  // 保存件数が増えすぎたら、古いものから間引く(無制限に溜め続けるとlocalStorageの
  // 容量上限に達してエラーになることがあるため)。
  try {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(WATCH_PROGRESS_KEY_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          entries.push({ key, updated_at: data.updated_at || 0 });
        } catch (e) { /* 壊れたエントリは無視 */ }
      }
    }
    if (entries.length <= WATCH_PROGRESS_MAX_ENTRIES) return;
    entries.sort((a, b) => a.updated_at - b.updated_at);
    const toRemove = entries.slice(0, entries.length - WATCH_PROGRESS_MAX_ENTRIES);
    toRemove.forEach(e => localStorage.removeItem(e.key));
  } catch (e) { /* noop */ }
}

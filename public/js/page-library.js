function initLikedPage() {
  const listBox = document.getElementById("likedList");
  const heroThumb = document.getElementById("likedHeroThumb");
  const metaBox = document.getElementById("likedMeta");
  const playAllBtn = document.getElementById("likedPlayAllBtn");

  const likes = getJSON(LIKES_KEY, []);
  if (!likes.length) {
    listBox.innerHTML = '<div class="empty-state">高く評価した動画はまだありません</div>';
    if (metaBox) metaBox.textContent = "0 本の動画";
    if (playAllBtn) playAllBtn.disabled = true;
    return;
  }
  if (metaBox) metaBox.textContent = `${likes.length} 本の動画`;
  if (heroThumb && likes[0].thumbnail) {
    heroThumb.innerHTML = `<img src="${escapeHtml(likes[0].thumbnail)}" alt="">`;
  }
  if (playAllBtn) {
    playAllBtn.disabled = false;
    playAllBtn.onclick = () => {
      window.location.href = `/watch?v=${encodeURIComponent(likes[0].video_id)}`;
    };
  }

  listBox.innerHTML = likes.map((l, i) => `
    <a class="pl-video-row" href="/watch?v=${encodeURIComponent(l.video_id)}">
      <span class="pl-video-index">${i + 1}</span>
      <span class="pl-video-thumb">
        ${l.thumbnail ? `<img src="${escapeHtml(l.thumbnail)}" alt="" loading="lazy">` : ""}
        ${l.duration ? `<span class="duration">${escapeHtml(formatDuration(l.duration))}</span>` : ""}
      </span>
      <span class="pl-video-body">
        <span class="pl-video-title">${escapeHtml(l.title || "(タイトル不明)")}</span>
        <span class="pl-video-channel">${escapeHtml(l.channel || "")}</span>
      </span>
    </a>`).join("");
}

function initHistoryPage() {
  const grid = document.getElementById("historyGrid");

  function renderEntries(entries) {
    grid.innerHTML = entries.length ? entries.map(h => videoCardHTML({
      video_id: h.video_id,
      title: h.title,
      channel: h.channel,
      channel_thumbnail: h.channel_thumbnail || "",
      thumbnail: h.thumbnail,
      duration: h.duration,
      view_count_text: `このサイトで${h.view_count || 1}回視聴`,
    }, `/watch?v=${encodeURIComponent(h.video_id)}`)).join("") : '<div class="empty-state">まだ動画が見られていません</div>';
  }

  fetch("/proxy/history?limit=100")
    .then((res) => {
      if (!res.ok) throw new Error("failed");
      return res.json();
    })
    .then((data) => renderEntries(data.entries || []))
    .catch(() => renderEntries(getJSON(HISTORY_KEY, [])));
}

function initMyPlaylistsPage() {
  const listBox = document.getElementById("myPlaylistsList");
  const statusBox = document.getElementById("myPlaylistsStatus");
  const createBtn = document.getElementById("createPlaylistBtn");

  function render() {
    const playlists = getMyPlaylists();
    if (!playlists.length) {
      listBox.innerHTML = '<div class="empty-state">プレイリストはまだありません</div>';
    } else {
      listBox.innerHTML = playlists.map((p) => `
        <a class="my-playlist-card" href="/my-playlists/${encodeURIComponent(p.id)}">
          <div class="my-playlist-card-icon">${icon("playlistStack")}</div>
          <div class="my-playlist-card-name">${escapeHtml(p.name)}</div>
          <div class="my-playlist-card-count">${p.videos.length} 本の動画</div>
        </a>`).join("");
    }
    statusBox.textContent = `${playlists.length} / ${MY_PLAYLISTS_MAX_COUNT} 個`;
  }

  createBtn.addEventListener("click", () => {
    const name = window.prompt(`プレイリスト名(${MY_PLAYLIST_NAME_MAX_LEN}文字まで)`);
    if (name === null) return;
    try {
      createMyPlaylist(name);
      render();
    } catch (e) {
      alert(e.message || "作成に失敗しました");
    }
  });

  render();
}

function initMyPlaylistDetailPage(playlistId) {
  const heroThumb = document.getElementById("myPlaylistHeroThumb");
  const titleEl = document.getElementById("myPlaylistTitle");
  const metaEl = document.getElementById("myPlaylistMeta");
  const playAllBtn = document.getElementById("myPlaylistPlayAllBtn");
  const renameBtn = document.getElementById("myPlaylistRenameBtn");
  const deleteBtn = document.getElementById("myPlaylistDeleteBtn");
  const videoListBox = document.getElementById("myPlaylistVideoList");

  function render() {
    const playlist = findMyPlaylist(playlistId);
    if (!playlist) {
      titleEl.textContent = "見つかりません";
      metaEl.textContent = "";
      videoListBox.innerHTML = '<div class="empty-state">このプレイリストは見つかりませんでした</div>';
      playAllBtn.disabled = true;
      return;
    }
    titleEl.textContent = playlist.name;
    const videos = playlist.videos;
    metaEl.textContent = `${videos.length} / ${MY_PLAYLIST_MAX_VIDEOS} 本の動画`;
    if (videos.length && videos[0].thumbnail) {
      heroThumb.innerHTML = `<img src="${escapeHtml(videos[0].thumbnail)}" alt="">`;
    }
    playAllBtn.disabled = !videos.length;

    if (!videos.length) {
      videoListBox.innerHTML = '<div class="empty-state">このプレイリストには動画がありません</div>';
      return;
    }
    videoListBox.innerHTML = videos.map((v, i) => `
      <div class="pl-video-row-wrap">
        <a class="pl-video-row" href="/watch?v=${encodeURIComponent(v.video_id)}">
          <span class="pl-video-index">${i + 1}</span>
          <span class="pl-video-thumb">
            ${v.thumbnail ? `<img src="${escapeHtml(v.thumbnail)}" alt="" loading="lazy">` : ""}
            ${v.duration ? `<span class="duration">${escapeHtml(formatDuration(v.duration))}</span>` : ""}
          </span>
          <span class="pl-video-body">
            <span class="pl-video-title">${escapeHtml(v.title || "(タイトル不明)")}</span>
            <span class="pl-video-channel">${escapeHtml(v.channel || "")}</span>
          </span>
        </a>
        <button type="button" class="my-playlist-remove-btn" data-video-id="${escapeHtml(v.video_id)}" title="このプレイリストから削除">×</button>
      </div>`).join("");

    videoListBox.querySelectorAll(".my-playlist-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeVideoFromMyPlaylist(playlistId, btn.dataset.videoId);
        render();
      });
    });
  }

  playAllBtn.addEventListener("click", () => {
    const playlist = findMyPlaylist(playlistId);
    if (!playlist || !playlist.videos.length) return;
    window.location.href = `/watch?v=${encodeURIComponent(playlist.videos[0].video_id)}`;
  });

  renameBtn.addEventListener("click", () => {
    const playlist = findMyPlaylist(playlistId);
    if (!playlist) return;
    const name = window.prompt(`新しい名前(${MY_PLAYLIST_NAME_MAX_LEN}文字まで)`, playlist.name);
    if (name === null) return;
    try {
      renameMyPlaylist(playlistId, name);
      render();
    } catch (e) {
      alert(e.message || "変更に失敗しました");
    }
  });

  deleteBtn.addEventListener("click", () => {
    if (!window.confirm("本当に削除しますか？この操作は取り消せません。")) return;
    deleteMyPlaylist(playlistId);
    window.location.href = "/my-playlists";
  });

  render();
}

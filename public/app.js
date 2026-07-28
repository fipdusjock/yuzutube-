// ==================================================================
// Tubely フロントエンドのクライアント側ロジック。
// ページは即座に(スケルトン状態で)表示されていて、ここが /proxy/* を叩いて
// 中身を後から差し込む。絵文字は使わずSVGアイコンで統一している。
//
// 登録チャンネル/高評価/視聴履歴はすべてlocalStorageだけで完結する「仮」の機能。
// 実際のYouTubeアカウントには一切反映されない(設定ページにもその旨明記してある)。
// ==================================================================

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="currentColor"><rect y="4" width="24" height="2"/><rect y="11" width="24" height="2"/><rect y="18" width="24" height="2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  thumbsUp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H2v11zM22 10.5A2.5 2.5 0 0 0 19.5 8H14l.9-4.3a1.5 1.5 0 0 0-2.6-1.3L7 8v13h11a2 2 0 0 0 1.9-1.4l2-6a2.5 2.5 0 0 0-.1-3.1z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v12H7l-3 3z"/></svg>',
  volume: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M17 8a5 5 0 0 1 0 8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M19.5 5.5a9 9 0 0 1 0 13"/></svg>',
  volumeMute: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M16 9l5 6M21 9l-5 6"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/></svg>',
};

function icon(name) {
  return `<span class="icon">${ICONS[name] || ""}</span>`;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDuration(seconds) {
  if (!seconds) return "";
  seconds = Math.floor(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatCountJa(n) {
  // YouTube日本語版と同じ「1万」「1.5万」「2.3億」みたいな表記にする。
  // 1万未満はそのままカンマ区切り。
  if (n === null || n === undefined) return "";
  const abs = Math.abs(n);
  if (abs < 10000) return n.toLocaleString("ja-JP");
  if (abs < 100000000) {
    const val = n / 10000;
    return (Number.isInteger(val) ? val : val.toFixed(1)) + "万";
  }
  const val = n / 100000000;
  return (Number.isInteger(val) ? val : val.toFixed(1)) + "億";
}

function formatViews(n) {
  if (n === null || n === undefined) return "";
  return `${formatCountJa(n)} 回視聴`;
}

function formatUploadDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr || "";
  return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
}

// ---------- ローカル設定(APIサーバーのURL上書き) ----------

const API_BASE_KEY = "tubely_api_base";

function apiBaseQueryParam() {
  const override = localStorage.getItem(API_BASE_KEY);
  return override ? `api_base=${encodeURIComponent(override)}` : "";
}

async function fetchJSON(url) {
  const extra = apiBaseQueryParam();
  const finalUrl = extra ? `${url}${url.includes("?") ? "&" : "?"}${extra}` : url;

  const res = await fetch(finalUrl);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("サーバーの応答を解釈できませんでした");
  }
  if (!res.ok || data.error) {
    throw new Error(data.message || `HTTPエラー (${res.status})`);
  }
  return data;
}

function showError(container, message) {
  container.innerHTML = `<div class="empty-state">うまく取得できませんでした<br><br>${escapeHtml(message)}</div>`;
}

// ---------- ローカルストレージ(登録チャンネル/高評価/視聴履歴、すべて「仮」) ----------

const SUBS_KEY = "tubely_subscriptions";
const LIKES_KEY = "tubely_likes";
const HISTORY_KEY = "tubely_history";

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

function isSubscribed(channelId) {
  return getJSON(SUBS_KEY, []).some((s) => s.channel_id === channelId);
}

function toggleSubscribe(channelId, meta) {
  const subs = getJSON(SUBS_KEY, []);
  const idx = subs.findIndex((s) => s.channel_id === channelId);
  if (idx >= 0) {
    subs.splice(idx, 1);
    setJSON(SUBS_KEY, subs);
    return false;
  }
  subs.unshift({ channel_id: channelId, channel: meta.channel || "", thumbnail: meta.thumbnail || "" });
  setJSON(SUBS_KEY, subs);
  return true;
}

function isLiked(videoId) {
  return getJSON(LIKES_KEY, []).includes(videoId);
}

function toggleLike(videoId) {
  const likes = getJSON(LIKES_KEY, []);
  const idx = likes.indexOf(videoId);
  if (idx >= 0) {
    likes.splice(idx, 1);
    setJSON(LIKES_KEY, likes);
    return false;
  }
  likes.push(videoId);
  setJSON(LIKES_KEY, likes);
  return true;
}

function addHistory(entry) {
  let hist = getJSON(HISTORY_KEY, []);
  hist = hist.filter((h) => h.video_id !== entry.video_id);
  hist.unshift({ ...entry, watched_at: Date.now() });
  if (hist.length > 200) hist = hist.slice(0, 200);
  setJSON(HISTORY_KEY, hist);
}

// ---------- ボタンのHTML片(登録/高評価。クリックはイベント委譲で処理) ----------

function subscribeButtonHTML(channelId, channelName, thumbnail) {
  if (!channelId) return "";
  const subscribed = isSubscribed(channelId);
  return `<button class="subscribe-btn ${subscribed ? "subscribed" : ""}"
    data-action="toggle-subscribe"
    data-channel-id="${escapeHtml(channelId)}"
    data-channel-name="${escapeHtml(channelName || "")}"
    data-channel-thumb="${escapeHtml(thumbnail || "")}">
    ${subscribed ? "登録済み" : "チャンネル登録"}
  </button>`;
}

function likeButtonHTML(videoId, likeCount) {
  const liked = isLiked(videoId);
  const countText = likeCount ? formatCountJa(likeCount) : "";
  return `<button class="stat-pill like-btn ${liked ? "active" : ""}" data-action="toggle-like" data-video-id="${escapeHtml(videoId)}">
    ${icon("thumbsUp")}${countText}
  </button>`;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  if (btn.dataset.action === "toggle-subscribe") {
    const nowSubscribed = toggleSubscribe(btn.dataset.channelId, {
      channel: btn.dataset.channelName,
      thumbnail: btn.dataset.channelThumb,
    });
    btn.classList.toggle("subscribed", nowSubscribed);
    btn.textContent = nowSubscribed ? "登録済み" : "チャンネル登録";
  }

  if (btn.dataset.action === "toggle-like") {
    const nowLiked = toggleLike(btn.dataset.videoId);
    btn.classList.toggle("active", nowLiked);
  }
});

// ---------- スケルトン ----------

function skeletonCardHTML() {
  return `
    <div class="card sk-card">
      <div class="sk sk-thumb"></div>
      <div class="meta">
        <div class="sk sk-circle"></div>
        <div style="flex:1;">
          <div class="sk sk-line w90"></div>
          <div class="sk sk-line w40"></div>
        </div>
      </div>
    </div>`;
}

// ---------- カードのHTML(実データ) ----------

function videoCardHTML(e, watchHref) {
  const dur = e.duration ? `<span class="duration">${escapeHtml(formatDuration(e.duration))}</span>` : "";
  const views = e.view_count ? formatViews(e.view_count) : (e.view_count_text || "");
  return `
    <a class="card" href="${watchHref}">
      <div class="thumb-wrap">
        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}
        ${dur}
      </div>
      <div class="meta">
        <div class="avatar">${escapeHtml((e.channel || "?")[0] || "?")}</div>
        <div>
          <div class="title">${escapeHtml(e.title)}</div>
          <div class="sub">${escapeHtml(e.channel || "")}${views ? " &middot; " + escapeHtml(views) : ""}</div>
        </div>
      </div>
    </a>`;
}

function relatedCardHTML(e) {
  return `
    <a class="related-card" href="/watch?v=${encodeURIComponent(e.video_id)}">
      <div class="thumb-wrap" style="width:168px;">
        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}
        ${e.length_text ? `<span class="duration">${escapeHtml(e.length_text)}</span>` : ""}
      </div>
      <div>
        <div class="title">${escapeHtml(e.title)}</div>
        <div class="sub">${escapeHtml(e.channel || "")}${e.view_count_text ? "<br>" + escapeHtml(e.view_count_text) : ""}</div>
      </div>
    </a>`;
}

function commentRowHTML(c) {
  return `
    <div class="comment-row">
      <div class="avatar">${escapeHtml((c.author || "?")[0] || "?")}</div>
      <div style="flex:1;">
        <div>
          <span class="author">${escapeHtml(c.author || "")}</span>
          <span class="time">${escapeHtml(c.time_text || "")}</span>
        </div>
        <div class="text">${escapeHtml(c.text || "")}</div>
        ${c.like_count ? `<div class="likes">${icon("thumbsUp")}${formatCountJa(c.like_count)}</div>` : ""}
      </div>
    </div>`;
}

// ---------- ページごとの初期化 ----------

async function initIndexPage() {
  const grid = document.getElementById("trendingGrid");
  try {
    const data = await fetchJSON("/proxy/trending?limit=24");
    const entries = data.entries || [];
    grid.innerHTML = entries.length
      ? entries.map((e) => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("")
      : '<div class="empty-state">動画が見つかりませんでした。</div>';
  } catch (e) {
    showError(grid.parentElement, e.message);
  }
}

async function initResultsPage(query) {
  const grid = document.getElementById("resultsGrid");
  try {
    const data = await fetchJSON(`/proxy/search?q=${encodeURIComponent(query)}&limit=24`);
    const entries = data.entries || [];
    if (!entries.length) {
      grid.outerHTML = '<div class="empty-state">見つかりませんでした。別のキーワードで試してみてください。</div>';
      return;
    }
    grid.innerHTML = entries.map((e) => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("");
  } catch (e) {
    showError(grid.parentElement, e.message);
  }
}

async function initWatchPage(videoId) {
  const infoBox = document.getElementById("videoInfo");
  const relatedBox = document.getElementById("relatedList");
  const commentsBox = document.getElementById("commentsList");
  const playerWrap = document.getElementById("playerWrap");

  const infoPromise = fetchJSON(`/proxy/info/${encodeURIComponent(videoId)}`);
  const streamPromise = fetchJSON(`/proxy/stream/${encodeURIComponent(videoId)}`);

  try {
    const [info, stream] = await Promise.all([infoPromise, streamPromise]);
    renderVideoInfo(infoBox, info, videoId);
    renderPlayer(playerWrap, stream, info);
    document.title = info.title ? `${info.title} - ${document.title.split(" - ").pop()}` : document.title;

    addHistory({
      video_id: videoId,
      title: info.title || "",
      channel: info.channel || info.uploader || "",
      thumbnail: info.thumbnail || "",
      duration: info.duration || null,
    });
  } catch (e) {
    showError(infoBox, e.message);
    playerWrap.innerHTML = `<div class="player-fallback">${escapeHtml(e.message)}</div>`;
  }

  fetchJSON(`/proxy/related/${encodeURIComponent(videoId)}?limit=15`)
    .then((data) => {
      const entries = data.entries || [];
      relatedBox.innerHTML = entries.length
        ? entries.map(relatedCardHTML).join("")
        : '<div class="empty-state">関連動画はありません</div>';
    })
    .catch((e) => showError(relatedBox, e.message));

  fetchJSON(`/proxy/comments/${encodeURIComponent(videoId)}?limit=30`)
    .then((data) => {
      const comments = data.comments || [];
      commentsBox.innerHTML = comments.length
        ? comments.map(commentRowHTML).join("")
        : '<div class="empty-state">コメントはありません(またはコメント欄が無効です)</div>';
    })
    .catch((e) => showError(commentsBox, e.message));
}

function renderVideoInfo(box, info, videoId) {
  const channelName = info.channel || info.uploader || "";
  const channelLink = info.channel_id
    ? `<a href="/channel/${encodeURIComponent(info.channel_id)}">${escapeHtml(channelName)}</a>`
    : escapeHtml(channelName);

  const stats = [];
  if (info.view_count) stats.push(`<span class="stat-pill">${escapeHtml(formatViews(info.view_count))}</span>`);
  stats.push(likeButtonHTML(videoId, info.like_count));
  if (info.comment_count) stats.push(`<span class="stat-pill">${icon("comment")}${formatCountJa(info.comment_count)}</span>`);

  const chapters = (info.chapters || [])
    .map((c) => `<div class="chapter-row"><span class="ts">${escapeHtml(formatDuration(Math.floor(c.start_time || 0)))}</span><span>${escapeHtml(c.title || "")}</span></div>`)
    .join("");

  box.innerHTML = `
    <div class="video-title">${escapeHtml(info.title || "")}</div>
    <div class="video-owner-row">
      <div class="video-owner">
        <div class="avatar">${escapeHtml((channelName || "?")[0] || "?")}</div>
        <div>
          <div class="name">${channelLink}</div>
          ${info.channel_follower_count ? `<div class="subs">${formatCountJa(info.channel_follower_count)} 人の登録者</div>` : ""}
        </div>
        ${subscribeButtonHTML(info.channel_id, channelName, info.thumbnail)}
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">${stats.join("")}</div>
    </div>
    <div class="description-box">
      <div class="top-line">
        ${info.upload_date ? escapeHtml(formatUploadDate(info.upload_date)) : ""}
        ${info.tags && info.tags.length ? " &middot; " + escapeHtml(info.tags.slice(0, 8).join(", ")) : ""}
      </div>
      ${escapeHtml(info.description || "(説明文なし)")}
      ${chapters ? `<div class="chapters"><div style="font-weight:600; margin-bottom:6px;">チャプター</div>${chapters}</div>` : ""}
    </div>`;
}

function renderPlayer(wrap, stream, info) {
  const streams = stream.streams || [];
  const combined = streams.filter((s) => s.url && s.vcodec && s.vcodec !== "none" && s.acodec && s.acodec !== "none");
  const hlsUrl = stream.hls_url || null;

  // 解像度が同じフォーマットが複数あれば、ビットレートが高い方を代表として残す
  const byHeight = new Map();
  combined.forEach((s) => {
    const h = s.height || 0;
    const existing = byHeight.get(h);
    if (!existing || (s.tbr || 0) > (existing.tbr || 0)) byHeight.set(h, s);
  });
  const qualities = Array.from(byHeight.values()).sort((a, b) => (b.height || 0) - (a.height || 0));

  if (!qualities.length && !hlsUrl) {
    wrap.innerHTML = '<div class="player-fallback">再生可能なフォーマットが見つかりませんでした。<br>(映像+音声が一体になったフォーマットが無い動画の可能性があります)</div>';
    return;
  }

  // 既定は itag 18 (360p)。無ければ一番高画質のものにフォールバック。
  const defaultQuality = qualities.find((q) => q.format_id === "18") || qualities[0] || null;
  const posterAttr = info.thumbnail ? ` poster="${escapeHtml(info.thumbnail)}"` : "";

  const qualityOptionsHTML = qualities
    .map((q) => {
      const label = q.height ? `${q.height}p` : (q.format_note || q.format_id || "?");
      const isDefault = defaultQuality && q.format_id === defaultQuality.format_id;
      return `<option value="${escapeHtml(q.format_id)}" ${isDefault ? "selected" : ""}>${escapeHtml(label)}${q.format_id === "18" ? " (標準)" : ""}</option>`;
    })
    .join("");

  wrap.innerHTML = `
    <div class="custom-player" id="customPlayer">
      <video id="player" playsinline${posterAttr}></video>
      <div class="player-controls">
        <input type="range" class="seek-bar" id="seekBar" min="0" max="100" value="0" step="0.1">
        <div class="controls-row">
          <button class="ctrl-btn" id="playPauseBtn" aria-label="再生">${icon("play")}</button>
          <div class="time-display"><span id="curTime">0:00</span>&nbsp;/&nbsp;<span id="durTime">0:00</span></div>
          <div class="spacer"></div>
          <button class="ctrl-btn" id="muteBtn" aria-label="ミュート切替">${icon("volume")}</button>
          <input type="range" class="volume-bar" id="volumeBar" min="0" max="100" value="100" aria-label="音量">
          ${qualities.length > 1 ? `<select class="quality-select" id="qualitySelect" aria-label="画質">${qualityOptionsHTML}</select>` : ""}
          <button class="ctrl-btn" id="fullscreenBtn" aria-label="全画面表示">${icon("fullscreen")}</button>
        </div>
      </div>
    </div>`;

  const videoEl = document.getElementById("player");
  const playerRoot = document.getElementById("customPlayer");

  function loadSource(url, resumePlayback) {
    const wasPlaying = resumePlayback && !videoEl.paused;
    const resumeTime = resumePlayback ? videoEl.currentTime : 0;
    videoEl.src = url;
    if (resumePlayback) {
      const onMeta = () => {
        videoEl.currentTime = resumeTime;
        if (wasPlaying) videoEl.play().catch(() => {});
        videoEl.removeEventListener("loadedmetadata", onMeta);
      };
      videoEl.addEventListener("loadedmetadata", onMeta);
    }
  }

  if (defaultQuality) {
    loadSource(defaultQuality.url, false);
  } else if (hlsUrl) {
    attachHlsSource(videoEl, hlsUrl);
  }

  wireCustomPlayerControls(videoEl, playerRoot);

  const qualitySelect = document.getElementById("qualitySelect");
  if (qualitySelect) {
    qualitySelect.addEventListener("change", () => {
      const chosen = qualities.find((q) => q.format_id === qualitySelect.value);
      if (chosen) loadSource(chosen.url, true);
    });
  }
}

function attachHlsSource(videoEl, hlsUrl) {
  if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = hlsUrl;
    return;
  }
  if (window.Hls && window.Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoEl);
  }
}

function formatPlayerTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function wireCustomPlayerControls(videoEl, playerRoot) {
  const playBtn = playerRoot.querySelector("#playPauseBtn");
  const seekBar = playerRoot.querySelector("#seekBar");
  const curTimeEl = playerRoot.querySelector("#curTime");
  const durTimeEl = playerRoot.querySelector("#durTime");
  const muteBtn = playerRoot.querySelector("#muteBtn");
  const volumeBar = playerRoot.querySelector("#volumeBar");
  const fullscreenBtn = playerRoot.querySelector("#fullscreenBtn");

  let seeking = false;

  function togglePlay() {
    if (videoEl.paused) videoEl.play().catch(() => {});
    else videoEl.pause();
  }

  playBtn.addEventListener("click", togglePlay);
  videoEl.addEventListener("click", togglePlay);
  videoEl.addEventListener("play", () => { playBtn.innerHTML = icon("pause"); });
  videoEl.addEventListener("pause", () => { playBtn.innerHTML = icon("play"); });

  videoEl.addEventListener("timeupdate", () => {
    curTimeEl.textContent = formatPlayerTime(videoEl.currentTime);
    if (!seeking && videoEl.duration) {
      seekBar.value = (videoEl.currentTime / videoEl.duration) * 100;
    }
  });
  videoEl.addEventListener("loadedmetadata", () => {
    durTimeEl.textContent = formatPlayerTime(videoEl.duration);
  });

  seekBar.addEventListener("input", () => {
    seeking = true;
    if (videoEl.duration) {
      curTimeEl.textContent = formatPlayerTime((seekBar.value / 100) * videoEl.duration);
    }
  });
  seekBar.addEventListener("change", () => {
    if (videoEl.duration) {
      videoEl.currentTime = (seekBar.value / 100) * videoEl.duration;
    }
    seeking = false;
  });

  function updateVolumeIcon() {
    muteBtn.innerHTML = (videoEl.muted || videoEl.volume === 0) ? icon("volumeMute") : icon("volume");
  }

  volumeBar.addEventListener("input", () => {
    videoEl.volume = volumeBar.value / 100;
    videoEl.muted = videoEl.volume === 0;
    updateVolumeIcon();
  });
  muteBtn.addEventListener("click", () => {
    videoEl.muted = !videoEl.muted;
    if (!videoEl.muted && videoEl.volume === 0) {
      videoEl.volume = 1;
      volumeBar.value = 100;
    }
    updateVolumeIcon();
  });

  fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerRoot.requestFullscreen().catch(() => {});
    }
  });
}

async function initChannelPage(channelId) {
  const header = document.getElementById("channelHeader");
  const grid = document.getElementById("channelGrid");
  try {
    const data = await fetchJSON(`/proxy/channel/${encodeURIComponent(channelId)}?limit=30`);
    const avatarSrc = data.avatar_base64 || data.avatar;
    const bannerSrc = data.banner_base64 || data.banner;

    const bannerHTML = bannerSrc
      ? `<div class="channel-banner"><img src="${escapeHtml(bannerSrc)}" alt=""></div>`
      : "";

    const avatarHTML = avatarSrc
      ? `<img src="${escapeHtml(avatarSrc)}" alt="">`
      : escapeHtml((data.channel || "?")[0] || "?");

    header.innerHTML = `
      ${bannerHTML}
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px; flex-wrap:wrap;">
        <div class="avatar" style="width:64px;height:64px;border-radius:50%;background:var(--bg-elevated);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:24px;">
          ${avatarHTML}
        </div>
        <div style="flex:1;">
          <div style="font-size:20px; font-weight:600;">${escapeHtml(data.channel || "")}</div>
          ${data.channel_follower_count ? `<div style="color:var(--text-secondary); font-size:13px;">${formatCountJa(data.channel_follower_count)} 人の登録者</div>` : ""}
        </div>
        ${subscribeButtonHTML(channelId, data.channel, avatarSrc)}
      </div>
      ${data.description ? `<div class="description-box" style="margin-bottom:24px;">${escapeHtml(data.description)}</div>` : ""}`;

    const entries = data.entries || [];
    grid.innerHTML = entries.length
      ? entries.map((e) => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("")
      : '<div class="empty-state">動画が見つかりませんでした。</div>';
  } catch (e) {
    showError(header, e.message);
  }
}

async function initPlaylistPage(playlistId) {
  const header = document.getElementById("playlistHeader");
  const grid = document.getElementById("playlistGrid");
  try {
    const data = await fetchJSON(`/proxy/playlist/${encodeURIComponent(playlistId)}?limit=100`);
    header.innerHTML = `
      <h1 class="section-title">${escapeHtml(data.title || "")}</h1>
      <div style="color:var(--text-secondary); font-size:13px; margin-bottom:24px;">
        ${escapeHtml(data.uploader || "")}${data.entry_count_total ? " &middot; " + data.entry_count_total + " 本" : ""}
      </div>`;

    const entries = data.entries || [];
    grid.innerHTML = entries.length
      ? entries.map((e) => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("")
      : '<div class="empty-state">動画が見つかりませんでした。</div>';
  } catch (e) {
    showError(header, e.message);
  }
}

function initSubscriptionsPage() {
  const box = document.getElementById("subscriptionsList");
  const subs = getJSON(SUBS_KEY, []);
  if (!subs.length) {
    box.innerHTML = '<div class="empty-state">登録チャンネルはありません</div>';
    return;
  }
  box.innerHTML = subs.map((s) => `
    <a class="sub-row" href="/channel/${encodeURIComponent(s.channel_id)}">
      <div class="avatar" style="width:48px;height:48px;">
        ${s.thumbnail ? `<img src="${escapeHtml(s.thumbnail)}" alt="">` : escapeHtml((s.channel || "?")[0] || "?")}
      </div>
      <div class="title">${escapeHtml(s.channel || "")}</div>
    </a>`).join("");
}

function initHistoryPage() {
  const grid = document.getElementById("historyGrid");

  function render() {
    const hist = getJSON(HISTORY_KEY, []);
    grid.innerHTML = hist.length
      ? hist.map((h) => videoCardHTML(
          { video_id: h.video_id, title: h.title, channel: h.channel, thumbnail: h.thumbnail, duration: h.duration },
          `/watch?v=${encodeURIComponent(h.video_id)}`
        )).join("")
      : '<div class="empty-state">視聴履歴はありません</div>';
  }
  render();

  const clearBtn = document.getElementById("clearHistoryBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      setJSON(HISTORY_KEY, []);
      render();
    });
  }
}

function initSettingsPage() {
  const input = document.getElementById("apiBaseInput");
  const status = document.getElementById("apiBaseStatus");
  const saveBtn = document.getElementById("saveApiBase");
  const resetBtn = document.getElementById("resetApiBase");
  const clearBtn = document.getElementById("clearLocalData");
  const clearStatus = document.getElementById("clearStatus");

  input.value = localStorage.getItem(API_BASE_KEY) || "";

  saveBtn.addEventListener("click", () => {
    const val = input.value.trim();
    if (val) {
      localStorage.setItem(API_BASE_KEY, val);
      status.textContent = "保存しました。ページを再読み込みすると反映されます。";
    } else {
      localStorage.removeItem(API_BASE_KEY);
      status.textContent = "既定値を使うようにしました。";
    }
  });

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(API_BASE_KEY);
    input.value = "";
    status.textContent = "既定値に戻しました。";
  });

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(SUBS_KEY);
    localStorage.removeItem(LIKES_KEY);
    localStorage.removeItem(HISTORY_KEY);
    clearStatus.textContent = "削除しました。";
  });
}

// ---------- サイドバー開閉(モバイル幅) ----------

function toggleSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

// ---------- ページごとの振り分け ----------

document.addEventListener("DOMContentLoaded", () => {
  const ds = document.body.dataset;
  const page = ds.page;

  if (page === "index") initIndexPage();
  else if (page === "results") initResultsPage(ds.query || "");
  else if (page === "watch") initWatchPage(ds.videoId);
  else if (page === "channel") initChannelPage(ds.channelId);
  else if (page === "playlist") initPlaylistPage(ds.playlistId);
  else if (page === "subscriptions") initSubscriptionsPage();
  else if (page === "history") initHistoryPage();
  else if (page === "settings") initSettingsPage();
});

// ==================================================================
// Tubely フロントエンドのクライアント側ロジック。
// ページは即座に(スケルトン状態で)表示されていて、ここが /proxy/* を叩いて
// 中身を後から差し込む。絵文字は使わずSVGアイコンで統一している。
// ==================================================================

const ICONS = {
  search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><rect y="4" width="24" height="2"/><rect y="11" width="24" height="2"/><rect y="18" width="24" height="2"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  thumbsUp: '<svg viewBox="0 0 24 24"><path d="M2 21h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H2v11zM22 10.5A2.5 2.5 0 0 0 19.5 8H14l.9-4.3a1.5 1.5 0 0 0-2.6-1.3L7 8v13h11a2 2 0 0 0 1.9-1.4l2-6a2.5 2.5 0 0 0-.1-3.1z"/></svg>',
  comment: '<svg viewBox="0 0 24 24"><path d="M4 4h16v12H7l-3 3z"/></svg>',
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

function formatViews(n) {
  if (n === null || n === undefined) return "";
  return `${n.toLocaleString("ja-JP")} 回視聴`;
}

function formatUploadDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr || "";
  return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
}

async function fetchJSON(url) {
  const res = await fetch(url);
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

function skeletonGridHTML(count) {
  return Array.from({ length: count }, skeletonCardHTML).join("");
}

function skeletonRelatedHTML(count) {
  const row = `
    <div class="related-card">
      <div class="sk sk-thumb" style="width:168px;"></div>
      <div style="flex:1;">
        <div class="sk sk-line w90"></div>
        <div class="sk sk-line w60"></div>
      </div>
    </div>`;
  return Array.from({ length: count }, () => row).join("");
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
        ${c.like_count ? `<div class="likes">${icon("thumbsUp")}${c.like_count}</div>` : ""}
      </div>
    </div>`;
}

// ---------- ページごとの初期化 ----------

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

  // info + streamは並行で取りに行く
  const infoPromise = fetchJSON(`/proxy/info/${encodeURIComponent(videoId)}`);
  const streamPromise = fetchJSON(`/proxy/stream/${encodeURIComponent(videoId)}`);

  try {
    const [info, stream] = await Promise.all([infoPromise, streamPromise]);
    renderVideoInfo(infoBox, info);
    renderPlayer(playerWrap, stream, info);
    document.title = info.title ? `${info.title} - ${document.title.split(" - ").pop()}` : document.title;
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

function renderVideoInfo(box, info) {
  const channelLink = info.channel_id
    ? `<a href="/channel/${encodeURIComponent(info.channel_id)}">${escapeHtml(info.channel || info.uploader || "")}</a>`
    : escapeHtml(info.channel || info.uploader || "");

  const stats = [];
  if (info.view_count) stats.push(`<span class="stat-pill">${escapeHtml(formatViews(info.view_count))}</span>`);
  if (info.like_count) stats.push(`<span class="stat-pill">${icon("thumbsUp")}${info.like_count.toLocaleString("ja-JP")}</span>`);
  if (info.comment_count) stats.push(`<span class="stat-pill">${icon("comment")}${info.comment_count.toLocaleString("ja-JP")}</span>`);

  const chapters = (info.chapters || [])
    .map((c) => `<div class="chapter-row"><span class="ts">${escapeHtml(formatDuration(Math.floor(c.start_time || 0)))}</span><span>${escapeHtml(c.title || "")}</span></div>`)
    .join("");

  box.innerHTML = `
    <div class="video-title">${escapeHtml(info.title || "")}</div>
    <div class="video-owner-row">
      <div class="video-owner">
        <div class="avatar">${escapeHtml((info.channel || info.uploader || "?")[0] || "?")}</div>
        <div>
          <div class="name">${channelLink}</div>
          ${info.channel_follower_count ? `<div class="subs">${info.channel_follower_count.toLocaleString("ja-JP")} 人の登録者</div>` : ""}
        </div>
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
  const combined = streams
    .filter((s) => s.url && s.vcodec && s.vcodec !== "none" && s.acodec && s.acodec !== "none")
    .sort((a, b) => (b.height || 0) - (a.height || 0));
  const playableUrl = combined.length ? combined[0].url : null;
  const hlsUrl = stream.hls_url || null;

  if (!playableUrl && !hlsUrl) {
    wrap.innerHTML = '<div class="player-fallback">再生可能なフォーマットが見つかりませんでした。<br>(映像+音声が一体になったフォーマットが無い動画の可能性があります)</div>';
    return;
  }

  const posterAttr = info.thumbnail ? ` poster="${escapeHtml(info.thumbnail)}"` : "";
  wrap.innerHTML = `<video id="player" controls playsinline${posterAttr}></video>`;
  const videoEl = document.getElementById("player");

  if (playableUrl) {
    videoEl.src = playableUrl;
    return;
  }

  if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = hlsUrl;
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoEl);
  } else {
    // hls.jsが無い/未対応環境向けの最終手段としてリンクだけ出しておく
    wrap.innerHTML = `<div class="player-fallback">このブラウザではHLS再生に対応していません。<br><a href="${escapeHtml(hlsUrl)}">直接リンクを開く</a></div>`;
  }
}

async function initChannelPage(channelId) {
  const header = document.getElementById("channelHeader");
  const grid = document.getElementById("channelGrid");
  try {
    const data = await fetchJSON(`/proxy/channel/${encodeURIComponent(channelId)}?limit=30`);
    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
        <div class="avatar" style="width:64px;height:64px;border-radius:50%;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:24px;">
          ${escapeHtml((data.channel || "?")[0] || "?")}
        </div>
        <div>
          <div style="font-size:20px; font-weight:600;">${escapeHtml(data.channel || "")}</div>
          ${data.channel_follower_count ? `<div style="color:var(--text-secondary); font-size:13px;">${data.channel_follower_count.toLocaleString("ja-JP")} 人の登録者</div>` : ""}
        </div>
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

// ---------- サイドバー開閉(モバイル幅) ----------

function toggleSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

// ---------- ページごとの振り分け ----------

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const ds = document.body.dataset;

  if (page === "results") initResultsPage(ds.query || "");
  else if (page === "watch") initWatchPage(ds.videoId);
  else if (page === "channel") initChannelPage(ds.channelId);
  else if (page === "playlist") initPlaylistPage(ds.playlistId);
});

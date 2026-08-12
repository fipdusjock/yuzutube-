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
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12m0 0-4-4m4 4 4-4"/><path d="M4 19h16"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  playlistStack: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h12v2H3zM3 9h12v2H3zM3 13h8v2H3zM17 9v9l6-4.5z"/></svg>'
};

function icon(name) {
  return `<span class="icon">${ICONS[name] || ""}</span>`;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function linkifyText(str) {
  // 概要欄のURLをYouTube本家と同じようにクリック可能なリンクにする。
  // 先にHTMLエスケープしてから、URLパターンだけaタグに置き換える(XSS対策込み)。
  const escaped = escapeHtml(str);
  return escaped.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    const trimmed = url.replace(/[.,)]+$/, "");
    const trailing = url.slice(trimmed.length);
    return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer nofollow">${trimmed}</a>${trailing}`;
  });
}

function truncateText(str, maxLen) {
  if (!str) return "";
  const s = String(str);
  return s.length > maxLen ? s.slice(0, maxLen).trimEnd() + "..." : s;
}

function formatDuration(seconds) {
  if (!seconds) return "";
  seconds = Math.floor(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = seconds % 60;
  const pad = n => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatCountJa(n) {
  if (n === null || n === undefined) return "";
  const abs = Math.abs(n);
  if (abs < 1e4) return n.toLocaleString("ja-JP");
  if (abs < 1e8) {
    const val = n / 1e4;
    return (Number.isInteger(val) ? val : val.toFixed(1)) + "万";
  }
  const val = n / 1e8;
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

const API_BASE_KEY = "tubely_api_base";
const USE_NOCOOKIE_EMBED_KEY = "tubely_use_nocookie_embed";

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

const SUBS_KEY = "tubely_subscriptions";

const LIKES_KEY = "tubely_likes";
const LIKES_MIGRATION_FLAG_KEY = "tubely_likes_migrated_v2";

const HISTORY_KEY = "tubely_history";

function syncAccountDataOnLoad() {
  // ログイン中なら、サーバー側の登録チャンネル・いいねをローカルへ反映しておく。
  // これをしないと、別端末で登録/いいねした内容が、このボタンの状態(色が付くかどうか)に
  // 反映されないままになってしまう(書き込みだけ同期していて、読み込みが伴っていなかった)。
  fetch("/proxy/user/subscriptions")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      const subs = (data.subscriptions || []).map(s => ({ channel_id: s.channel_id, channel: s.channel, thumbnail: s.thumbnail }));
      setJSON(SUBS_KEY, subs);
    })
    .catch(() => {});

  fetch("/proxy/user/likes")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      const likes = (data.likes || []).map(l => ({
        video_id: l.video_id, title: l.title, thumbnail: l.thumbnail, channel: l.channel, duration: l.duration,
      }));
      setJSON(LIKES_KEY, likes);
    })
    .catch(() => {});

  fetch("/proxy/user/me")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const link = document.getElementById("adminModerationLink");
      if (link && data && data.is_owner) link.hidden = false;
    })
    .catch(() => {});
}

function migrateLikesIfNeeded() {
  // 以前のバージョンでは、いいねは動画IDの文字列配列だけで保存していて、
  // タイトルやサムネイルなどのメタ情報を持っていなかった。そのままだと
  // 「高く評価した動画」ページで情報が空欄・壊れて見えてしまうため、
  // 古い形式のデータが残っていたら一度だけ自動的にリセットする。
  if (localStorage.getItem(LIKES_MIGRATION_FLAG_KEY)) return;
  const raw = getJSON(LIKES_KEY, []);
  const isOldFormat = raw.some(item => typeof item === "string" || !item || !item.title);
  if (isOldFormat && raw.length) {
    setJSON(LIKES_KEY, []);
  }
  localStorage.setItem(LIKES_MIGRATION_FLAG_KEY, "1");
}

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
  return getJSON(SUBS_KEY, []).some(s => s.channel_id === channelId);
}

function syncToAccount(url, options) {
  fetch(url, options)
    .then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          console.warn(`アカウント同期に失敗しました (${url}):`, data.message || res.status);
        }).catch(() => {
          console.warn(`アカウント同期に失敗しました (${url}): HTTP ${res.status}`);
        });
      }
    })
    .catch((e) => {
      console.warn(`アカウント同期リクエスト自体が失敗しました (${url}):`, e.message);
    });
}

function toggleSubscribe(channelId, meta) {
  const subs = getJSON(SUBS_KEY, []);
  const idx = subs.findIndex(s => s.channel_id === channelId);
  if (idx >= 0) {
    subs.splice(idx, 1);
    setJSON(SUBS_KEY, subs);
    syncToAccount(`/proxy/user/subscriptions/${encodeURIComponent(channelId)}`, { method: "DELETE" });
    return false;
  }
  subs.unshift({
    channel_id: channelId,
    channel: meta.channel || "",
    thumbnail: meta.thumbnail || ""
  });
  setJSON(SUBS_KEY, subs);
  syncToAccount("/proxy/user/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel_id: channelId, channel: meta.channel || "", thumbnail: meta.thumbnail || "" }),
  });
  return true;
}

function isLiked(videoId) {
  return getJSON(LIKES_KEY, []).some(l => (typeof l === "string" ? l : l.video_id) === videoId);
}

function toggleLike(videoId, meta) {
  const likes = getJSON(LIKES_KEY, []);
  const idx = likes.findIndex(l => (typeof l === "string" ? l : l.video_id) === videoId);
  if (idx >= 0) {
    likes.splice(idx, 1);
    setJSON(LIKES_KEY, likes);
    syncToAccount(`/proxy/user/likes/${encodeURIComponent(videoId)}`, { method: "DELETE" });
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
  syncToAccount("/proxy/user/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      video_id: videoId,
      title: (meta && meta.title) || "",
      thumbnail: (meta && meta.thumbnail) || "",
      channel: (meta && meta.channel) || "",
      duration: (meta && meta.duration) || null,
    }),
  });
  return true;
}

function addHistory(entry) {
  let hist = getJSON(HISTORY_KEY, []);
  hist = hist.filter(h => h.video_id !== entry.video_id);
  hist.unshift({
    ...entry,
    watched_at: Date.now()
  });
  if (hist.length > 200) hist = hist.slice(0, 200);
  setJSON(HISTORY_KEY, hist);
}

function subscribeButtonHTML(channelId, channelName, thumbnail) {
  if (!channelId) return "";
  const subscribed = isSubscribed(channelId);
  return `<button class="subscribe-btn ${subscribed ? "subscribed" : ""}"\n    data-action="toggle-subscribe"\n    data-channel-id="${escapeHtml(channelId)}"\n    data-channel-name="${escapeHtml(channelName || "")}"\n    data-channel-thumb="${escapeHtml(thumbnail || "")}">\n    ${subscribed ? "登録済み" : "チャンネル登録"}\n  </button>`;
}

function likeButtonHTML(videoId, likeCount, meta) {
  const liked = isLiked(videoId);
  const countText = likeCount ? formatCountJa(likeCount) : "";
  const m = meta || {};
  const activeStyle = liked ? "color:var(--accent);" : "";
  return `<button class="stat-pill like-btn ${liked ? "active" : ""}" data-action="toggle-like" style="${activeStyle}"\n    data-video-id="${escapeHtml(videoId)}"\n    data-title="${escapeHtml(m.title || "")}"\n    data-thumbnail="${escapeHtml(m.thumbnail || "")}"\n    data-channel="${escapeHtml(m.channel || "")}"\n    data-duration="${escapeHtml(m.duration || "")}">\n    ${icon("thumbsUp")}${countText}\n  </button>`;
}

document.addEventListener("pointerup", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  if (btn.dataset.action === "toggle-subscribe") {
    const nowSubscribed = toggleSubscribe(btn.dataset.channelId, {
      channel: btn.dataset.channelName,
      thumbnail: btn.dataset.channelThumb
    });
    btn.classList.toggle("subscribed", nowSubscribed);
    btn.textContent = nowSubscribed ? "登録済み" : "チャンネル登録";
  }
  if (btn.dataset.action === "toggle-like") {
    const nowLiked = toggleLike(btn.dataset.videoId, {
      title: btn.dataset.title,
      thumbnail: btn.dataset.thumbnail,
      channel: btn.dataset.channel,
      duration: btn.dataset.duration ? Number(btn.dataset.duration) : null,
    });
    btn.classList.toggle("active", nowLiked);
    btn.style.color = nowLiked ? "var(--accent)" : "";
  }
});

function skeletonCardHTML() {
  return `\n    <div class="card sk-card">\n      <div class="sk sk-thumb"></div>\n      <div class="meta">\n        <div class="sk sk-circle"></div>\n        <div style="flex:1;">\n          <div class="sk sk-line w90"></div>\n          <div class="sk sk-line w40"></div>\n        </div>\n      </div>\n    </div>`;
}

function skeletonGridHTML(count) {
  return Array.from({
    length: count
  }, skeletonCardHTML).join("");
}

function playlistCardHTML(e) {
  const count = e.video_count ? `${e.video_count}本の動画` : "再生リスト";
  return `\n    <a class="card playlist-card" href="/playlist?list=${encodeURIComponent(e.video_id)}">
      <div class="thumb-wrap">
        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}
        <span class="playlist-badge">${icon("playlistStack")}${escapeHtml(count)}</span>
      </div>
      <div class="meta">
        <div style="flex:1;">
          <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>
          <div class="sub">再生リストの全体を見る</div>
        </div>
      </div>
    </a>`;
}

function videoCardHTML(e, watchHref, options) {
  if (e.entry_type === "playlist") return playlistCardHTML(e);
  const vertical = options && options.vertical;
  const isLive = e.live_status === "is_live";
  const badge = isLive ? `<span class="duration live-badge">LIVE</span>` : e.duration ? `<span class="duration">${escapeHtml(formatDuration(e.duration))}</span>` : "";
  const views = e.view_count ? formatViews(e.view_count) : e.view_count_text || "";
  const avatarHTML = e.channel_thumbnail ? `<img src="${escapeHtml(e.channel_thumbnail)}" alt="" loading="lazy">` : escapeHtml((e.channel || "?")[0] || "?");
  return `\n    <a class="card ${vertical ? "card-vertical" : ""}" href="${watchHref}">\n      <div class="thumb-wrap ${vertical ? "thumb-wrap-vertical" : ""}">\n        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}\n        ${badge}\n      </div>\n      <div class="meta">\n        <div class="avatar">${avatarHTML}</div>\n        <div>\n          <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>\n          <div class="sub">${escapeHtml(e.channel || "")}${isLive ? "" : views ? " &middot; " + escapeHtml(views) : ""}</div>\n        </div>\n      </div>\n    </a>`;
}

function relatedCardHTML(e) {
  if (e.entry_type === "playlist") {
    const count = e.video_count ? `${e.video_count}本の動画` : "再生リスト";
    return `\n    <a class="related-card" href="/playlist?list=${encodeURIComponent(e.video_id)}">\n      <div class="thumb-wrap" style="width:168px;">\n        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}\n        <span class="playlist-badge">${icon("playlistStack")}${escapeHtml(count)}</span>\n      </div>\n      <div>\n        <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>\n        <div class="sub">再生リストの全体を見る</div>\n      </div>\n    </a>`;
  }
  return `\n    <a class="related-card" href="/watch?v=${encodeURIComponent(e.video_id)}">\n      <div class="thumb-wrap" style="width:168px;">\n        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}\n        ${e.length_text ? `<span class="duration">${escapeHtml(e.length_text)}</span>` : ""}\n      </div>\n      <div>\n        <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>\n        <div class="sub">${escapeHtml(e.channel || "")}${e.view_count_text ? "<br>" + escapeHtml(e.view_count_text) : ""}</div>\n      </div>\n    </a>`;
}

function commentRowHTML(c) {
  const avatarHTML = c.author_thumbnail ? `<img src="${escapeHtml(c.author_thumbnail)}" alt="" loading="lazy">` : escapeHtml((c.author || "?")[0] || "?");
  return `\n    <div class="comment-row">\n      <div class="avatar">${avatarHTML}</div>\n      <div style="flex:1;">\n        <div>\n          <span class="author">${escapeHtml(c.author || "")}</span>\n          <span class="time">${escapeHtml(c.time_text || "")}</span>\n        </div>\n        <div class="text">${escapeHtml(c.text || "")}</div>\n        ${c.like_count ? `<div class="likes">${icon("thumbsUp")}${formatCountJa(c.like_count)}</div>` : ""}\n      </div>\n    </div>`;
}

async function initIndexPage() {
  const grid = document.getElementById("trendingGrid");
  const updatedBox = document.getElementById("trendingUpdated");
  const tabsBox = document.getElementById("trendingTabs");
  let currentCategory = "trending";

  function formatUpdated(isoString) {
    if (!isoString) return "";
    const updatedAt = new Date(isoString);
    const diffMin = Math.floor((Date.now() - updatedAt.getTime()) / 60000);
    if (diffMin < 1) return "更新中…";
    if (diffMin < 60) return `${diffMin}分前に更新`;
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour}時間前に更新`;
  }

  async function load() {
    grid.innerHTML = skeletonGridHTML(12);
    if (updatedBox) updatedBox.textContent = "更新中…";
    try {
      const data = await fetchJSON(`/proxy/trending?limit=24&category=${encodeURIComponent(currentCategory)}`);
      const entries = data.entries || [];
      grid.innerHTML = entries.length ? entries.map(e => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("") : '<div class="empty-state">動画が見つかりませんでした。</div>';
      if (updatedBox) updatedBox.textContent = formatUpdated(data.updated);
    } catch (e) {
      showError(grid.parentElement, e.message);
      if (updatedBox) updatedBox.textContent = "";
    }
  }

  if (tabsBox) {
    tabsBox.querySelectorAll(".trending-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.category === currentCategory) return;
        tabsBox.querySelectorAll(".trending-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        load();
      });
    });
  }

  load();
}

function setupInfiniteScroll(sentinelParent, onIntersect) {
  const sentinel = document.createElement("div");
  sentinel.style.height = "1px";
  sentinelParent.appendChild(sentinel);
  let loading = false;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading) {
      loading = true;
      Promise.resolve(onIntersect()).finally(() => { loading = false; });
    }
  }, { rootMargin: "600px" });
  observer.observe(sentinel);
  return { sentinel, observer };
}

async function initResultsPage(query) {
  const grid = document.getElementById("resultsGrid");
  let nextContinuation = null;
  let scrollHandle = null;

  async function load() {
    try {
      const data = await fetchJSON(`/proxy/search?q=${encodeURIComponent(query)}&limit=24`);
      const entries = data.entries || [];
      nextContinuation = data.next_continuation || null;
      if (!entries.length) {
        grid.innerHTML = '<div class="empty-state">見つかりませんでした。別のキーワードで試してみてください。</div>';
        return;
      }
      grid.innerHTML = entries.map(e => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("");
      if (nextContinuation && !scrollHandle) {
        scrollHandle = setupInfiniteScroll(grid.parentElement, async () => {
          if (!nextContinuation) return;
          try {
            const data2 = await fetchJSON(`/proxy/search?q=${encodeURIComponent(query)}&limit=24&continuation=${encodeURIComponent(nextContinuation)}`);
            const more = data2.entries || [];
            nextContinuation = data2.next_continuation || null;
            if (more.length) {
              grid.insertAdjacentHTML("beforeend", more.map(e => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join(""));
            }
          } catch (e) {
            nextContinuation = null;
          }
        });
      }
    } catch (e) {
      showError(grid.parentElement, e.message);
    }
  }

  await load();
}

async function initWatchPage(videoId) {
  const infoBox = document.getElementById("videoInfo");
  const relatedBox = document.getElementById("relatedList");
  const commentsBox = document.getElementById("commentsList");
  const playerWrap = document.getElementById("playerWrap");
  const liveChatPanel = document.getElementById("liveChatPanel");
  const liveChatBox = document.getElementById("liveChatBox");
  // 以前は /api/info と /api/stream を毎回両方叩いていたが、バックエンド側が
  // /api/stream の中にinfo相当の情報も含めて返すようになったため、1回で済ませられる
  // (yt-dlp側の重い抽出処理・Node.jsでの署名解読が動画1本につき2回走っていたのを
  // 1回に減らせる)。
  const useNocookieEmbed = localStorage.getItem(USE_NOCOOKIE_EMBED_KEY) === "1";

  const streamPromise = fetchJSON(`/proxy/stream/${encodeURIComponent(videoId)}`);
  try {
    const stream = await streamPromise;
    const info = stream;
    renderVideoInfo(infoBox, info, videoId);
    if (useNocookieEmbed) {
      renderNocookieEmbed(playerWrap, videoId);
    } else {
      renderPlayer(playerWrap, stream, info);
    }
    document.title = info.title ? `${info.title} - ${document.title.split(" - ").pop()}` : document.title;
    addHistory({
      video_id: videoId,
      title: info.title || "",
      channel: info.channel || info.uploader || "",
      channel_thumbnail: info.channel_avatar_base64 || info.channel_avatar || "",
      thumbnail: info.thumbnail || "",
      duration: info.duration || null
    });
    // 視聴履歴に記録(失敗しても無視してよい)
    fetch("/proxy/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: videoId,
        title: info.title || "",
        channel: info.channel || info.uploader || "",
        channel_id: info.channel_id || "",
        channel_thumbnail: info.channel_avatar_base64 || info.channel_avatar || "",
        thumbnail: info.thumbnail || "",
        duration: info.duration || null,
      }),
    }).catch(() => {});
    if (info.is_live && liveChatPanel && liveChatBox) {
      liveChatPanel.style.display = "block";
      liveChatBox.innerHTML = '<div class="chat-note">チャットを読み込み中...</div>';
      fetchJSON(`/proxy/livechat/${encodeURIComponent(videoId)}?limit=200`).then(data => {
        const messages = data.messages || [];
        liveChatBox.innerHTML = '<div class="chat-note">試験的な機能です。配信全体のチャット履歴ではなく、取得できた範囲のみ表示しています。</div>' + (messages.length ? messages.map(m => `<div class="chat-row"><span class="author">${escapeHtml(m.author || "")}</span>${escapeHtml(m.text || "")}</div>`).join("") : '<div class="chat-note">チャットを取得できませんでした。</div>');
      }).catch(() => {
        liveChatPanel.style.display = "none";
      });
    }
  } catch (e) {
    if (useNocookieEmbed) {
      renderNocookieEmbed(playerWrap, videoId);
      showError(infoBox, `動画の詳細情報は取得できませんでしたが、再生だけは試せます: ${e.message}`);
    } else {
      showError(infoBox, e.message);
      playerWrap.innerHTML = `<div class="player-fallback">${escapeHtml(e.message)}</div>`;
    }
  }
  fetchJSON(`/proxy/related/${encodeURIComponent(videoId)}?limit=15`).then(data => {
    const entries = data.entries || [];
    relatedBox.innerHTML = entries.length ? entries.map(relatedCardHTML).join("") : '<div class="empty-state">関連動画はありません</div>';
  }).catch(e => showError(relatedBox, e.message));
  fetchJSON(`/proxy/comments/${encodeURIComponent(videoId)}?limit=30`).then(data => {
    const comments = data.comments || [];
    const titleEl = document.getElementById("commentsTitle");
    if (titleEl && data.comment_count_total) {
      titleEl.textContent = `コメント ${Number(data.comment_count_total).toLocaleString()}`;
    }
    commentsBox.innerHTML = comments.length ? comments.map(commentRowHTML).join("") : '<div class="empty-state">コメントはありません(またはコメント欄が無効です)</div>';
  }).catch(e => showError(commentsBox, e.message));
}

function renderVideoInfo(box, info, videoId) {
  const channelName = info.channel || info.uploader || "";
  const channelLink = info.channel_id ? `<a href="/channel/${encodeURIComponent(info.channel_id)}">${escapeHtml(channelName)}</a>` : escapeHtml(channelName);
  const ownerAvatarSrc = info.channel_avatar_base64 || info.channel_avatar;
  const ownerAvatarHTML = ownerAvatarSrc ? `<img src="${escapeHtml(ownerAvatarSrc)}" alt="" loading="lazy">` : escapeHtml((channelName || "?")[0] || "?");
  const stats = [];
  if (info.view_count) stats.push(`<span class="stat-pill">${escapeHtml(formatViews(info.view_count))}</span>`);
  stats.push(likeButtonHTML(videoId, info.like_count, {
    title: info.title,
    thumbnail: info.thumbnail,
    channel: channelName,
    duration: info.duration,
  }));
  if (info.comment_count) stats.push(`<span class="stat-pill">${icon("comment")}${formatCountJa(info.comment_count)}</span>`);
  stats.push(`<button type="button" class="stat-pill" id="shareBtn">${icon("share")}共有</button>`);
  stats.push(`<button type="button" class="stat-pill" id="savePlaylistBtn">${icon("playlistStack")}保存</button>`);
  const chapters = (info.chapters || []).map(c => `<div class="chapter-row"><span class="ts">${escapeHtml(formatDuration(Math.floor(c.start_time || 0)))}</span><span>${escapeHtml(c.title || "")}</span></div>`).join("");
  const descStatBoxes = `
    <div class="desc-stat-grid">
      ${info.like_count ? `<div class="desc-stat-box"><div class="desc-stat-num">${escapeHtml(formatCountJa(info.like_count))}</div><div class="desc-stat-label">高評価数</div></div>` : ""}
      ${info.view_count ? `<div class="desc-stat-box"><div class="desc-stat-num">${escapeHtml(String(info.view_count).length > 9 ? formatCountJa(info.view_count) : Number(info.view_count).toLocaleString())}</div><div class="desc-stat-label">視聴回数</div></div>` : ""}
      ${info.upload_date ? `<div class="desc-stat-box"><div class="desc-stat-num">${escapeHtml(formatUploadDate(info.upload_date))}</div><div class="desc-stat-label">投稿日</div></div>` : ""}
    </div>`;
  box.innerHTML = `\n    <div class="video-title">${escapeHtml(truncateText(info.title || "", 150))}</div>\n    <div class="video-meta-row">\n      <div class="video-owner">\n        <div class="avatar">${ownerAvatarHTML}</div>\n        <div class="video-owner-info">\n          <div class="name">${channelLink}</div>\n          ${info.channel_follower_count ? `<div class="subs">${formatCountJa(info.channel_follower_count)} 人の登録者</div>` : ""}\n        </div>\n      </div>\n      ${subscribeButtonHTML(info.channel_id, channelName, ownerAvatarSrc)}\n    </div>\n    <div class="video-stats-row">${stats.join("")}</div>\n    <div class="description-box" id="descriptionBox">\n      ${descStatBoxes}\n      <div class="description-inner">\n        <div class="description-text">${info.description ? linkifyText(info.description) : "(説明文なし)"}</div>\n        ${chapters ? `<div class="chapters"><div style="font-weight:600; margin-bottom:6px;">チャプター</div>${chapters}</div>` : ""}\n      </div>\n      <button type="button" class="desc-toggle-btn" id="descToggleBtn">もっと見る</button>\n    </div>`;
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareUrl = `${window.location.origin}/watch?v=${encodeURIComponent(videoId)}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: info.title || "", url: shareUrl });
        } catch (e) {
          // ユーザーがシェアシートを閉じただけの場合もここに来るので、何もしない
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        shareBtn.innerHTML = `${icon("check")}コピーしました`;
        setTimeout(() => { shareBtn.innerHTML = `${icon("share")}共有`; }, 1800);
      } catch (e) {
        window.prompt("このURLをコピーしてください", shareUrl);
      }
    });
  }
  const savePlaylistBtn = document.getElementById("savePlaylistBtn");
  if (savePlaylistBtn) {
    savePlaylistBtn.addEventListener("click", () => {
      openSavePlaylistModal(videoId, {
        title: info.title || "",
        thumbnail: info.thumbnail || "",
        channel: channelName || "",
        duration: info.duration || null,
      });
    });
  }
  const descBox = box.querySelector("#descriptionBox");
  const descToggleBtn = box.querySelector("#descToggleBtn");
  if (descBox && descToggleBtn) {
    descBox.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const expanded = descBox.classList.toggle("expanded");
      descToggleBtn.textContent = expanded ? "閉じる" : "もっと見る";
    });
  }
}

function mediaProxyUrl(videoId, formatId) {
  return `/media/${encodeURIComponent(videoId)}?format_id=${encodeURIComponent(formatId)}`;
}

function openSavePlaylistModal(videoId, meta) {
  const existing = document.getElementById("savePlaylistModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "savePlaylistModal";
  modal.className = "announcement-modal";
  modal.innerHTML = `
    <div class="announcement-backdrop" id="savePlaylistBackdrop"></div>
    <div class="announcement-box save-playlist-box">
      <div class="announcement-title">プレイリストに保存</div>
      <div id="savePlaylistList" class="save-playlist-list"><div class="empty-state">読み込み中…</div></div>
      <div class="save-playlist-new-row">
        <input type="text" id="savePlaylistNewName" maxlength="20" placeholder="新しいプレイリスト名(20文字まで)">
        <button type="button" class="page-settings-btn" id="savePlaylistCreateBtn">作成</button>
      </div>
      <button type="button" class="announcement-close-btn" id="savePlaylistCloseBtn">閉じる</button>
    </div>`;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  document.getElementById("savePlaylistBackdrop").addEventListener("click", close);
  document.getElementById("savePlaylistCloseBtn").addEventListener("click", close);

  function loadPlaylists() {
    fetch("/proxy/playlists")
      .then((res) => res.json())
      .then((data) => {
        const playlists = data.playlists || [];
        const listBox = document.getElementById("savePlaylistList");
        if (!listBox) return;
        if (!playlists.length) {
          listBox.innerHTML = '<div class="empty-state">プレイリストがまだありません。下から作成してください</div>';
          return;
        }
        listBox.innerHTML = playlists.map((p) => `
          <label class="save-playlist-item">
            <input type="checkbox" class="save-playlist-checkbox" data-playlist-id="${p.id}">
            <span>${escapeHtml(p.name)}</span>
            <span class="save-playlist-item-count">${p.video_count}本</span>
          </label>`).join("");

        listBox.querySelectorAll(".save-playlist-checkbox").forEach((checkbox) => {
          // 既にそのプレイリストに入っているかを確認してチェック状態を初期化する
          fetch(`/proxy/playlists/${checkbox.dataset.playlistId}`)
            .then((res) => res.json())
            .then((detail) => {
              const already = (detail.videos || []).some((v) => v.video_id === videoId);
              checkbox.checked = already;
            })
            .catch(() => {});

          checkbox.addEventListener("change", () => {
            const playlistId = checkbox.dataset.playlistId;
            if (checkbox.checked) {
              fetch(`/proxy/playlists/${playlistId}/videos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ video_id: videoId, ...meta }),
              }).then((res) => res.json()).then((data) => {
                if (data.message || data.detail) {
                  alert(data.message || data.detail);
                  checkbox.checked = false;
                }
              }).catch(() => { checkbox.checked = false; });
            } else {
              fetch(`/proxy/playlists/${playlistId}/videos/${encodeURIComponent(videoId)}`, { method: "DELETE" }).catch(() => {});
            }
          });
        });
      })
      .catch(() => {
        const listBox = document.getElementById("savePlaylistList");
        if (listBox) listBox.innerHTML = '<div class="empty-state">読み込みに失敗しました</div>';
      });
  }

  document.getElementById("savePlaylistCreateBtn").addEventListener("click", () => {
    const nameInput = document.getElementById("savePlaylistNewName");
    const name = nameInput.value.trim();
    if (!name) return;
    fetch("/proxy/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          alert(data.message || data.detail || "作成に失敗しました");
          return;
        }
        nameInput.value = "";
        // 作成したプレイリストにこの動画も一緒に入れておく
        return fetch(`/proxy/playlists/${data.id}/videos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_id: videoId, ...meta }),
        }).then(() => loadPlaylists());
      })
      .catch(() => alert("作成に失敗しました(通信エラー)"));
  });

  loadPlaylists();
}

function renderNocookieEmbed(wrap, videoId) {
  wrap.innerHTML = `
    <div class="nocookie-player">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>
    </div>`;
}

function renderPlayer(wrap, stream, info) {
  const videoId = stream.video_id;
  const isLive = !!(info.is_live || stream.is_live || info.live_status === "is_live");
  const urlParams = new URLSearchParams(window.location.search);
  const listParam = urlParams.get("list") || "";
  const indexParam = parseInt(urlParams.get("index") || "0", 10);
  const playlistContext = listParam.startsWith("my:") ? { playlistId: listParam.slice(3), index: indexParam } : null;
  const streams = stream.streams || [];
  const combined = streams.filter(s => s.url && s.vcodec && s.vcodec !== "none" && s.acodec && s.acodec !== "none");
  const videoOnly = streams.filter(s => s.url && s.vcodec && s.vcodec !== "none" && (!s.acodec || s.acodec === "none"));
  const audioOnly = streams.filter(s => s.url && (!s.vcodec || s.vcodec === "none") && s.acodec && s.acodec !== "none");
  const hlsUrl = stream.hls_url || null;
  const byHeight = new Map;
  combined.forEach(s => {
    const h = s.height || 0;
    const existing = byHeight.get(h);
    if (!existing || (s.tbr || 0) > (existing.tbr || 0)) byHeight.set(h, {
      ...s,
      needsAudioSync: false
    });
  });
  videoOnly.forEach(s => {
    const h = s.height || 0;
    if (!byHeight.has(h)) byHeight.set(h, {
      ...s,
      needsAudioSync: true
    });
  });
  const qualities = Array.from(byHeight.values()).sort((a, b) => (b.height || 0) - (a.height || 0));
  const bestAudio = audioOnly.slice().sort((a, b) => (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0))[0] || null;
  const subtitleOptions = [ ...(info.subtitles_languages || []).map(l => ({
    lang: l,
    auto: false,
    label: l
  })), ...(info.automatic_captions_languages || []).map(l => ({
    lang: l,
    auto: true,
    label: `${l} (自動生成)`
  })) ];
  if (!qualities.length && !hlsUrl) {
    wrap.innerHTML = '<div class="player-fallback">再生可能なフォーマットが見つかりませんでした。<br>(映像+音声が一体になったフォーマットが無い動画の可能性があります)</div>';
    return;
  }
  const defaultQuality = qualities.find(q => q.format_id === "18") || qualities[0] || null;
  const posterAttr = info.thumbnail ? ` poster="${escapeHtml(info.thumbnail)}"` : "";
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const qualityMenuHTML = qualities.map(q => {
    const label = q.height ? `${q.height}p${q.fps && q.fps > 30 ? q.fps : ""}` : (q.format_note || q.format_id || "?");
    const isDefault = defaultQuality && q.format_id === defaultQuality.format_id;
    return `<button type="button" class="settings-row settings-option" data-quality="${escapeHtml(q.format_id)}" data-selected="${isDefault ? "1" : "0"}"><span class="settings-check">${isDefault ? icon("check") : ""}</span><span>${escapeHtml(label)}${q.format_id === "18" ? " (標準)" : ""}</span></button>`;
  }).join("");
  const speedMenuHTML = speedOptions.map(s => {
    const label = s === 1 ? "標準" : `${s}`;
    return `<button type="button" class="settings-row settings-option" data-speed="${s}" data-selected="${s === 1 ? "1" : "0"}"><span class="settings-check">${s === 1 ? icon("check") : ""}</span><span>${label}</span></button>`;
  }).join("");
  const subtitleMenuHTML = subtitleOptions.length ? [
    `<button type="button" class="settings-row settings-option" data-sub="off" data-selected="1"><span class="settings-check">${icon("check")}</span><span>オフ</span></button>`,
    ...subtitleOptions.map((s, i) => `<button type="button" class="settings-row settings-option" data-sub="${i}" data-selected="0"><span class="settings-check"></span><span>${escapeHtml(s.label)}</span></button>`),
  ].join("") : "";

  wrap.innerHTML = `
    <div class="custom-player" id="customPlayer">
      <video id="player" playsinline${posterAttr}></video>
      <div class="player-spinner" id="playerSpinner"><div class="spinner-circle"></div></div>
      <div class="speed-indicator" id="speedIndicator">${icon("play")}<span>2倍速で再生中</span></div>
      <div class="seek-tap-zone seek-tap-zone-left" id="seekTapLeft">
        <div class="seek-tap-ring"><span class="seek-tap-arrows">${icon("chevronRight")}${icon("chevronRight")}</span><span class="seek-tap-label">10 秒</span></div>
      </div>
      <div class="seek-tap-zone seek-tap-zone-right" id="seekTapRight">
        <div class="seek-tap-ring"><span class="seek-tap-arrows">${icon("chevronRight")}${icon("chevronRight")}</span><span class="seek-tap-label">10 秒</span></div>
      </div>
      <div class="player-controls">
        <input type="range" class="seek-bar" id="seekBar" min="0" max="100" value="0" step="0.1">
        <div class="controls-row">
          <button class="ctrl-btn" id="playPauseBtn" aria-label="再生">${icon("play")}</button>
          <div class="time-display"><span id="curTime">0:00</span>&nbsp;/&nbsp;<span id="durTime">0:00</span></div>
          <div class="spacer"></div>
          <button class="ctrl-btn" id="muteBtn" aria-label="ミュート切替">${icon("volume")}</button>
          <input type="range" class="volume-bar" id="volumeBar" min="0" max="100" value="100" aria-label="音量">
          <button class="ctrl-btn" id="settingsBtn" aria-label="設定">${icon("gear")}</button>
          <button class="ctrl-btn" id="fullscreenBtn" aria-label="全画面表示">${icon("fullscreen")}</button>
        </div>
      </div>

      <div class="settings-menu" id="settingsMenu" hidden>
        <div class="settings-panel" data-panel="main">
          ${qualities.length >= 1 ? `<button type="button" class="settings-row" data-open="quality"><span>画質</span><span class="settings-row-right"><span class="settings-row-value" id="qualityValueLabel">${escapeHtml(defaultQuality ? (defaultQuality.height ? defaultQuality.height + "p" : "?") : "?")}</span>${icon("chevronRight")}</span></button>` : ""}
          <button type="button" class="settings-row" data-open="speed"><span>再生速度</span><span class="settings-row-right"><span class="settings-row-value" id="speedValueLabel">標準</span>${icon("chevronRight")}</span></button>
          ${subtitleOptions.length ? `<button type="button" class="settings-row" data-open="subtitles"><span>字幕</span><span class="settings-row-right"><span class="settings-row-value" id="subtitleValueLabel">オフ</span>${icon("chevronRight")}</span></button>` : ""}
          <button type="button" class="settings-row" data-open="info"><span>動画情報</span><span class="settings-row-right">${icon("chevronRight")}</span></button>
          <button type="button" class="settings-row" id="loopToggleBtn"><span>ループ再生</span><span class="settings-row-right"><span class="settings-row-value" id="loopValueLabel">オフ</span></span></button>
          ${playlistContext ? `<button type="button" class="settings-row" id="autoplayToggleBtn"><span>自動再生</span><span class="settings-row-right"><span class="settings-row-value" id="autoplayValueLabel">オン</span></span></button>` : ""}
          <a class="settings-row" id="downloadLink" href="${mediaProxyUrl(videoId, (defaultQuality || {}).format_id || "18")}&download=1" download><span>ダウンロード</span></a>
        </div>
        <div class="settings-panel" data-panel="quality" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>画質</span></button>
          ${qualityMenuHTML}
        </div>
        <div class="settings-panel" data-panel="speed" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>再生速度</span></button>
          ${speedMenuHTML}
        </div>
        <div class="settings-panel" data-panel="subtitles" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>字幕</span></button>
          ${subtitleMenuHTML}
        </div>
        <div class="settings-panel" data-panel="info" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>動画情報</span></button>
          <div class="settings-info-box" id="videoInfoPanel">読み込み中...</div>
        </div>
      </div>
    </div>`;
  const videoEl = document.getElementById("player");
  const playerRoot = document.getElementById("customPlayer");
  const syncState = {
    audioEl: null,
    intervalId: null
  };
  function stopAudioSync() {
    if (syncState.intervalId) {
      clearInterval(syncState.intervalId);
      syncState.intervalId = null;
    }
    if (syncState.audioEl) {
      syncState.audioEl.pause();
      syncState.audioEl.remove();
      syncState.audioEl = null;
    }
  }
  function attachWithFallback(el, directUrl, formatId) {
    // 以前はCDN直リンクが失敗した時だけサーバー経由のプロキシに切り替えていたが、
    // 画質を変えるたびに毎回「直リンクの失敗を待つ」オーバーヘッドが乗って重く
    // 感じられていたため、プロキシ経由はやめて常に直リンクだけを使う方式にした。
    el.src = directUrl || mediaProxyUrl(videoId, formatId);
  }
  function startAudioSync(audioQuality) {
    stopAudioSync();
    if (!audioQuality) return;
    const audioEl = document.createElement("audio");
    audioEl.preload = "auto";
    audioEl.style.display = "none";
    audioEl.volume = videoEl.volume;
    audioEl.muted = videoEl.muted;
    playerRoot.appendChild(audioEl);
    syncState.audioEl = audioEl;
    attachWithFallback(audioEl, audioQuality.url, audioQuality.format_id);
    const resync = () => {
      if (!syncState.audioEl) return;
      const audioEl = syncState.audioEl;
      // 映像・音声のどちらかがまだバッファリング中(ネットワーク待ち)の時に
      // ドリフト補正をかけると、ズレの数値自体が「バッファ待ちで進んでいない
      // だけ」の誤検知になり、無駄なジャンプ・音切れの原因になっていた。
      // readyState 3(HAVE_FUTURE_DATA)未満、つまりこの先再生を続けられる
      // データがまだ揃っていない状態の時は、補正を1回休む。
      if (videoEl.readyState < 3 || audioEl.readyState < 3) return;
      const drift = videoEl.currentTime - audioEl.currentTime;
      const absDrift = Math.abs(drift);
      if (absDrift > 2) {
        // 大きくズレた場合のみ、シーク(currentTime代入)で瞬間移動させる。
        // シークはブラウザ内部でのデコードやり直しが発生し、必ず一瞬の
        // 音切れを伴うため、閾値を高めにして頻発しないようにしている。
        audioEl.currentTime = videoEl.currentTime;
        audioEl.playbackRate = 1;
      } else if (absDrift > .3) {
        // 小さなズレは、playbackRateをわずかに変えて滑らかに追従させる
        // (シークを伴わないので音切れしない)。
        audioEl.playbackRate = drift > 0 ? 1.03 : .97;
      } else {
        audioEl.playbackRate = 1;
      }
    };
    // 500ms間隔だと、ちょっとした回線の揺らぎにも過敏に反応してジャンプ
    // しがちだったため、1000ms間隔に緩和した。
    syncState.intervalId = setInterval(resync, 1000);
  }
  function loadSource(quality, resumePlayback) {
    stopAudioSync();
    const wasPlaying = resumePlayback && !videoEl.paused;
    const resumeTime = resumePlayback ? videoEl.currentTime : 0;
    attachWithFallback(videoEl, quality.url, quality.format_id);
    if (quality.needsAudioSync && bestAudio) {
      startAudioSync(bestAudio);
    }
    const onMeta = () => {
      if (resumePlayback) videoEl.currentTime = resumeTime;
      if (wasPlaying) {
        videoEl.play().catch(() => {});
        if (syncState.audioEl) syncState.audioEl.play().catch(() => {});
      }
      videoEl.removeEventListener("loadedmetadata", onMeta);
    };
    videoEl.addEventListener("loadedmetadata", onMeta);
  }
  if (defaultQuality) {
    loadSource(defaultQuality, false);
  } else if (hlsUrl) {
    attachHlsSource(videoEl, hlsUrl);
  }
  wireCustomPlayerControls(videoEl, playerRoot, syncState, playlistContext, videoId, isLive);

  // ---------- 歯車メニュー ----------
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsMenu = document.getElementById("settingsMenu");
  const qualityValueLabel = document.getElementById("qualityValueLabel");
  const speedValueLabel = document.getElementById("speedValueLabel");
  const subtitleValueLabel = document.getElementById("subtitleValueLabel");
  const downloadLink = document.getElementById("downloadLink");
  let currentTrackEl = null;
  let currentFormatId = defaultQuality ? defaultQuality.format_id : null;

  // iOS Safariは<a download>属性をほぼ無視する(タップすると別タブで開くだけで
  // 保存されない)ため、fetchでBlobとして取得してから保存させる方式に切り替える。
  // 他のブラウザでもこの方式は問題なく動くので、iOS判定はせず常にこちらを使う。
  if (downloadLink) {
    downloadLink.addEventListener("click", (e) => {
      e.preventDefault();
      const url = downloadLink.href;
      const originalText = downloadLink.textContent;
      downloadLink.textContent = "ダウンロード準備中…";
      downloadLink.style.pointerEvents = "none";
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const contentDisposition = res.headers.get("Content-Disposition") || "";
          const match = contentDisposition.match(/filename="?([^";]+)"?/);
          const filename = match ? match[1] : `${videoId}.mp4`;
          return res.blob().then((blob) => ({ blob, filename }));
        })
        .then(({ blob, filename }) => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        })
        .catch(() => {
          // Blob方式が何らかの理由で失敗した場合は、素直に新しいタブで開く
          // (それでも保存できないブラウザも一部あるが、最低限視聴はできる)
          window.open(url, "_blank");
        })
        .finally(() => {
          downloadLink.textContent = originalText;
          downloadLink.style.pointerEvents = "";
        });
    });
  }

  function showPanel(name) {
    settingsMenu.querySelectorAll(".settings-panel").forEach(p => {
      p.hidden = p.dataset.panel !== name;
    });
  }

  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = settingsMenu.hidden;
      settingsMenu.hidden = !willOpen;
      if (willOpen) showPanel("main");
    });
    document.addEventListener("click", (e) => {
      if (!settingsMenu.hidden && !settingsMenu.contains(e.target) && e.target !== settingsBtn) {
        settingsMenu.hidden = true;
      }
    });
    settingsMenu.querySelectorAll("[data-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.dataset.open;
        showPanel(panel);
        if (panel === "info") renderVideoInfoPanel();
      });
    });
    settingsMenu.querySelectorAll(".settings-back").forEach(btn => {
      btn.addEventListener("click", () => showPanel("main"));
    });
  }

  function renderVideoInfoPanel() {
    const box = document.getElementById("videoInfoPanel");
    if (!box) return;
    const current = qualities.find(q => q.format_id === currentFormatId) || defaultQuality;
    if (!current) {
      box.textContent = "情報を取得できませんでした。";
      return;
    }
    const rows = [
      ["画質", current.height ? `${current.width || "?"}x${current.height}` : "-"],
      ["フレームレート", current.fps ? `${current.fps} fps` : "-"],
      ["コーデック", [current.vcodec, current.acodec].filter(v => v && v !== "none").join(" / ") || "-"],
      ["ビットレート", current.tbr ? `${Math.round(current.tbr)} kbps` : "-"],
      ["フォーマットID", current.format_id || "-"],
    ];
    box.innerHTML = rows.map(([k, v]) => `<div class="settings-info-row"><span>${escapeHtml(k)}</span><span>${escapeHtml(String(v))}</span></div>`).join("");
  }

  // 画質選択
  settingsMenu.querySelectorAll("[data-quality]").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosen = qualities.find(q => q.format_id === btn.dataset.quality);
      if (!chosen) return;
      currentFormatId = chosen.format_id;
      loadSource(chosen, true);
      settingsMenu.querySelectorAll("[data-quality]").forEach(b => {
        const selected = b === btn;
        b.dataset.selected = selected ? "1" : "0";
        b.querySelector(".settings-check").innerHTML = selected ? icon("check") : "";
      });
      if (qualityValueLabel) qualityValueLabel.textContent = chosen.height ? `${chosen.height}p` : (chosen.format_note || "?");
      if (downloadLink) downloadLink.href = `${mediaProxyUrl(videoId, currentFormatId)}&download=1`;
      showPanel("main");
    });
  });

  // 再生速度
  settingsMenu.querySelectorAll("[data-speed]").forEach(btn => {
    btn.addEventListener("click", () => {
      const speed = parseFloat(btn.dataset.speed);
      videoEl.playbackRate = speed;
      if (syncState.audioEl) syncState.audioEl.playbackRate = speed;
      settingsMenu.querySelectorAll("[data-speed]").forEach(b => {
        const selected = b === btn;
        b.dataset.selected = selected ? "1" : "0";
        b.querySelector(".settings-check").innerHTML = selected ? icon("check") : "";
      });
      if (speedValueLabel) speedValueLabel.textContent = speed === 1 ? "標準" : String(speed);
      showPanel("main");
    });
  });

  // 字幕
  settingsMenu.querySelectorAll("[data-sub]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (currentTrackEl) {
        currentTrackEl.remove();
        currentTrackEl = null;
      }
      settingsMenu.querySelectorAll("[data-sub]").forEach(b => {
        b.dataset.selected = "0";
        b.querySelector(".settings-check").innerHTML = "";
      });
      if (btn.dataset.sub === "off") {
        btn.dataset.selected = "1";
        btn.querySelector(".settings-check").innerHTML = icon("check");
        if (subtitleValueLabel) subtitleValueLabel.textContent = "オフ";
        showPanel("main");
        return;
      }
      const chosen = subtitleOptions[Number(btn.dataset.sub)];
      if (!chosen) return;
      try {
        const res = await fetch(`/proxy/subtitles/${encodeURIComponent(videoId)}?lang=${encodeURIComponent(chosen.lang)}&auto=${chosen.auto ? 1 : 0}`);
        if (!res.ok) throw new Error("字幕の取得に失敗しました");
        const vttText = await res.text();
        const blobUrl = URL.createObjectURL(new Blob([vttText], { type: "text/vtt" }));
        const track = document.createElement("track");
        track.kind = "subtitles";
        track.label = chosen.label;
        track.srclang = chosen.lang;
        track.src = blobUrl;
        track.default = true;
        videoEl.appendChild(track);
        currentTrackEl = track;
        setTimeout(() => {
          if (videoEl.textTracks && videoEl.textTracks.length) {
            videoEl.textTracks[videoEl.textTracks.length - 1].mode = "showing";
          }
        }, 100);
        btn.dataset.selected = "1";
        btn.querySelector(".settings-check").innerHTML = icon("check");
        if (subtitleValueLabel) subtitleValueLabel.textContent = chosen.label;
        showPanel("main");
      } catch (e) {
        // 失敗時はオフのままにしておく
      }
    });
  });

  // ---------- 長押しで2倍速(YouTubeモバイルと同じ挙動) ----------
  const speedIndicator = document.getElementById("speedIndicator");
  let longPressTimer = null;
  let longPressActive = false;
  let normalSpeedBeforeHold = 1;
  let touchStartY = 0;

  function startLongPress(e) {
    if (e.type === "touchstart") {
      touchStartY = e.touches[0].clientY;
    }
    longPressTimer = setTimeout(() => {
      longPressActive = true;
      normalSpeedBeforeHold = videoEl.playbackRate || 1;
      videoEl.playbackRate = 2;
      if (syncState.audioEl) syncState.audioEl.playbackRate = 2;
      if (speedIndicator) speedIndicator.classList.add("show");
    }, 450);
  }
  function endLongPress() {
    clearTimeout(longPressTimer);
    if (longPressActive) {
      videoEl.playbackRate = normalSpeedBeforeHold;
      if (syncState.audioEl) syncState.audioEl.playbackRate = normalSpeedBeforeHold;
      if (speedIndicator) speedIndicator.classList.remove("show");
      longPressActive = false;
      // 長押し(2倍速)を終えて指を離した直後、ブラウザによっては続けてclickイベントが
      // 発火することがある。そのまま再生/停止やスキップが誤発火しないよう、
      // 短い間だけ抑制フラグを立てる(wireCustomPlayerControls側のclickハンドラで見る)。
      syncState.suppressNextClick = true;
      setTimeout(() => { syncState.suppressNextClick = false; }, 400);
    }
  }
  // 「選択モード」対策はCSS側(-webkit-touch-callout/user-select: none)で行っている。
  // ここでpreventDefault()すると、その後のclickイベント(再生/停止・10秒スキップの
  // ダブルタップ判定に使っている)がスマホで発火しなくなってしまうため呼ばない。
  videoEl.addEventListener("touchstart", (e) => {
    startLongPress(e);
  }, { passive: true });
  videoEl.addEventListener("touchmove", (e) => {
    // 指を大きく動かした(スクロール操作等)場合は長押し判定をキャンセルする
    if (Math.abs(e.touches[0].clientY - touchStartY) > 10) {
      endLongPress();
    }
  }, { passive: true });
  videoEl.addEventListener("touchend", endLongPress);
  videoEl.addEventListener("touchcancel", endLongPress);
  videoEl.addEventListener("contextmenu", (e) => e.preventDefault());
  videoEl.addEventListener("mousedown", startLongPress);
  videoEl.addEventListener("mouseup", endLongPress);
  videoEl.addEventListener("mouseleave", endLongPress);
}

function attachHlsSource(videoEl, hlsUrl) {
  if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = hlsUrl;
    return;
  }
  if (window.Hls && window.Hls.isSupported()) {
    const hls = new Hls;
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoEl);
  }
}

function formatPlayerTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor(sec % 3600 / 60);
  const s = sec % 60;
  const pad = n => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function wireCustomPlayerControls(videoEl, playerRoot, syncState, playlistContext, currentVideoId, isLive) {
  // ループ再生・自動再生は、この関数の他の処理(画質/字幕まわり等)で万一エラーが
  // 起きても巻き込まれて動かなくなることが無いよう、あえて一番最初に配線しておく。
  const LOOP_KEY = "tubely_loop_enabled";
  const loopToggleBtn = playerRoot.querySelector("#loopToggleBtn");
  const loopValueLabel = playerRoot.querySelector("#loopValueLabel");
  let loopEnabled = localStorage.getItem(LOOP_KEY) === "1";
  function applyLoopState() {
    videoEl.loop = loopEnabled;
    if (syncState.audioEl) syncState.audioEl.loop = loopEnabled;
    if (loopValueLabel) loopValueLabel.textContent = loopEnabled ? "オン" : "オフ";
  }
  applyLoopState();
  if (loopToggleBtn) {
    loopToggleBtn.addEventListener("click", () => {
      loopEnabled = !loopEnabled;
      localStorage.setItem(LOOP_KEY, loopEnabled ? "1" : "0");
      applyLoopState();
    });
  }

  const AUTOPLAY_KEY = "tubely_autoplay_enabled";
  const autoplayToggleBtn = playerRoot.querySelector("#autoplayToggleBtn");
  const autoplayValueLabel = playerRoot.querySelector("#autoplayValueLabel");
  let autoplayEnabled = localStorage.getItem(AUTOPLAY_KEY) !== "0"; // 既定はオン(YouTube本家と同様)
  function applyAutoplayState() {
    if (autoplayValueLabel) autoplayValueLabel.textContent = autoplayEnabled ? "オン" : "オフ";
  }
  applyAutoplayState();
  if (autoplayToggleBtn) {
    autoplayToggleBtn.addEventListener("click", () => {
      autoplayEnabled = !autoplayEnabled;
      localStorage.setItem(AUTOPLAY_KEY, autoplayEnabled ? "1" : "0");
      applyAutoplayState();
    });
  }

  if (playlistContext) {
    videoEl.addEventListener("ended", () => {
      // ループがオンの場合はvideoEl.loopが優先されるので、ここには来ない
      if (!autoplayEnabled) return;
      fetch(`/proxy/playlists/${playlistContext.playlistId}`)
        .then((res) => res.json())
        .then((data) => {
          const videos = data.videos || [];
          const nextIndex = playlistContext.index + 1;
          if (nextIndex >= videos.length) return; // プレイリストの最後まで来たら何もしない
          const nextVideo = videos[nextIndex];
          window.location.href = `/watch?v=${encodeURIComponent(nextVideo.video_id)}&list=my:${playlistContext.playlistId}&index=${nextIndex}`;
        })
        .catch(() => {});
    });
  }

  const playBtn = playerRoot.querySelector("#playPauseBtn");
  const seekBar = playerRoot.querySelector("#seekBar");
  const curTimeEl = playerRoot.querySelector("#curTime");
  const durTimeEl = playerRoot.querySelector("#durTime");
  const muteBtn = playerRoot.querySelector("#muteBtn");
  const volumeBar = playerRoot.querySelector("#volumeBar");
  const fullscreenBtn = playerRoot.querySelector("#fullscreenBtn");
  const spinner = playerRoot.querySelector("#playerSpinner");
  const showSpinner = () => spinner && spinner.classList.add("show");
  const hideSpinner = () => spinner && spinner.classList.remove("show");
  showSpinner();
  videoEl.addEventListener("waiting", showSpinner);
  videoEl.addEventListener("loadstart", showSpinner);
  videoEl.addEventListener("canplay", hideSpinner);
  videoEl.addEventListener("playing", hideSpinner);
  videoEl.addEventListener("error", hideSpinner);
  let seeking = false;
  function updateSeekBarFill(pct) {
    seekBar.style.background = `linear-gradient(to right, #ff0033 0%, #ff0033 ${pct}%, rgba(255,255,255,0.3) ${pct}%, rgba(255,255,255,0.3) 100%)`;
  }
  updateSeekBarFill(isLive ? 100 : 0);
  if (isLive) seekBar.value = 100;
  function togglePlay() {
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      if (syncState.audioEl) syncState.audioEl.play().catch(() => {});
    } else {
      videoEl.pause();
      if (syncState.audioEl) syncState.audioEl.pause();
    }
  }
  playBtn.addEventListener("click", togglePlay);
  videoEl.addEventListener("click", (e) => {
    if (syncState.suppressNextClick) return;
    if (handleVideoClickForSkip(e)) return;
    togglePlay();
  });
  videoEl.addEventListener("play", () => {
    playBtn.innerHTML = icon("pause");
  });
  videoEl.addEventListener("pause", () => {
    playBtn.innerHTML = icon("play");
  });
  videoEl.addEventListener("timeupdate", () => {
    curTimeEl.textContent = formatPlayerTime(videoEl.currentTime);
    if (isLive) {
      // ライブ配信は「今どこまで見たか」ではなく「配信の最新地点にいるか」を示す
      // のが本家YouTubeの見た目(赤いバーは常にマックス)。durationがInfinity/NaNに
      // なりがちなライブ配信では、videoEl.durationベースの割合計算が意味を持たない
      // ため、常に100%で固定表示する。
      if (!seeking) {
        seekBar.value = 100;
        updateSeekBarFill(100);
      }
      return;
    }
    if (!seeking && videoEl.duration) {
      const pct = videoEl.currentTime / videoEl.duration * 100;
      seekBar.value = pct;
      updateSeekBarFill(pct);
    }
  });
  videoEl.addEventListener("loadedmetadata", () => {
    durTimeEl.textContent = formatPlayerTime(videoEl.duration);
  });
  seekBar.addEventListener("input", () => {
    seeking = true;
    updateSeekBarFill(seekBar.value);
    if (videoEl.duration) {
      curTimeEl.textContent = formatPlayerTime(seekBar.value / 100 * videoEl.duration);
    }
  });
  seekBar.addEventListener("change", () => {
    if (videoEl.duration) {
      const t = seekBar.value / 100 * videoEl.duration;
      videoEl.currentTime = t;
      if (syncState.audioEl) syncState.audioEl.currentTime = t;
    }
    seeking = false;
  });
  function updateVolumeIcon() {
    muteBtn.innerHTML = videoEl.muted || videoEl.volume === 0 ? icon("volumeMute") : icon("volume");
  }
  volumeBar.addEventListener("input", () => {
    videoEl.volume = volumeBar.value / 100;
    videoEl.muted = videoEl.volume === 0;
    if (syncState.audioEl) {
      syncState.audioEl.volume = videoEl.volume;
      syncState.audioEl.muted = videoEl.muted;
    }
    updateVolumeIcon();
  });
  muteBtn.addEventListener("click", () => {
    videoEl.muted = !videoEl.muted;
    if (!videoEl.muted && videoEl.volume === 0) {
      videoEl.volume = 1;
      volumeBar.value = 100;
    }
    if (syncState.audioEl) {
      syncState.audioEl.muted = videoEl.muted;
      syncState.audioEl.volume = videoEl.volume;
    }
    updateVolumeIcon();
  });
  fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (playerRoot.requestFullscreen) {
      playerRoot.requestFullscreen().catch(() => {
        if (videoEl.webkitEnterFullscreen) videoEl.webkitEnterFullscreen();
      });
    } else if (videoEl.webkitEnterFullscreen) {
      videoEl.webkitEnterFullscreen();
    }
  });

  // ---------- 一定時間操作が無いとコントロールを隠す(YouTubeと同じ挙動) ----------
  // 完全に消すのではなく、シークバーだけ細い赤線として下にうっすら残す。
  const settingsMenuEl = playerRoot.querySelector("#settingsMenu");
  let idleTimer = null;
  function showControls() {
    playerRoot.classList.remove("controls-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // 一時停止中、または設定メニューを開いている間は隠さない
      if (videoEl.paused) return;
      if (settingsMenuEl && !settingsMenuEl.hidden) return;
      playerRoot.classList.add("controls-idle");
    }, 2800);
  }
  ["mousemove", "mousedown", "touchstart", "keydown"].forEach((ev) => {
    playerRoot.addEventListener(ev, showControls, { passive: true });
  });
  videoEl.addEventListener("pause", () => {
    clearTimeout(idleTimer);
    playerRoot.classList.remove("controls-idle");
  });
  // ---------- 10秒スキップ(左右ダブルタップ、YouTube同様の挙動) ----------
  // タップ検知用のオーバーレイ要素は視覚効果(フラッシュ表示)専用で、
  // pointer-events:noneなのでクリック自体はvideoElにそのまま届く。
  // シングルクリックは再生/停止のまま維持し、同じ側を素早く2回クリックした時だけ
  // 10秒スキップとして扱う(togglePlayは呼ばない)。
  const tapLeft = playerRoot.querySelector("#seekTapLeft");
  const tapRight = playerRoot.querySelector("#seekTapRight");
  const SKIP_SECONDS = 10;
  const DOUBLE_TAP_WINDOW_MS = 350;
  let lastTapTime = 0;
  let lastTapSide = null;
  let skipHideTimer = null;

  function performSkip(zoneEl, seconds) {
    const newTime = Math.max(0, Math.min(videoEl.duration || Infinity, videoEl.currentTime + seconds));
    videoEl.currentTime = newTime;
    if (syncState.audioEl) syncState.audioEl.currentTime = newTime;
    zoneEl.classList.add("show");
    clearTimeout(skipHideTimer);
    skipHideTimer = setTimeout(() => zoneEl.classList.remove("show"), 550);
  }

  function handleVideoClickForSkip(e) {
    const rect = playerRoot.getBoundingClientRect();
    const isRightSide = (e.clientX - rect.left) > rect.width / 2;
    const side = isRightSide ? "right" : "left";
    const now = Date.now();
    if (lastTapSide === side && now - lastTapTime < DOUBLE_TAP_WINDOW_MS) {
      performSkip(isRightSide ? tapRight : tapLeft, isRightSide ? SKIP_SECONDS : -SKIP_SECONDS);
      lastTapTime = 0;
      lastTapSide = null;
      return true;
    }
    lastTapTime = now;
    lastTapSide = side;
    return false;
  }

  videoEl.addEventListener("play", showControls);
  showControls();
}

const CHANNEL_TABS = [ {
  key: "videos",
  label: "動画"
}, {
  key: "shorts",
  label: "ショート"
}, {
  key: "streams",
  label: "ライブ"
}, {
  key: "playlists",
  label: "再生リスト"
} ];

async function initChannelPage(channelId) {
  const header = document.getElementById("channelHeader");
  const grid = document.getElementById("channelGrid");
  const tabsBox = document.getElementById("channelTabs");
  let currentTab = "videos";
  let offset = 0;
  let hasMore = true;
  let scrollHandle = null;
  const PAGE_SIZE = 30;

  function renderTabs(availableTabs) {
    if (!tabsBox) return;
    const tabsToShow = availableTabs && availableTabs.length
      ? CHANNEL_TABS.filter(t => availableTabs.includes(t.key))
      : CHANNEL_TABS;
    tabsBox.innerHTML = tabsToShow.map(t => `<button type="button" class="channel-tab-btn ${t.key === currentTab ? "active" : ""}" data-tab="${t.key}">${t.label}</button>`).join("");
    tabsBox.querySelectorAll(".channel-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.tab === currentTab) return;
        currentTab = btn.dataset.tab;
        renderTabs(availableTabs);
        loadEntries(true);
      });
    });
  }

  async function loadEntries(reset) {
    if (reset) {
      offset = 0;
      hasMore = true;
      grid.innerHTML = skeletonGridHTML(12);
    }
    if (!hasMore) return;
    try {
      const data = await fetchJSON(`/proxy/channel/${encodeURIComponent(channelId)}?tab=${encodeURIComponent(currentTab)}&limit=${PAGE_SIZE}&offset=${offset}`);
      const entries = data.entries || [];
      hasMore = entries.length >= PAGE_SIZE;
      offset += entries.length;
      const isShorts = currentTab === "shorts";
      const html = entries.map(e => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`, { vertical: isShorts })).join("");
      if (reset) {
        grid.innerHTML = entries.length ? html : '<div class="empty-state">見つかりませんでした。</div>';
      } else if (entries.length) {
        grid.insertAdjacentHTML("beforeend", html);
      }
      grid.classList.toggle("grid-shorts", isShorts);
      if (!scrollHandle) {
        scrollHandle = setupInfiniteScroll(grid.parentElement, () => loadEntries(false));
      }
    } catch (e) {
      hasMore = false;
      if (reset) showError(grid.parentElement || grid, e.message);
    }
  }

  try {
    const data = await fetchJSON(`/proxy/channel/${encodeURIComponent(channelId)}?limit=${PAGE_SIZE}`);
    const avatarSrc = data.avatar_base64 || data.avatar;
    const bannerSrc = data.banner_base64 || data.banner;
    const bannerHTML = bannerSrc ? `<div class="channel-banner"><img src="${escapeHtml(bannerSrc)}" alt=""></div>` : "";
    const avatarHTML = avatarSrc ? `<img src="${escapeHtml(avatarSrc)}" alt="">` : escapeHtml((data.channel || "?")[0] || "?");
    const metaParts = [];
    if (data.channel_id) metaParts.push(`@${data.channel_id}`);
    if (data.channel_follower_count) metaParts.push(`チャンネル登録者数 ${formatCountJa(data.channel_follower_count)}人`);
    if (data.entry_count_total) metaParts.push(`${data.entry_count_total}本の動画`);

    header.innerHTML = `
      <div class="channel-header-top">
        ${bannerHTML}
        <div class="channel-identity">
          <div class="channel-avatar-lg">${avatarHTML}</div>
          <div class="channel-identity-body">
            <div class="channel-name-row">
              <span class="channel-name">${escapeHtml(data.channel || "")}</span>
              <span class="channel-verified">${icon("check")}</span>
            </div>
            <div class="channel-meta-line">${escapeHtml(metaParts.join(" · "))}</div>
            ${data.description ? `<div class="channel-desc-snippet" id="channelDescSnippet">${escapeHtml(data.description)}<button type="button" id="channelDescMoreBtn">…さらに表示</button></div>` : ""}
          </div>
          <div class="channel-subscribe-wrap">${subscribeButtonHTML(channelId, data.channel, avatarSrc)}</div>
        </div>
      </div>
      <div class="channel-about-modal" id="channelAboutModal" hidden>
        <div class="channel-about-backdrop" id="channelAboutBackdrop"></div>
        <div class="channel-about-sheet">
          <div class="channel-about-header">
            <span class="channel-name">${escapeHtml(data.channel || "")}</span>
            <button type="button" class="channel-about-close" id="channelAboutCloseBtn">${icon("chevronRight")}</button>
          </div>
          <div class="channel-about-section-title">説明</div>
          <div class="channel-about-desc">${escapeHtml(data.description || "説明はありません")}</div>
          <div class="channel-about-section-title">その他の情報</div>
          <div class="channel-about-row">${escapeHtml(metaParts.join(" · "))}</div>
        </div>
      </div>`;

    const descSnippet = document.getElementById("channelDescSnippet");
    const descMoreBtn = document.getElementById("channelDescMoreBtn");
    const aboutModal = document.getElementById("channelAboutModal");
    function openAboutModal() { if (aboutModal) aboutModal.hidden = false; }
    function closeAboutModal() { if (aboutModal) aboutModal.hidden = true; }
    if (descMoreBtn) descMoreBtn.addEventListener("click", openAboutModal);
    if (descSnippet) descSnippet.addEventListener("click", (e) => { if (e.target === descSnippet) openAboutModal(); });
    const closeBtn = document.getElementById("channelAboutCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeAboutModal);
    const backdrop = document.getElementById("channelAboutBackdrop");
    if (backdrop) backdrop.addEventListener("click", closeAboutModal);

    renderTabs(data.available_tabs);
    const entries = data.entries || [];
    offset = entries.length;
    hasMore = entries.length >= PAGE_SIZE;
    grid.innerHTML = entries.length ? entries.map(e => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("") : '<div class="empty-state">動画が見つかりませんでした。</div>';
    if (hasMore) {
      scrollHandle = setupInfiniteScroll(grid.parentElement, () => loadEntries(false));
    }
  } catch (e) {
    showError(header, e.message);
  }
}

async function initPlaylistPage(playlistId) {
  const header = document.getElementById("playlistHeader");
  const grid = document.getElementById("playlistGrid");
  try {
    const data = await fetchJSON(`/proxy/playlist/${encodeURIComponent(playlistId)}?limit=100`);
    header.innerHTML = `\n      <div class="youtube-playlist-badge">YouTubeの再生リスト</div>\n      <h1 class="section-title">${escapeHtml(truncateText(data.title || "", 150))}</h1>\n      <div style="color:var(--text-secondary); font-size:13px; margin-bottom:24px;">\n        ${escapeHtml(data.uploader || "")}${data.entry_count_total ? " &middot; " + data.entry_count_total + " 本" : ""}\n      </div>`;
    const entries = data.entries || [];
    grid.innerHTML = entries.length ? entries.map(e => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("") : '<div class="empty-state">動画が見つかりませんでした。</div>';
  } catch (e) {
    showError(header, e.message);
  }
}

function initSubscriptionsPage() {
  const box = document.getElementById("subscriptionsList");

  function render(subs) {
    if (!subs.length) {
      box.innerHTML = '<div class="empty-state">登録チャンネルはありません</div>';
      return;
    }
    box.innerHTML = subs.map(s => `\n    <a class="sub-row" href="/channel/${encodeURIComponent(s.channel_id)}">\n      <div class="avatar" style="width:48px;height:48px;">\n        ${s.thumbnail ? `<img src="${escapeHtml(s.thumbnail)}" alt="">` : escapeHtml((s.channel || "?")[0] || "?")}\n      </div>\n      <div class="title">${escapeHtml(s.channel || "")}</div>\n    </a>`).join("");
  }

  fetch("/proxy/user/subscriptions")
    .then((res) => {
      if (!res.ok) throw new Error("not logged in");
      return res.json();
    })
    .then((data) => {
      const subs = (data.subscriptions || []).map(s => ({ channel_id: s.channel_id, channel: s.channel, thumbnail: s.thumbnail }));
      setJSON(SUBS_KEY, subs); // ローカルにも反映しておき、他の画面(登録ボタンの状態表示等)とズレないようにする
      render(subs);
    })
    .catch(() => {
      render(getJSON(SUBS_KEY, []));
    });
}

function initLikedPage() {
  const listBox = document.getElementById("likedList");
  const heroThumb = document.getElementById("likedHeroThumb");
  const metaBox = document.getElementById("likedMeta");
  const playAllBtn = document.getElementById("likedPlayAllBtn");

  function render(likes) {
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

  fetch("/proxy/user/likes")
    .then((res) => {
      if (!res.ok) throw new Error("not logged in");
      return res.json();
    })
    .then((data) => {
      const likes = (data.likes || []).map(l => ({
        video_id: l.video_id, title: l.title, thumbnail: l.thumbnail, channel: l.channel, duration: l.duration,
      }));
      setJSON(LIKES_KEY, likes); // ローカルにも反映しておき、いいねボタンの状態表示等とズレないようにする
      render(likes);
    })
    .catch(() => {
      render(getJSON(LIKES_KEY, []).map(l => (typeof l === "string" ? { video_id: l } : l)));
    });
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

function initAccountPage() {
  const iconPreview = document.getElementById("accountIconPreview");
  const iconInput = document.getElementById("accountIconInput");
  const iconPickBtn = document.getElementById("accountIconPickBtn");
  const iconRemoveBtn = document.getElementById("accountIconRemoveBtn");
  const nameInput = document.getElementById("accountDisplayName");
  const userIdInput = document.getElementById("accountUserId");
  const saveBtn = document.getElementById("accountSaveBtn");
  const status = document.getElementById("accountStatus");

  let pendingIconDataUrl = undefined; // undefined=変更なし, ""=削除, "data:..."=新しいアイコン

  function renderIconPreview(src) {
    iconPreview.innerHTML = src ? `<img src="${escapeHtml(src)}" alt="">` : "?";
  }

  fetch("/proxy/user/me")
    .then((res) => res.json())
    .then((data) => {
      nameInput.value = data.display_name || "";
      userIdInput.value = data.user_id || "";
      renderIconPreview(data.avatar_base64);
    })
    .catch(() => {
      status.textContent = "読み込みに失敗しました";
    });

  iconPickBtn.addEventListener("click", () => iconInput.click());

  iconInput.addEventListener("change", () => {
    const file = iconInput.files && iconInput.files[0];
    if (!file) return;
    if (file.size > 50 * 1024) {
      status.textContent = "アイコンは50KB以下の画像を選んでください";
      iconInput.value = "";
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        if (img.width !== img.height) {
          status.textContent = `アイコンは正方形の画像にしてください(現在: ${img.width}x${img.height})`;
          iconInput.value = "";
          return;
        }
        status.textContent = "";
        pendingIconDataUrl = reader.result;
        renderIconPreview(pendingIconDataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  iconRemoveBtn.addEventListener("click", () => {
    pendingIconDataUrl = "";
    renderIconPreview(null);
  });

  saveBtn.addEventListener("click", () => {
    const body = {
      display_name: nameInput.value,
      user_id: userIdInput.value,
    };
    if (pendingIconDataUrl !== undefined) {
      body.avatar_base64 = pendingIconDataUrl;
    }
    status.textContent = "保存中…";
    fetch("/proxy/user/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          status.textContent = data.message || data.detail || "保存に失敗しました";
          return;
        }
        pendingIconDataUrl = undefined;
        status.textContent = "保存しました";
        renderIconPreview(data.avatar_base64);
      })
      .catch(() => {
        status.textContent = "保存に失敗しました(通信エラー)";
      });
  });
}

function initMyPlaylistsPage() {
  const listBox = document.getElementById("myPlaylistsList");
  const statusBox = document.getElementById("myPlaylistsStatus");
  const createBtn = document.getElementById("createPlaylistBtn");

  function load() {
    fetch("/proxy/playlists")
      .then((res) => res.json())
      .then((data) => {
        const playlists = data.playlists || [];
        if (!playlists.length) {
          listBox.innerHTML = '<div class="empty-state">プレイリストはまだありません</div>';
        } else {
          listBox.innerHTML = playlists.map((p) => `
            <a class="my-playlist-card" href="/my-playlists/${p.id}">
              <div class="my-playlist-card-icon">${icon("playlistStack")}</div>
              <div class="my-playlist-card-name">${escapeHtml(p.name)}</div>
              <div class="my-playlist-card-count">${p.video_count} 本の動画</div>
            </a>`).join("");
        }
        statusBox.textContent = `${playlists.length} / ${data.max_count} 個`;
      })
      .catch(() => {
        listBox.innerHTML = '<div class="empty-state">読み込みに失敗しました</div>';
      });
  }

  createBtn.addEventListener("click", () => {
    const name = window.prompt("プレイリスト名(20文字まで)");
    if (name === null) return;
    fetch("/proxy/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          alert(data.message || data.detail || "作成に失敗しました");
          return;
        }
        load();
      })
      .catch(() => alert("作成に失敗しました(通信エラー)"));
  });

  load();
}

function initMyPlaylistDetailPage(playlistId) {
  const heroThumb = document.getElementById("myPlaylistHeroThumb");
  const titleEl = document.getElementById("myPlaylistTitle");
  const metaEl = document.getElementById("myPlaylistMeta");
  const playAllBtn = document.getElementById("myPlaylistPlayAllBtn");
  const renameBtn = document.getElementById("myPlaylistRenameBtn");
  const deleteBtn = document.getElementById("myPlaylistDeleteBtn");
  const videoListBox = document.getElementById("myPlaylistVideoList");

  let currentVideos = [];

  function load() {
    fetch(`/proxy/playlists/${playlistId}`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        titleEl.textContent = data.playlist.name;
        currentVideos = data.videos || [];
        metaEl.textContent = `${currentVideos.length} / ${data.max_videos} 本の動画`;
        if (currentVideos.length && currentVideos[0].thumbnail) {
          heroThumb.innerHTML = `<img src="${escapeHtml(currentVideos[0].thumbnail)}" alt="">`;
        }
        if (!currentVideos.length) {
          videoListBox.innerHTML = '<div class="empty-state">このプレイリストには動画がありません</div>';
          return;
        }
        videoListBox.innerHTML = currentVideos.map((v, i) => `
          <div class="pl-video-row-wrap">
            <a class="pl-video-row" href="/watch?v=${encodeURIComponent(v.video_id)}&list=my:${playlistId}&index=${i}">
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
            fetch(`/proxy/playlists/${playlistId}/videos/${encodeURIComponent(btn.dataset.videoId)}`, { method: "DELETE" })
              .then(() => load())
              .catch(() => alert("削除に失敗しました"));
          });
        });
      })
      .catch(() => {
        videoListBox.innerHTML = '<div class="empty-state">読み込みに失敗しました</div>';
      });
  }

  playAllBtn.addEventListener("click", () => {
    if (!currentVideos.length) return;
    window.location.href = `/watch?v=${encodeURIComponent(currentVideos[0].video_id)}&list=my:${playlistId}&index=0`;
  });

  renameBtn.addEventListener("click", () => {
    const name = window.prompt("新しい名前(20文字まで)", titleEl.textContent);
    if (name === null) return;
    fetch(`/proxy/playlists/${playlistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          alert(data.message || data.detail || "変更に失敗しました");
          return;
        }
        load();
      })
      .catch(() => alert("変更に失敗しました(通信エラー)"));
  });

  deleteBtn.addEventListener("click", () => {
    if (!window.confirm("本当に削除しますか？この操作は取り消せません。")) return;
    fetch(`/proxy/playlists/${playlistId}`, { method: "DELETE" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          alert(data.message || data.detail || "削除に失敗しました");
          return;
        }
        window.location.href = "/my-playlists";
      })
      .catch(() => alert("削除に失敗しました(通信エラー)"));
  });

  load();
}

function initInquiriesPage() {
  const subjectInput = document.getElementById("inquirySubject");
  const messageInput = document.getElementById("inquiryMessage");
  const submitBtn = document.getElementById("inquirySubmitBtn");
  const formStatus = document.getElementById("inquiryFormStatus");
  const listBox = document.getElementById("inquiryList");

  const STATUS_LABELS = { open: "未対応", answered: "対応済み" };

  function loadList() {
    fetch("/proxy/inquiries")
      .then((res) => res.json())
      .then((data) => {
        const inquiries = data.inquiries || [];
        if (!inquiries.length) {
          listBox.innerHTML = '<div class="empty-state">お問い合わせはまだありません</div>';
          return;
        }
        listBox.innerHTML = inquiries.map((inq) => `
          <a class="inquiry-row" href="/inquiries/${inq.id}">
            <div class="inquiry-row-main">
              <span class="inquiry-row-subject">${escapeHtml(inq.subject)}</span>
              ${data.is_owner ? `<span class="inquiry-row-email">${escapeHtml(inq.email)}</span>` : ""}
            </div>
            <span class="inquiry-status inquiry-status-${escapeHtml(inq.status)}">${escapeHtml(STATUS_LABELS[inq.status] || inq.status)}</span>
          </a>`).join("");
      })
      .catch(() => {
        listBox.innerHTML = '<div class="empty-state">読み込みに失敗しました</div>';
      });
  }

  submitBtn.addEventListener("click", () => {
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();
    if (!subject || !message) {
      formStatus.textContent = "件名と内容を入力してください";
      return;
    }
    formStatus.textContent = "送信中…";
    fetch("/proxy/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          formStatus.textContent = data.message || data.detail || "送信に失敗しました";
          return;
        }
        formStatus.textContent = "送信しました";
        subjectInput.value = "";
        messageInput.value = "";
        loadList();
      })
      .catch(() => {
        formStatus.textContent = "送信に失敗しました(通信エラー)";
      });
  });

  loadList();
}

function initAdminModerationPage() {
  const accessStatus = document.getElementById("adminAccessStatus");
  const bodyBox = document.getElementById("adminModerationBody");

  const ngWordInput = document.getElementById("ngWordInput");
  const ngWordAddBtn = document.getElementById("ngWordAddBtn");
  const ngWordBulkInput = document.getElementById("ngWordBulkInput");
  const ngWordBulkAddBtn = document.getElementById("ngWordBulkAddBtn");
  const ngWordUrlInput = document.getElementById("ngWordUrlInput");
  const ngWordUrlImportBtn = document.getElementById("ngWordUrlImportBtn");
  const ngWordStatus = document.getElementById("ngWordStatus");
  const ngWordCountBox = document.getElementById("ngWordCount");
  const ngWordRemoveInput = document.getElementById("ngWordRemoveInput");
  const ngWordRemoveBtn = document.getElementById("ngWordRemoveBtn");
  const ngWordClearAllBtn = document.getElementById("ngWordClearAllBtn");

  const manualBanIpInput = document.getElementById("manualBanIpInput");
  const manualBanReasonInput = document.getElementById("manualBanReasonInput");
  const manualBanBtn = document.getElementById("manualBanBtn");
  const manualBanStatus = document.getElementById("manualBanStatus");
  const bannedIpsListBox = document.getElementById("bannedIpsList");

  const manualBanEmailInput = document.getElementById("manualBanEmailInput");
  const manualBanEmailReasonInput = document.getElementById("manualBanEmailReasonInput");
  const manualBanEmailBtn = document.getElementById("manualBanEmailBtn");
  const manualBanEmailStatus = document.getElementById("manualBanEmailStatus");
  const bannedEmailsListBox = document.getElementById("bannedEmailsList");

  const banLogFilterInput = document.getElementById("banLogFilterInput");
  const banLogFilterBtn = document.getElementById("banLogFilterBtn");
  const banLogClearBtn = document.getElementById("banLogClearBtn");
  const banEventsListBox = document.getElementById("banEventsList");

  const EVENT_LABELS = { auto_ban: "自動BAN", manual_ban: "手動BAN", unban: "解除" };

  const aiStatusLabel = document.getElementById("aiStatusLabel");
  const moderationPolicyInput = document.getElementById("moderationPolicyInput");
  const moderationPolicySaveBtn = document.getElementById("moderationPolicySaveBtn");
  const moderationPolicyStatus = document.getElementById("moderationPolicyStatus");

  function loadModerationPolicy() {
    fetch("/proxy/admin/moderation-policy")
      .then((res) => res.json())
      .then((data) => {
        moderationPolicyInput.value = data.policy || "";
        aiStatusLabel.textContent = data.ai_enabled
          ? `AI判定は有効です(モデル: ${data.model})`
          : "AIのAPIキーが未設定のため、判定基準を書いてもAI判定は動作しません(サーバー側の設定が必要です)";
      })
      .catch(() => {
        aiStatusLabel.textContent = "読み込みに失敗しました";
      });
  }

  moderationPolicySaveBtn.addEventListener("click", () => {
    moderationPolicyStatus.textContent = "保存中…";
    fetch("/proxy/admin/moderation-policy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy: moderationPolicyInput.value }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        moderationPolicyStatus.textContent = ok ? "保存しました" : (data.message || data.detail || "保存に失敗しました");
      })
      .catch(() => { moderationPolicyStatus.textContent = "保存に失敗しました(通信エラー)"; });
  });


  function loadNgWords() {
    fetch("/proxy/admin/banned-words")
      .then((res) => res.json())
      .then((data) => {
        // 一覧そのものは表示しない(中身を画面に出さない方針)。件数だけ見せる。
        ngWordCountBox.textContent = `現在 ${data.count || 0} 件のNGワードが登録されています`;
      })
      .catch(() => {
        ngWordCountBox.textContent = "読み込みに失敗しました";
      });
  }

  ngWordRemoveBtn.addEventListener("click", () => {
    const word = ngWordRemoveInput.value.trim();
    if (!word) return;
    fetch("/proxy/admin/banned-words/by-text", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          ngWordStatus.textContent = data.message || data.detail || "削除に失敗しました";
          return;
        }
        ngWordStatus.textContent = "削除しました";
        ngWordRemoveInput.value = "";
        loadNgWords();
      })
      .catch(() => { ngWordStatus.textContent = "削除に失敗しました(通信エラー)"; });
  });

  ngWordClearAllBtn.addEventListener("click", () => {
    if (!window.confirm("登録されているNGワードを全て削除します。本当によろしいですか？この操作は取り消せません。")) return;
    fetch("/proxy/admin/banned-words/clear-all", { method: "DELETE" })
      .then(() => {
        ngWordStatus.textContent = "全て削除しました";
        loadNgWords();
      })
      .catch(() => { ngWordStatus.textContent = "削除に失敗しました(通信エラー)"; });
  });

  function loadBannedIps() {
    fetch("/proxy/admin/banned-ips")
      .then((res) => res.json())
      .then((data) => {
        const ips = data.ips || [];
        bannedIpsListBox.innerHTML = ips.length ? ips.map((b) => `
          <div class="banned-ip-row">
            <div>
              <div class="banned-ip-address">${escapeHtml(b.ip)}</div>
              <div class="banned-ip-reason">${escapeHtml(b.reason || "")} ${b.is_manual ? "(手動)" : "(自動)"}</div>
            </div>
            <button type="button" class="page-settings-btn secondary" data-ip="${escapeHtml(b.ip)}">解除</button>
          </div>`).join("") : '<div class="empty-state">現在BAN中のIPはありません</div>';

        bannedIpsListBox.querySelectorAll("button[data-ip]").forEach((btn) => {
          btn.addEventListener("click", () => {
            fetch(`/proxy/admin/banned-ips/${encodeURIComponent(btn.dataset.ip)}`, { method: "DELETE" })
              .then(() => loadBannedIps())
              .catch(() => alert("解除に失敗しました"));
          });
        });
      })
      .catch(() => {
        bannedIpsListBox.innerHTML = '<div class="empty-state">読み込みに失敗しました</div>';
      });
  }

  function loadBannedEmails() {
    fetch("/proxy/admin/banned-emails")
      .then((res) => res.json())
      .then((data) => {
        const emails = data.emails || [];
        bannedEmailsListBox.innerHTML = emails.length ? emails.map((b) => `
          <div class="banned-ip-row">
            <div>
              <div class="banned-ip-address">${escapeHtml(b.email)}</div>
              <div class="banned-ip-reason">${escapeHtml(b.reason || "")} ${b.is_manual ? "(手動)" : "(自動)"}</div>
            </div>
            <button type="button" class="page-settings-btn secondary" data-email="${escapeHtml(b.email)}">解除</button>
          </div>`).join("") : '<div class="empty-state">現在BAN中のメールアドレスはありません</div>';

        bannedEmailsListBox.querySelectorAll("button[data-email]").forEach((btn) => {
          btn.addEventListener("click", () => {
            fetch(`/proxy/admin/banned-emails/${encodeURIComponent(btn.dataset.email)}`, { method: "DELETE" })
              .then(() => loadBannedEmails())
              .catch(() => alert("解除に失敗しました"));
          });
        });
      })
      .catch(() => {
        bannedEmailsListBox.innerHTML = '<div class="empty-state">読み込みに失敗しました</div>';
      });
  }

  function loadBanEvents(filter) {
    const isEmail = filter && filter.includes("@");
    const params = filter ? (isEmail ? `?email=${encodeURIComponent(filter)}` : `?ip=${encodeURIComponent(filter)}`) : "";
    fetch(`/proxy/admin/ban-events${params}`)
      .then((res) => res.json())
      .then((data) => {
        const events = data.events || [];
        banEventsListBox.innerHTML = events.length ? events.map((e) => `
          <div class="ban-event-row">
            <div class="ban-event-top">
              <span class="ban-event-type ban-event-type-${escapeHtml(e.event_type)}">${escapeHtml(EVENT_LABELS[e.event_type] || e.event_type)}</span>
              <span class="ban-event-time">${new Date(e.created_at * 1000).toLocaleString("ja-JP")}</span>
            </div>
            <div class="ban-event-ip">IP: ${escapeHtml(e.ip)}${e.email ? ` / メール: ${escapeHtml(e.email)}` : ""}</div>
            ${e.matched_word ? `<div class="ban-event-word">該当ワード: ${escapeHtml(e.matched_word)}</div>` : ""}
            ${e.reason ? `<div class="ban-event-reason">理由: ${escapeHtml(e.reason)}</div>` : ""}
            ${e.context ? `<div class="ban-event-context">${escapeHtml(e.context)}</div>` : ""}
          </div>`).join("") : '<div class="empty-state">ログはありません</div>';
      })
      .catch(() => {
        banEventsListBox.innerHTML = '<div class="empty-state">読み込みに失敗しました</div>';
      });
  }

  ngWordAddBtn.addEventListener("click", () => {
    const word = ngWordInput.value.trim();
    if (!word) return;
    fetch("/proxy/admin/banned-words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    }).then(() => {
      ngWordInput.value = "";
      loadNgWords();
    }).catch(() => alert("追加に失敗しました"));
  });

  ngWordBulkAddBtn.addEventListener("click", () => {
    const text = ngWordBulkInput.value.trim();
    if (!text) return;
    ngWordStatus.textContent = "登録中…";
    fetch("/proxy/admin/banned-words/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
      .then((res) => res.json())
      .then((data) => {
        ngWordStatus.textContent = `${data.added} / ${data.total_submitted} 件を登録しました`;
        ngWordBulkInput.value = "";
        loadNgWords();
      })
      .catch(() => { ngWordStatus.textContent = "登録に失敗しました"; });
  });

  ngWordUrlImportBtn.addEventListener("click", () => {
    const url = ngWordUrlInput.value.trim();
    if (!url) return;
    ngWordStatus.textContent = "インポート中…(件数が多いと少し時間がかかります)";
    fetch("/proxy/admin/banned-words/import-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          ngWordStatus.textContent = data.message || data.detail || "インポートに失敗しました";
          return;
        }
        ngWordStatus.textContent = `${data.added} / ${data.total_found} 件を取り込みました`;
        loadNgWords();
      })
      .catch(() => { ngWordStatus.textContent = "インポートに失敗しました(通信エラー)"; });
  });

  manualBanBtn.addEventListener("click", () => {
    const ip = manualBanIpInput.value.trim();
    if (!ip) return;
    fetch("/proxy/admin/banned-ips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, reason: manualBanReasonInput.value.trim() }),
    })
      .then(() => {
        manualBanIpInput.value = "";
        manualBanReasonInput.value = "";
        manualBanStatus.textContent = "BANしました";
        loadBannedIps();
      })
      .catch(() => { manualBanStatus.textContent = "BANに失敗しました"; });
  });

  manualBanEmailBtn.addEventListener("click", () => {
    const email = manualBanEmailInput.value.trim();
    if (!email) return;
    fetch("/proxy/admin/banned-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reason: manualBanEmailReasonInput.value.trim() }),
    })
      .then(() => {
        manualBanEmailInput.value = "";
        manualBanEmailReasonInput.value = "";
        manualBanEmailStatus.textContent = "BANしました";
        loadBannedEmails();
      })
      .catch(() => { manualBanEmailStatus.textContent = "BANに失敗しました"; });
  });

  banLogFilterBtn.addEventListener("click", () => loadBanEvents(banLogFilterInput.value.trim()));
  banLogClearBtn.addEventListener("click", () => { banLogFilterInput.value = ""; loadBanEvents(""); });

  // オーナーかどうかは、管理者専用APIを実際に叩いてみて403かどうかで判定する
  // (専用の判定エンドポイントを別途用意せず、実際のアクセス可否をそのまま使う)。
  fetch("/proxy/admin/banned-words")
    .then((res) => {
      if (res.status === 403 || res.status === 401) {
        accessStatus.textContent = "このページはオーナーのみアクセスできます";
        return;
      }
      bodyBox.hidden = false;
      loadModerationPolicy();
      loadNgWords();
      loadBannedIps();
      loadBannedEmails();
      loadBanEvents("");
    })
    .catch(() => {
      accessStatus.textContent = "読み込みに失敗しました";
    });
}

function initInquiryDetailPage(inquiryId) {
  const titleEl = document.getElementById("inquirySubjectTitle");
  const threadEl = document.getElementById("inquiryThread");
  const deleteBtn = document.getElementById("inquiryDeleteBtn");
  const replyInput = document.getElementById("inquiryReplyMessage");
  const replySubmitBtn = document.getElementById("inquiryReplySubmitBtn");
  const replyStatus = document.getElementById("inquiryReplyStatus");

  const POLL_INTERVAL_MS = 3000;
  let pollTimer = null;
  let lastRenderedSignature = "";

  function avatarHTML(avatarInfo, fallbackLabel) {
    const src = avatarInfo && avatarInfo.avatar_base64;
    if (src) return `<div class="inquiry-avatar"><img src="${escapeHtml(src)}" alt=""></div>`;
    return `<div class="inquiry-avatar">${escapeHtml((fallbackLabel || "?")[0] || "?")}</div>`;
  }

  function renderThread(data) {
    const inquiry = data.inquiry;
    const avatars = data.avatars || {};
    titleEl.textContent = inquiry.subject;
    deleteBtn.hidden = !data.is_owner;

    const ownerLabel = data.is_owner ? (avatars[inquiry.email] && avatars[inquiry.email].display_name) || inquiry.email : "あなた";
    const firstRow = `
      <div class="inquiry-message-row">
        ${avatarHTML(avatars[inquiry.email], ownerLabel)}
        <div class="inquiry-message"><div class="inquiry-message-meta">${escapeHtml(ownerLabel)}</div><div class="inquiry-message-body">${escapeHtml(inquiry.message)}</div></div>
      </div>`;

    const replyRows = (data.replies || []).map((r) => {
      const label = r.is_owner ? "オーナー" : (data.is_owner ? ((avatars[r.email] && avatars[r.email].display_name) || r.email) : "あなた");
      return `
      <div class="inquiry-message-row ${r.is_owner ? "inquiry-message-row-owner" : ""}">
        ${avatarHTML(avatars[r.email], label)}
        <div class="inquiry-message ${r.is_owner ? "inquiry-message-owner" : ""}">
          <div class="inquiry-message-meta">${escapeHtml(label)}</div>
          <div class="inquiry-message-body">${escapeHtml(r.message)}</div>
        </div>
      </div>`;
    }).join("");

    threadEl.innerHTML = firstRow + replyRows;
  }

  function loadThread(isPoll) {
    fetch(`/proxy/inquiries/${inquiryId}`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        // ポーリングのたびに毎回作り直すとチラつくので、内容に変化が無ければ何もしない
        // (LINEのように、相手の返信が来た時だけ自然に増える見た目にするため)。
        const signature = JSON.stringify(data);
        if (signature === lastRenderedSignature) return;
        lastRenderedSignature = signature;
        renderThread(data);
      })
      .catch(() => {
        if (!isPoll) {
          threadEl.innerHTML = '<div class="empty-state">読み込みに失敗しました(権限が無いか、削除された可能性があります)</div>';
        }
      });
  }

  replySubmitBtn.addEventListener("click", () => {
    const message = replyInput.value.trim();
    if (!message) {
      replyStatus.textContent = "返信内容を入力してください";
      return;
    }
    replyStatus.textContent = "送信中…";
    fetch(`/proxy/inquiries/${inquiryId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          replyStatus.textContent = data.message || data.detail || "送信に失敗しました";
          return;
        }
        replyStatus.textContent = "";
        replyInput.value = "";
        loadThread(false);
      })
      .catch(() => {
        replyStatus.textContent = "送信に失敗しました(通信エラー)";
      });
  });

  deleteBtn.addEventListener("click", () => {
    if (!window.confirm("本当に削除しますか？この操作は取り消せません。")) return;
    fetch(`/proxy/inquiries/${inquiryId}`, { method: "DELETE" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          alert(data.message || data.detail || "削除に失敗しました");
          return;
        }
        clearInterval(pollTimer);
        window.location.href = "/inquiries";
      })
      .catch(() => {
        alert("削除に失敗しました(通信エラー)");
      });
  });

  loadThread(false);
  pollTimer = setInterval(() => loadThread(true), POLL_INTERVAL_MS);
}


function initSettingsPage() {
  const input = document.getElementById("apiBaseInput");
  const status = document.getElementById("apiBaseStatus");
  const saveBtn = document.getElementById("saveApiBase");
  const resetBtn = document.getElementById("resetApiBase");
  const clearBtn = document.getElementById("clearLocalData");
  const clearStatus = document.getElementById("clearStatus");
  input.value = localStorage.getItem(API_BASE_KEY) || "";

  const nocookieToggle = document.getElementById("useNocookieEmbed");
  if (nocookieToggle) {
    nocookieToggle.checked = localStorage.getItem(USE_NOCOOKIE_EMBED_KEY) === "1";
    nocookieToggle.addEventListener("change", () => {
      localStorage.setItem(USE_NOCOOKIE_EMBED_KEY, nocookieToggle.checked ? "1" : "0");
    });
  }
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
  const clearServerCacheBtn = document.getElementById("clearServerCache");
  const serverCachePasswordInput = document.getElementById("serverCachePassword");
  const serverCacheStatus = document.getElementById("serverCacheStatus");
  if (clearServerCacheBtn) {
    clearServerCacheBtn.addEventListener("click", async () => {
      const password = serverCachePasswordInput && serverCachePasswordInput.value || "";
      if (!password) {
        serverCacheStatus.textContent = "管理者パスワードを入力してください。";
        return;
      }
      clearServerCacheBtn.disabled = true;
      serverCacheStatus.textContent = "削除中...";
      try {
        const params = new URLSearchParams;
        params.set("password", password);
        const extra = apiBaseQueryParam();
        if (extra) new URLSearchParams(extra).forEach((v, k) => params.set(k, v));
        const res = await fetch(`/proxy/cache-clear-all?${params.toString()}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.message || `HTTPエラー (${res.status})`);
        serverCacheStatus.textContent = `削除しました(一覧: ${data.index_entries_removed}件 / レスポンスキャッシュ: ${data.response_cache_entries_removed}件)`;
      } catch (e) {
        serverCacheStatus.textContent = `失敗しました: ${e.message}`;
      } finally {
        clearServerCacheBtn.disabled = false;
      }
    });
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

const UPDATE_VERSION_SEEN_KEY = "tubely_last_seen_version";

const ANNOUNCEMENT_SEEN_KEY = "tubely_announcement_seen_id";

function checkForAnnouncement() {
  fetch("/api/announcement")
    .then((res) => res.json())
    .then((data) => {
      if (!data.enabled || !data.id) return;
      const seen = localStorage.getItem(ANNOUNCEMENT_SEEN_KEY);
      if (seen === data.id) return;
      showAnnouncementModal(data);
    })
    .catch(() => {});
}

function showAnnouncementModal(data) {
  const existing = document.getElementById("announcementModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "announcementModal";
  modal.className = "announcement-modal";
  modal.innerHTML = `
    <div class="announcement-backdrop" id="announcementBackdrop"></div>
    <div class="announcement-box">
      <div class="announcement-title">${escapeHtml(data.title || "アップデート予告")}</div>
      <div class="announcement-message">${escapeHtml(data.message || "")}</div>
      <button type="button" class="announcement-close-btn" id="announcementCloseBtn">閉じる</button>
    </div>`;
  document.body.appendChild(modal);

  const dismiss = () => {
    localStorage.setItem(ANNOUNCEMENT_SEEN_KEY, data.id);
    modal.remove();
  };
  document.getElementById("announcementCloseBtn").addEventListener("click", dismiss);
  document.getElementById("announcementBackdrop").addEventListener("click", dismiss);
}

function checkForFrontendUpdate() {
  fetch("/api/frontend-version")
    .then((res) => res.json())
    .then((data) => {
      const seen = localStorage.getItem(UPDATE_VERSION_SEEN_KEY);
      if (!data.version) return;
      if (seen === null) {
        // 初回訪問(このブラウザで一度も見たことが無い)は、通知せず現在のバージョンを覚えるだけ
        localStorage.setItem(UPDATE_VERSION_SEEN_KEY, data.version);
        return;
      }
      if (seen !== data.version) {
        showUpdateBanner(data);
        localStorage.setItem(UPDATE_VERSION_SEEN_KEY, data.version);
      }
    })
    .catch(() => {});
}

function showUpdateBanner(data) {
  const existing = document.getElementById("updateBanner");
  if (existing) existing.remove();

  const changesList = (data.changes || []).slice(0, 3).map(c => `<li>${escapeHtml(c)}</li>`).join("");
  const banner = document.createElement("div");
  banner.id = "updateBanner";
  banner.className = "update-banner";
  banner.innerHTML = `
    <div class="update-banner-body">
      <div class="update-banner-title">サイトが更新されました</div>
      ${changesList ? `<ul class="update-banner-list">${changesList}</ul>` : ""}
    </div>
    <button type="button" class="update-banner-close" id="updateBannerClose">&times;</button>`;
  document.body.appendChild(banner);

  requestAnimationFrame(() => banner.classList.add("show"));

  const close = () => {
    banner.classList.remove("show");
    setTimeout(() => banner.remove(), 300);
  };
  document.getElementById("updateBannerClose").addEventListener("click", close);
  setTimeout(close, 8000);
}

function recordAndShowVisitCount() {
  const box = document.getElementById("sidebarVisitCount");
  // 記録は毎回のページ表示で行う(タブを開くたびに+1、YouTube本家の再生回数のような
  // 厳密な重複排除はしていない、あくまで参考程度のシンプルなカウンター)。
  fetch("/proxy/visit", { method: "POST" })
    .then((res) => res.json())
    .then((data) => {
      if (box && typeof data.total === "number") {
        box.textContent = `累計閲覧数: ${data.total.toLocaleString()}`;
      }
    })
    .catch(() => {
      // 表示できなくても致命的ではないので静かに無視する
    });
}

function renderSidebarSubs() {
  const box = document.getElementById("sidebarSubs");
  if (!box) return;
  const subs = getJSON(SUBS_KEY, []);
  const emptyHint = document.getElementById("sidebarSubsEmpty");
  const moreBtn = document.getElementById("sidebarSubsMoreBtn");
  const allLink = document.getElementById("sidebarSubsAllLink");
  const SIDEBAR_SUBS_LIMIT = 8;

  if (!subs.length) {
    box.innerHTML = "";
    if (emptyHint) emptyHint.style.display = "block";
    if (moreBtn) moreBtn.hidden = true;
    if (allLink) allLink.hidden = true;
    return;
  }
  if (emptyHint) emptyHint.style.display = "none";

  function itemHTML(s) {
    const avatarHTML = s.thumbnail
      ? `<img src="${escapeHtml(s.thumbnail)}" alt="" loading="lazy">`
      : escapeHtml((s.channel || "?")[0] || "?");
    return `<a class="item sidebar-sub-item" href="/channel/${encodeURIComponent(s.channel_id)}">
      <span class="sidebar-sub-avatar">${avatarHTML}</span>
      <span class="label">${escapeHtml(s.channel || "")}</span>
    </a>`;
  }

  let expanded = false;
  function render() {
    const shown = expanded ? subs : subs.slice(0, SIDEBAR_SUBS_LIMIT);
    box.innerHTML = shown.map(itemHTML).join("");
    if (moreBtn) moreBtn.hidden = expanded || subs.length <= SIDEBAR_SUBS_LIMIT;
    if (allLink) allLink.hidden = false;
  }
  render();

  if (moreBtn) {
    moreBtn.onclick = () => {
      expanded = true;
      render();
    };
  }
}

function initSearchSuggest() {
  const input = document.getElementById("searchInput");
  const box = document.getElementById("searchSuggest");
  const form = document.getElementById("searchForm");
  if (!input || !box || !form) return;

  let debounceTimer = null;
  let items = [];
  let activeIndex = -1;

  function render() {
    if (!items.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.innerHTML = items.map((s, i) =>
      `<div class="suggest-item ${i === activeIndex ? "active" : ""}" data-index="${i}">${escapeHtml(s)}</div>`
    ).join("");
    box.hidden = false;
    box.querySelectorAll(".suggest-item").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = items[Number(el.dataset.index)];
        box.hidden = true;
        submitSearchWithModerationCheck(input.value.trim());
      });
    });
  }

  function submitSearchWithModerationCheck(query) {
    if (!query) return;
    fetch("/proxy/moderation/check-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.blocked) {
          alert("この検索キーワードはご利用いただけません。");
          return;
        }
        window.location.href = `/results?q=${encodeURIComponent(query)}`;
      })
      .catch(() => {
        // チェック自体が失敗した場合、誤って検索できなくならないよう通常通り送信する
        window.location.href = `/results?q=${encodeURIComponent(query)}`;
      });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitSearchWithModerationCheck(input.value.trim());
  });

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    activeIndex = -1;
    if (!q) {
      items = [];
      render();
      return;
    }
    debounceTimer = setTimeout(async () => {
      try {
        const data = await fetchJSON(`/proxy/suggest?q=${encodeURIComponent(q)}`);
        items = data.suggestions || [];
        render();
      } catch (e) {
        items = [];
        render();
      }
    }, 200);
  });

  input.addEventListener("keydown", (e) => {
    if (box.hidden || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      render();
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      input.value = items[activeIndex];
      box.hidden = true;
      submitSearchWithModerationCheck(input.value.trim());
    } else if (e.key === "Escape") {
      box.hidden = true;
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => { box.hidden = true; }, 150);
  });
  input.addEventListener("focus", () => {
    if (items.length) box.hidden = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  migrateLikesIfNeeded();
  syncAccountDataOnLoad();
  initSearchSuggest();
  renderSidebarSubs();
  recordAndShowVisitCount();
  checkForFrontendUpdate();
  checkForAnnouncement();
  const ds = document.body.dataset;
  const page = ds.page;
  if (page === "index") initIndexPage(); else if (page === "results") initResultsPage(ds.query || ""); else if (page === "watch") initWatchPage(ds.videoId); else if (page === "channel") initChannelPage(ds.channelId); else if (page === "playlist") initPlaylistPage(ds.playlistId); else if (page === "subscriptions") initSubscriptionsPage(); else if (page === "liked") initLikedPage(); else if (page === "history") initHistoryPage(); else if (page === "settings") initSettingsPage(); else if (page === "account") initAccountPage(); else if (page === "inquiries") initInquiriesPage(); else if (page === "inquiry_detail") initInquiryDetailPage(ds.inquiryId); else if (page === "my_playlists") initMyPlaylistsPage(); else if (page === "my_playlist_detail") initMyPlaylistDetailPage(ds.playlistId); else if (page === "admin_moderation") initAdminModerationPage();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // 対応していない/失敗しても、通常のWebサイトとしては問題なく動くので無視する
    });
  });
}
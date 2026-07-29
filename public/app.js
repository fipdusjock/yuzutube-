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

function truncateText(str, maxLen) {
  // 長いタイトル(スペースの無い長い文字列など)がレイアウトを壊すことがあるので、
  // CSSのline-clampだけに頼らず、JS側でも一定文字数を超えたら...で切る。
  if (!str) return "";
  const s = String(str);
  return s.length > maxLen ? s.slice(0, maxLen).trimEnd() + "..." : s;
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

function skeletonGridHTML(count) {
  return Array.from({ length: count }, skeletonCardHTML).join("");
}

// ---------- カードのHTML(実データ) ----------

function videoCardHTML(e, watchHref) {
  const isLive = e.live_status === "is_live";
  const badge = isLive
    ? `<span class="duration live-badge">LIVE</span>`
    : (e.duration ? `<span class="duration">${escapeHtml(formatDuration(e.duration))}</span>` : "");
  const views = e.view_count ? formatViews(e.view_count) : (e.view_count_text || "");
  const avatarHTML = e.channel_thumbnail
    ? `<img src="${escapeHtml(e.channel_thumbnail)}" alt="" loading="lazy">`
    : escapeHtml((e.channel || "?")[0] || "?");
  return `
    <a class="card" href="${watchHref}">
      <div class="thumb-wrap">
        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}
        ${badge}
      </div>
      <div class="meta">
        <div class="avatar">${avatarHTML}</div>
        <div>
          <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>
          <div class="sub">${escapeHtml(e.channel || "")}${isLive ? "" : (views ? " &middot; " + escapeHtml(views) : "")}</div>
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
        <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>
        <div class="sub">${escapeHtml(e.channel || "")}${e.view_count_text ? "<br>" + escapeHtml(e.view_count_text) : ""}</div>
      </div>
    </a>`;
}

function commentRowHTML(c) {
  const avatarHTML = c.author_thumbnail
    ? `<img src="${escapeHtml(c.author_thumbnail)}" alt="" loading="lazy">`
    : escapeHtml((c.author || "?")[0] || "?");
  return `
    <div class="comment-row">
      <div class="avatar">${avatarHTML}</div>
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
  const liveChatPanel = document.getElementById("liveChatPanel");
  const liveChatBox = document.getElementById("liveChatBox");

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

    if (info.is_live && liveChatPanel && liveChatBox) {
      liveChatPanel.style.display = "block";
      liveChatBox.innerHTML = '<div class="chat-note">チャットを読み込み中...</div>';
      fetchJSON(`/proxy/livechat/${encodeURIComponent(videoId)}?limit=200`)
        .then((data) => {
          const messages = data.messages || [];
          liveChatBox.innerHTML =
            '<div class="chat-note">試験的な機能です。配信全体のチャット履歴ではなく、取得できた範囲のみ表示しています。</div>' +
            (messages.length
              ? messages.map((m) => `<div class="chat-row"><span class="author">${escapeHtml(m.author || "")}</span>${escapeHtml(m.text || "")}</div>`).join("")
              : '<div class="chat-note">チャットを取得できませんでした。</div>');
        })
        .catch(() => {
          liveChatPanel.style.display = "none";
        });
    }
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
  const ownerAvatarSrc = info.channel_avatar_base64 || info.channel_avatar;
  const ownerAvatarHTML = ownerAvatarSrc
    ? `<img src="${escapeHtml(ownerAvatarSrc)}" alt="" loading="lazy">`
    : escapeHtml((channelName || "?")[0] || "?");

  const stats = [];
  if (info.view_count) stats.push(`<span class="stat-pill">${escapeHtml(formatViews(info.view_count))}</span>`);
  stats.push(likeButtonHTML(videoId, info.like_count));
  if (info.comment_count) stats.push(`<span class="stat-pill">${icon("comment")}${formatCountJa(info.comment_count)}</span>`);

  const chapters = (info.chapters || [])
    .map((c) => `<div class="chapter-row"><span class="ts">${escapeHtml(formatDuration(Math.floor(c.start_time || 0)))}</span><span>${escapeHtml(c.title || "")}</span></div>`)
    .join("");

  box.innerHTML = `
    <div class="video-title">${escapeHtml(truncateText(info.title || "", 150))}</div>
    <div class="video-owner-row">
      <div class="video-owner">
        <div class="avatar">${ownerAvatarHTML}</div>
        <div>
          <div class="name">${channelLink}</div>
          ${info.channel_follower_count ? `<div class="subs">${formatCountJa(info.channel_follower_count)} 人の登録者</div>` : ""}
        </div>
        ${subscribeButtonHTML(info.channel_id, channelName, ownerAvatarSrc)}
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">${stats.join("")}</div>
    </div>
    <div class="description-box" id="descriptionBox">
      <div class="description-inner">
        ${info.upload_date ? `<div class="top-line">${escapeHtml(formatUploadDate(info.upload_date))}</div>` : ""}
        <div class="description-text">${escapeHtml(info.description || "(説明文なし)")}</div>
        ${chapters ? `<div class="chapters"><div style="font-weight:600; margin-bottom:6px;">チャプター</div>${chapters}</div>` : ""}
      </div>
      <button type="button" class="desc-toggle-btn" id="descToggleBtn">もっと見る</button>
    </div>`;

  const descBox = box.querySelector("#descriptionBox");
  const descToggleBtn = box.querySelector("#descToggleBtn");
  if (descBox && descToggleBtn) {
    descBox.addEventListener("click", () => {
      const expanded = descBox.classList.toggle("expanded");
      descToggleBtn.textContent = expanded ? "閉じる" : "もっと見る";
    });
  }
}

function mediaProxyUrl(videoId, formatId) {
  // ブラウザは常にこのフロントエンド自身の /media/ を叩く(バックエンドのURLは見せない)。
  // ytdlp_apiが解決した直リンクをブラウザから直接叩くと、IPバインドの都合で
  // 再生できないことがあるための対策。
  return `/media/${encodeURIComponent(videoId)}?format_id=${encodeURIComponent(formatId)}`;
}

function renderPlayer(wrap, stream, info) {
  const videoId = stream.video_id;
  const streams = stream.streams || [];
  const combined = streams.filter((s) => s.url && s.vcodec && s.vcodec !== "none" && s.acodec && s.acodec !== "none");
  const videoOnly = streams.filter((s) => s.url && s.vcodec && s.vcodec !== "none" && (!s.acodec || s.acodec === "none"));
  const audioOnly = streams.filter((s) => s.url && (!s.vcodec || s.vcodec === "none") && s.acodec && s.acodec !== "none");
  const hlsUrl = stream.hls_url || null;

  // 解像度ごとに、映像+音声一体のフォーマットを優先しつつ画質の選択肢を作る。
  // 一体フォーマットが無い解像度は、映像onlyを選ばせて裏で音声onlyを同期再生する。
  const byHeight = new Map();
  combined.forEach((s) => {
    const h = s.height || 0;
    const existing = byHeight.get(h);
    if (!existing || (s.tbr || 0) > (existing.tbr || 0)) byHeight.set(h, { ...s, needsAudioSync: false });
  });
  videoOnly.forEach((s) => {
    const h = s.height || 0;
    if (!byHeight.has(h)) byHeight.set(h, { ...s, needsAudioSync: true });
  });
  const qualities = Array.from(byHeight.values()).sort((a, b) => (b.height || 0) - (a.height || 0));

  const bestAudio = audioOnly.slice().sort((a, b) => (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0))[0] || null;

  if (!qualities.length && !hlsUrl) {
    wrap.innerHTML = '<div class="player-fallback">再生可能なフォーマットが見つかりませんでした。<br>(映像+音声が一体になったフォーマットが無い動画の可能性があります)</div>';
    return;
  }

  // 既定は itag 18 (360p、映像+音声一体)。無ければ一番高画質のものにフォールバック。
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
      <div class="player-spinner" id="playerSpinner"><div class="spinner-circle"></div></div>
      <div class="player-controls">
        <input type="range" class="seek-bar" id="seekBar" min="0" max="100" value="0" step="0.1">
        <div class="controls-row">
          <button class="ctrl-btn" id="playPauseBtn" aria-label="再生">${icon("play")}</button>
          <div class="time-display"><span id="curTime">0:00</span>&nbsp;/&nbsp;<span id="durTime">0:00</span></div>
          <div class="spacer"></div>
          <button class="ctrl-btn" id="muteBtn" aria-label="ミュート切替">${icon("volume")}</button>
          <input type="range" class="volume-bar" id="volumeBar" min="0" max="100" value="100" aria-label="音量">
          ${qualities.length >= 1 ? `<select class="quality-select" id="qualitySelect" aria-label="画質">${qualityOptionsHTML}</select>` : ""}
          <button class="ctrl-btn" id="fullscreenBtn" aria-label="全画面表示">${icon("fullscreen")}</button>
        </div>
      </div>
    </div>`;

  const videoEl = document.getElementById("player");
  const playerRoot = document.getElementById("customPlayer");

  // 映像onlyフォーマット選択時に使う、裏で流す音声用のaudio要素の参照。
  // wireCustomPlayerControls側の音量/ミュート操作からも触れるようオブジェクトで共有する。
  const syncState = { audioEl: null, intervalId: null };

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
    // 直リンク(CDNの実URL)をまず試す。プロキシを経由しない分、二段中継の帯域
    // ボトルネックが無くて速い。IPバインド等で直リンクが弾かれる場合だけ、
    // errorイベントを合図にプロキシ経由(/media/...)へ自動的に切り替える。
    const proxyUrl = mediaProxyUrl(videoId, formatId);
    let fellBack = false;
    const onError = () => {
      if (fellBack) return;
      fellBack = true;
      el.removeEventListener("error", onError);
      el.src = proxyUrl;
    };
    el.addEventListener("error", onError);
    el.src = directUrl || proxyUrl;
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
      const drift = videoEl.currentTime - syncState.audioEl.currentTime;
      const absDrift = Math.abs(drift);
      if (absDrift > 1.0) {
        // 大きくズレた時(バッファリング停止直後など)だけハードシークで合わせ直す。
        // seekは音が一瞬途切れるので、これは本当にズレが大きい時だけにする。
        syncState.audioEl.currentTime = videoEl.currentTime;
        syncState.audioEl.playbackRate = 1.0;
      } else if (absDrift > 0.15) {
        // 小さいズレはseekせず、再生速度をほんの少しだけ speed up/down して
        // 滑らかに追従させる(音が途切れない)。
        syncState.audioEl.playbackRate = drift > 0 ? 1.05 : 0.95;
      } else {
        syncState.audioEl.playbackRate = 1.0;
      }
    };
    syncState.intervalId = setInterval(resync, 500);
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

  wireCustomPlayerControls(videoEl, playerRoot, syncState);

  const qualitySelect = document.getElementById("qualitySelect");
  if (qualitySelect) {
    qualitySelect.addEventListener("change", () => {
      const chosen = qualities.find((q) => q.format_id === qualitySelect.value);
      if (chosen) loadSource(chosen, true);
    });
  }
}

function attachHlsSource(videoEl, hlsUrl) {
  // ライブ配信のHLSは(今のところ)プロキシを通していないので、CDNへの直接アクセスになる。
  // VOD(通常動画)は上のmediaProxyUrl経由なのでこの分岐に来ない。
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

function wireCustomPlayerControls(videoEl, playerRoot, syncState) {
  const playBtn = playerRoot.querySelector("#playPauseBtn");
  const seekBar = playerRoot.querySelector("#seekBar");
  const curTimeEl = playerRoot.querySelector("#curTime");
  const durTimeEl = playerRoot.querySelector("#durTime");
  const muteBtn = playerRoot.querySelector("#muteBtn");
  const volumeBar = playerRoot.querySelector("#volumeBar");
  const fullscreenBtn = playerRoot.querySelector("#fullscreenBtn");
  const spinner = playerRoot.querySelector("#playerSpinner");

  // YouTubeと同じく、読み込み中/バッファリング中はぐるぐる回るスピナーを出す。
  // 再生できる状態になったら消す。
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
    // 再生し終わった(赤丸より左側)部分を白く塗る。input[type=range]は
    // 単純なbackgroundだと全体が同じ色になるので、gradientで自前に描く。
    seekBar.style.background =
      `linear-gradient(to right, #fff 0%, #fff ${pct}%, rgba(255,255,255,0.3) ${pct}%, rgba(255,255,255,0.3) 100%)`;
  }
  updateSeekBarFill(0);

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
  videoEl.addEventListener("click", togglePlay);
  videoEl.addEventListener("play", () => { playBtn.innerHTML = icon("pause"); });
  videoEl.addEventListener("pause", () => { playBtn.innerHTML = icon("play"); });

  videoEl.addEventListener("timeupdate", () => {
    curTimeEl.textContent = formatPlayerTime(videoEl.currentTime);
    if (!seeking && videoEl.duration) {
      const pct = (videoEl.currentTime / videoEl.duration) * 100;
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
      curTimeEl.textContent = formatPlayerTime((seekBar.value / 100) * videoEl.duration);
    }
  });
  seekBar.addEventListener("change", () => {
    if (videoEl.duration) {
      const t = (seekBar.value / 100) * videoEl.duration;
      videoEl.currentTime = t;
      if (syncState.audioEl) syncState.audioEl.currentTime = t;
    }
    seeking = false;
  });

  function updateVolumeIcon() {
    muteBtn.innerHTML = (videoEl.muted || videoEl.volume === 0) ? icon("volumeMute") : icon("volume");
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
    // iOS Safariは要素単位のFullscreen APIに対応していないことが多く、
    // videoタグ自身のwebkitEnterFullscreen(ネイティブの全画面プレイヤー)を使う必要がある。
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
}

const CHANNEL_TABS = [
  { key: "videos", label: "動画" },
  { key: "streams", label: "ライブ" },
  { key: "playlists", label: "再生リスト" },
];

async function initChannelPage(channelId) {
  const header = document.getElementById("channelHeader");
  const grid = document.getElementById("channelGrid");
  const tabsBox = document.getElementById("channelTabs");
  let currentTab = "videos";

  function renderTabs() {
    if (!tabsBox) return;
    tabsBox.innerHTML = CHANNEL_TABS.map(
      (t) => `<button type="button" class="channel-tab-btn ${t.key === currentTab ? "active" : ""}" data-tab="${t.key}">${t.label}</button>`
    ).join("");
    tabsBox.querySelectorAll(".channel-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.tab === currentTab) return;
        currentTab = btn.dataset.tab;
        renderTabs();
        loadEntries();
      });
    });
  }

  async function loadEntries() {
    grid.innerHTML = skeletonGridHTML(12);
    try {
      const data = await fetchJSON(`/proxy/channel/${encodeURIComponent(channelId)}?tab=${encodeURIComponent(currentTab)}&limit=30`);
      const entries = data.entries || [];
      grid.innerHTML = entries.length
        ? entries.map((e) => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("")
        : '<div class="empty-state">見つかりませんでした。</div>';
    } catch (e) {
      showError(grid.parentElement || grid, e.message);
    }
  }

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

    renderTabs();

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
      <h1 class="section-title">${escapeHtml(truncateText(data.title || "", 150))}</h1>
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

  const clearServerCacheBtn = document.getElementById("clearServerCache");
  const serverCachePasswordInput = document.getElementById("serverCachePassword");
  const serverCacheStatus = document.getElementById("serverCacheStatus");
  if (clearServerCacheBtn) {
    clearServerCacheBtn.addEventListener("click", async () => {
      const password = (serverCachePasswordInput && serverCachePasswordInput.value) || "";
      if (!password) {
        serverCacheStatus.textContent = "管理者パスワードを入力してください。";
        return;
      }
      clearServerCacheBtn.disabled = true;
      serverCacheStatus.textContent = "削除中...";
      try {
        const params = new URLSearchParams();
        params.set("password", password);
        const extra = apiBaseQueryParam();
        if (extra) new URLSearchParams(extra).forEach((v, k) => params.set(k, v));
        const res = await fetch(`/proxy/cache-clear-all?${params.toString()}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.message || `HTTPエラー (${res.status})`);
        serverCacheStatus.textContent =
          `削除しました(一覧: ${data.index_entries_removed}件 / レスポンスキャッシュ: ${data.response_cache_entries_removed}件)`;
      } catch (e) {
        serverCacheStatus.textContent = `失敗しました: ${e.message}`;
      } finally {
        clearServerCacheBtn.disabled = false;
      }
    });
  }
}

// ---------- サイドバー開閉(モバイル幅) ----------

function toggleSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  if (!sidebar) return;
  // モバイル幅は「隠れているのを.openで出す」、タブレット/デスクトップ幅は
  // 「出ているのを.collapsedで隠す」という逆の既定状態なので、
  // 今の画面幅に応じてどちらのクラスを操作するか切り替える。
  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  if (isMobile) {
    sidebar.classList.toggle("open");
  } else {
    sidebar.classList.toggle("collapsed");
  }
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

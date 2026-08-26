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

function playlistCardHTML(e) {
  const count = e.video_count ? `${e.video_count}本の動画` : "再生リスト";
  return `
    <a class="card playlist-card" href="/playlist?list=${encodeURIComponent(e.video_id)}">
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

function channelCardHTML(e) {
  const avatarHTML = e.channel_thumbnail ? `<img src="${escapeHtml(e.channel_thumbnail)}" alt="" loading="lazy">` : escapeHtml((e.title || "?")[0] || "?");
  const subInfo = [e.subscriber_count_text, e.video_count_text].filter(Boolean).join(" &middot; ");
  return `
    <a class="card channel-card" href="/channel/${encodeURIComponent(e.channel_id)}">
      <div class="channel-card-avatar">${avatarHTML}</div>
      <div class="meta" style="flex-direction:column; align-items:center; text-align:center;">
        <div class="title">${escapeHtml(e.title)}</div>
        <div class="sub">${subInfo ? escapeHtml(subInfo) : "チャンネル"}</div>
      </div>
    </a>`;
}

function videoCardHTML(e, watchHref, options) {
  if (e.entry_type === "playlist") return playlistCardHTML(e);
  if (e.entry_type === "channel") return channelCardHTML(e);
  const vertical = options && options.vertical;
  const isLive = e.live_status === "is_live";
  const isUpcoming = e.live_status === "is_upcoming";
  let badge = "";
  if (isLive) {
    badge = `<span class="duration live-badge">LIVE</span>`;
  } else if (isUpcoming) {
    badge = `<span class="duration upcoming-badge">${escapeHtml(formatUpcomingLabel(e.release_timestamp))}</span>`;
  } else if (e.duration) {
    badge = `<span class="duration">${escapeHtml(formatDuration(e.duration))}</span>`;
  }
  const views = e.view_count ? formatViews(e.view_count) : e.view_count_text || "";
  const avatarHTML = e.channel_thumbnail ? `<img src="${escapeHtml(e.channel_thumbnail)}" alt="" loading="lazy">` : escapeHtml((e.channel || "?")[0] || "?");
  return `
    <a class="card ${vertical ? "card-vertical" : ""}" href="${watchHref}">
      <div class="thumb-wrap ${vertical ? "thumb-wrap-vertical" : ""}">
        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}
        ${badge}
      </div>
      <div class="meta">
        <div class="avatar">${avatarHTML}</div>
        <div>
          <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>
          <div class="sub">${escapeHtml(e.channel || "")}${(isLive || isUpcoming) ? "" : views ? " &middot; " + escapeHtml(views) : ""}</div>
        </div>
      </div>
    </a>`;
}

function relatedCardHTML(e) {
  if (e.entry_type === "playlist") {
    const count = e.video_count ? `${e.video_count}本の動画` : "再生リスト";
    return `
    <a class="related-card" href="/playlist?list=${encodeURIComponent(e.video_id)}">
      <div class="thumb-wrap" style="width:168px;">
        ${e.thumbnail ? `<img src="${escapeHtml(e.thumbnail)}" loading="lazy" alt="">` : ""}
        <span class="playlist-badge">${icon("playlistStack")}${escapeHtml(count)}</span>
      </div>
      <div>
        <div class="title">${escapeHtml(truncateText(e.title, 100))}</div>
        <div class="sub">再生リストの全体を見る</div>
      </div>
    </a>`;
  }
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
  const avatarHTML = c.author_thumbnail ? `<img src="${escapeHtml(c.author_thumbnail)}" alt="" loading="lazy">` : escapeHtml((c.author || "?")[0] || "?");
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

function likeButtonHTML(videoId, likeCount, meta) {
  const liked = isLiked(videoId);
  const countText = likeCount ? formatCountJa(likeCount) : "";
  const m = meta || {};
  const activeStyle = liked ? "color:var(--accent);" : "";
  return `<button class="stat-pill like-btn ${liked ? "active" : ""}" data-action="toggle-like" style="${activeStyle}"
    data-video-id="${escapeHtml(videoId)}"
    data-title="${escapeHtml(m.title || "")}"
    data-thumbnail="${escapeHtml(m.thumbnail || "")}"
    data-channel="${escapeHtml(m.channel || "")}"
    data-duration="${escapeHtml(m.duration || "")}">
    ${icon("thumbsUp")}${countText}
  </button>`;
}

// data-action属性を持つボタン類のクリックをまとめて拾う委任イベント。
// ページごとに個別配線する必要がなく、後から差し込まれた要素にも自動で効く。
document.addEventListener("pointerup", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  if (btn.dataset.action === "toggle-subscribe") {
    const nowSubscribed = toggleSubscribe(btn.dataset.channelId, {
      channel: btn.dataset.channelName,
      thumbnail: btn.dataset.channelThumb,
    });
    btn.classList.toggle("subscribed", nowSubscribed);
    btn.textContent = nowSubscribed ? "登録済み" : "チャンネル登録";
  } else if (btn.dataset.action === "toggle-like") {
    const nowLiked = toggleLike(btn.dataset.videoId, {
      title: btn.dataset.title,
      thumbnail: btn.dataset.thumbnail,
      channel: btn.dataset.channel,
      duration: btn.dataset.duration ? Number(btn.dataset.duration) : null,
    });
    btn.classList.toggle("active", nowLiked);
    btn.style.color = nowLiked ? "var(--accent)" : "";
  } else if (btn.dataset.action === "toggle-sidebar") {
    toggleSidebar();
  }
});

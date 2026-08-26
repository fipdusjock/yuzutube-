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

const CHANNEL_TABS = [
  { key: "videos", label: "動画" },
  { key: "shorts", label: "ショート" },
  { key: "streams", label: "ライブ" },
  { key: "playlists", label: "再生リスト" },
];

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
      let entries = data.entries || [];
      hasMore = entries.length >= PAGE_SIZE;
      offset += entries.length;
      const isShorts = currentTab === "shorts";
      if (isShorts) {
        // ショートタブから返ってきた動画はdurationが正しく取れていないことがあり
        // (yt-dlpのflat抽出の制約)、その場合長さベースのis_short判定が効かない。
        // /shortsタブから来ている時点でショートであることは確定しているので上書きする。
        entries = entries.map(e => ({ ...e, is_short: true }));
      }
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
    header.innerHTML = `
      <div class="youtube-playlist-badge">YouTubeの再生リスト</div>
      <h1 class="section-title">${escapeHtml(truncateText(data.title || "", 150))}</h1>
      <div style="color:var(--text-secondary); font-size:13px; margin-bottom:24px;">
        ${escapeHtml(data.uploader || "")}${data.entry_count_total ? " &middot; " + data.entry_count_total + " 本" : ""}
      </div>`;
    const entries = data.entries || [];
    grid.innerHTML = entries.length ? entries.map(e => videoCardHTML(e, `/watch?v=${encodeURIComponent(e.video_id)}`)).join("") : '<div class="empty-state">動画が見つかりませんでした。</div>';
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
  box.innerHTML = subs.map(s => `
    <a class="sub-row" href="/channel/${encodeURIComponent(s.channel_id)}">
      <div class="avatar" style="width:48px;height:48px;">
        ${s.thumbnail ? `<img src="${escapeHtml(s.thumbnail)}" alt="">` : escapeHtml((s.channel || "?")[0] || "?")}
      </div>
      <div class="title">${escapeHtml(s.channel || "")}</div>
    </a>`).join("");
}

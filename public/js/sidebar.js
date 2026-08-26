function toggleSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

function recordAndShowVisitCount() {
  const box = document.getElementById("sidebarVisitCount");
  // 記録は毎回のページ表示で行う(タブを開くたびに+1、厳密な重複排除はしていない
  // あくまで参考程度のシンプルなカウンター)。
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

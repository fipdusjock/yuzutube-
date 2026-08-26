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

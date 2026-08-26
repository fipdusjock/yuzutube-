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
      <div id="savePlaylistList" class="save-playlist-list"></div>
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

  function renderList() {
    const playlists = getMyPlaylists();
    const listBox = document.getElementById("savePlaylistList");
    if (!listBox) return;
    if (!playlists.length) {
      listBox.innerHTML = '<div class="empty-state">プレイリストがまだありません。下から作成してください</div>';
      return;
    }
    listBox.innerHTML = playlists.map((p) => `
      <label class="save-playlist-item">
        <input type="checkbox" class="save-playlist-checkbox" data-playlist-id="${escapeHtml(p.id)}" ${p.videos.some(v => v.video_id === videoId) ? "checked" : ""}>
        <span>${escapeHtml(p.name)}</span>
        <span class="save-playlist-item-count">${p.videos.length}本</span>
      </label>`).join("");

    listBox.querySelectorAll(".save-playlist-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const playlistId = checkbox.dataset.playlistId;
        try {
          if (checkbox.checked) {
            addVideoToMyPlaylist(playlistId, { video_id: videoId, ...meta });
          } else {
            removeVideoFromMyPlaylist(playlistId, videoId);
          }
        } catch (e) {
          alert(e.message || "更新に失敗しました");
          checkbox.checked = !checkbox.checked;
          return;
        }
        renderList();
      });
    });
  }

  document.getElementById("savePlaylistCreateBtn").addEventListener("click", () => {
    const nameInput = document.getElementById("savePlaylistNewName");
    const name = nameInput.value.trim();
    if (!name) return;
    try {
      const playlist = createMyPlaylist(name);
      addVideoToMyPlaylist(playlist.id, { video_id: videoId, ...meta });
      nameInput.value = "";
      renderList();
    } catch (e) {
      alert(e.message || "作成に失敗しました");
    }
  });

  renderList();
}

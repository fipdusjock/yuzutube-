const USE_NOCOOKIE_EMBED_KEY = "tubely_use_nocookie_embed";

async function initWatchPage(videoId) {
  const infoBox = document.getElementById("videoInfo");
  const relatedBox = document.getElementById("relatedList");
  const commentsBox = document.getElementById("commentsList");
  const playerWrap = document.getElementById("playerWrap");
  const liveChatPanel = document.getElementById("liveChatPanel");
  const liveChatBox = document.getElementById("liveChatBox");
  const useNocookieEmbed = localStorage.getItem(USE_NOCOOKIE_EMBED_KEY) === "1";

  try {
    // /api/stream がinfo相当のメタデータも一緒に返してくるので、1回のリクエストで済む。
    const stream = await fetchJSON(`/proxy/stream/${encodeURIComponent(videoId)}`);
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
      duration: info.duration || null,
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
      startLiveChatPolling(videoId, liveChatBox);
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

  box.innerHTML = `
    <div class="video-title">${escapeHtml(truncateText(info.title || "", 150))}</div>
    <div class="video-meta-row">
      <div class="video-owner">
        <div class="avatar">${ownerAvatarHTML}</div>
        <div class="video-owner-info">
          <div class="name">${channelLink}</div>
          ${info.channel_follower_count ? `<div class="subs">${formatCountJa(info.channel_follower_count)} 人の登録者</div>` : ""}
        </div>
      </div>
      ${subscribeButtonHTML(info.channel_id, channelName, ownerAvatarSrc)}
    </div>
    <div class="video-stats-row">${stats.join("")}</div>
    <div class="description-box" id="descriptionBox">
      ${descStatBoxes}
      <div class="description-inner">
        <div class="description-text">${info.description ? linkifyText(info.description) : "(説明文なし)"}</div>
        ${chapters ? `<div class="chapters"><div style="font-weight:600; margin-bottom:6px;">チャプター</div>${chapters}</div>` : ""}
      </div>
      <button type="button" class="desc-toggle-btn" id="descToggleBtn">もっと見る</button>
    </div>`;

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

  const descBox = box.querySelector("#descriptionBox");
  const descToggleBtn = box.querySelector("#descToggleBtn");
  if (descBox && descToggleBtn) {
    descBox.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const expanded = descBox.classList.toggle("expanded");
      descToggleBtn.textContent = expanded ? "閉じる" : "もっと見る";
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
}

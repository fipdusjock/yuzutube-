const _LIVECHAT_TYPE_LABEL = {
  superChat: "スーパーチャット",
  superSticker: "スーパーステッカー",
  newSponsor: "新規メンバー",
  membership: "メンバーシップ",
};

function renderLiveChatMessageParts(parts) {
  // message_partsは、文字列(普通のテキスト)と
  // {id, txt, url}(絵文字/スタンプ画像)が混在した配列。
  if (!Array.isArray(parts)) return "";
  return parts.map(p => {
    if (p && typeof p === "object" && p.url) {
      return `<img class="chat-emoji" src="${escapeHtml(p.url)}" alt="${escapeHtml(p.txt || "")}" title="${escapeHtml(p.txt || "")}" loading="lazy">`;
    }
    return escapeHtml(typeof p === "string" ? p : "");
  }).join("");
}

function renderLiveChatRow(m) {
  const author = m.author || {};
  const badges = [];
  if (author.is_owner) badges.push('<span class="chat-badge chat-badge-owner">配信者</span>');
  else if (author.is_moderator) badges.push('<span class="chat-badge chat-badge-mod">モデレーター</span>');
  else if (author.is_member) badges.push('<span class="chat-badge chat-badge-member">メンバー</span>');
  const typeLabel = _LIVECHAT_TYPE_LABEL[m.type];
  const amountHtml = m.amount ? `<span class="chat-amount">${escapeHtml(m.amount)}</span>` : "";
  const rowClass = m.type && m.type !== "textMessage" ? "chat-row chat-row-highlight" : "chat-row";
  return `<div class="${rowClass}">
    ${author.image_url ? `<img class="chat-avatar" src="${escapeHtml(author.image_url)}" alt="" loading="lazy">` : ""}
    <div class="chat-row-body">
      <div class="chat-row-head">
        <span class="author">${escapeHtml(author.name || "")}</span>${badges.join("")}${typeLabel ? `<span class="chat-type-label">${escapeHtml(typeLabel)}</span>` : ""}${amountHtml}
      </div>
      <div class="chat-row-text">${renderLiveChatMessageParts(m.message_parts && m.message_parts.length ? m.message_parts : [m.message || ""])}</div>
    </div>
  </div>`;
}

function startLiveChatPolling(videoId, liveChatBox) {
  let afterSeq = 0;
  let stopped = false;
  let firstLoad = true;
  const MAX_ROWS_IN_DOM = 300; // 表示しすぎるとブラウザが重くなるので上限を設ける

  // ページを離れたら(watchページから移動したら)ポーリングを止める
  const stopIfDetached = () => {
    if (!document.body.contains(liveChatBox)) {
      stopped = true;
      return true;
    }
    return false;
  };

  function poll() {
    if (stopped || stopIfDetached()) return;
    fetchJSON(`/proxy/livechat/${encodeURIComponent(videoId)}?after=${afterSeq}`).then(data => {
      if (stopped || stopIfDetached()) return;
      const messages = data.messages || [];
      if (firstLoad) {
        liveChatBox.innerHTML = "";
        firstLoad = false;
      }
      if (messages.length) {
        // 一番下にいる(＝最新を追いかけている)場合だけ、追加後も自動スクロールする
        const wasAtBottom = liveChatBox.scrollHeight - liveChatBox.scrollTop - liveChatBox.clientHeight < 40;
        const html = messages.map(renderLiveChatRow).join("");
        liveChatBox.insertAdjacentHTML("beforeend", html);
        while (liveChatBox.children.length > MAX_ROWS_IN_DOM) {
          liveChatBox.removeChild(liveChatBox.firstChild);
        }
        if (wasAtBottom) liveChatBox.scrollTop = liveChatBox.scrollHeight;
        afterSeq = data.latest_seq || afterSeq;
      } else if (firstLoad === false && liveChatBox.children.length === 0) {
        liveChatBox.innerHTML = '<div class="chat-note">チャットを待っています…</div>';
      }
      const interval = data.poll_interval_ms || 3000;
      if (!stopped) setTimeout(poll, interval);
    }).catch(() => {
      if (stopped) return;
      if (firstLoad) {
        liveChatBox.innerHTML = '<div class="chat-note">ライブチャットを取得できませんでした。</div>';
      }
      // エラー時は少し間隔を空けてリトライする(取得できないまま無限に叩き続けない)
      if (!stopped) setTimeout(poll, 8000);
    });
  }
  poll();
}

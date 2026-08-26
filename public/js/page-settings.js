function initSettingsPage() {
  const nocookieToggle = document.getElementById("useNocookieEmbed");
  if (nocookieToggle) {
    nocookieToggle.checked = localStorage.getItem(USE_NOCOOKIE_EMBED_KEY) === "1";
    nocookieToggle.addEventListener("change", () => {
      localStorage.setItem(USE_NOCOOKIE_EMBED_KEY, nocookieToggle.checked ? "1" : "0");
    });
  }

  const clearBtn = document.getElementById("clearLocalData");
  const clearStatus = document.getElementById("clearStatus");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(SUBS_KEY);
      localStorage.removeItem(LIKES_KEY);
      localStorage.removeItem(HISTORY_KEY);
      clearStatus.textContent = "削除しました。";
    });
  }

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
        // パスワードはURLクエリではなく専用ヘッダーで送る(アクセスログ・ブラウザ履歴に残さないため)
        const res = await fetch("/proxy/cache-clear-all", {
          method: "DELETE",
          headers: { "X-Admin-Password": password },
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

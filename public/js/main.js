const PAGE_INIT = {
  index: () => initIndexPage(),
  results: (ds) => initResultsPage(ds.query || ""),
  watch: (ds) => initWatchPage(ds.videoId),
  channel: (ds) => initChannelPage(ds.channelId),
  playlist: (ds) => initPlaylistPage(ds.playlistId),
  subscriptions: () => initSubscriptionsPage(),
  liked: () => initLikedPage(),
  history: () => initHistoryPage(),
  my_playlists: () => initMyPlaylistsPage(),
  my_playlist_detail: (ds) => initMyPlaylistDetailPage(ds.playlistId),
};

document.addEventListener("DOMContentLoaded", () => {
  initSearchSuggest();
  renderSidebarSubs();
  recordAndShowVisitCount();

  const ds = document.body.dataset;
  const initPage = PAGE_INIT[ds.page];
  if (initPage) initPage(ds);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // 対応していない/失敗しても、通常のWebサイトとしては問題なく動くので無視する
    });
  });
}

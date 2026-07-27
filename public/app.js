// hls.jsはCDNから読み込む前提(watch.htmlでhls_urlがある時だけ読み込む)。
// progressiveな(映像+音声一体の)URLがあればそのまま<video src>に突っ込むだけで再生できるので、
// ここではHLSしか無いケースだけ面倒を見ればいい。
function initPlayer(videoEl, playableUrl, hlsUrl) {
  if (playableUrl) {
    videoEl.src = playableUrl;
    return;
  }
  if (!hlsUrl) {
    return; // watch.html側でフォールバック表示している
  }
  if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    // Safariなどネイティブ対応環境はそのまま
    videoEl.src = hlsUrl;
    return;
  }
  if (window.Hls && window.Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoEl);
  }
}

// サイドバー(スマホ幅では非表示にしてあるので、ハンバーガーで開閉できるようにする)
function toggleSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  if (!sidebar) return;
  sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
}

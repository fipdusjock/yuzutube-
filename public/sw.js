const CACHE_NAME = "yuzutube-shell-v2";
const SHELL_ASSETS = ["/style.css", "/app.js", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // 動画/音声/API/ページ本体はキャッシュしない(常に最新を取りに行く)。
  // CSS/JS/アイコンなど、見た目に関わる静的アセットだけをオフライン対応させる。
  if (event.request.method !== "GET") return;
  if (!SHELL_ASSETS.includes(url.pathname)) return;

  // ネットワーク優先(オンラインなら常に最新のCSS/JSを取りに行く)。
  // このサイトは頻繁に更新しているため、以前の「キャッシュを即座に返しつつ裏で更新」
  // 方式だと、更新した内容が反映されるまでに1回余分な訪問が必要になってしまい、
  // 「直したはずのバグがまだ再現する」という混乱の原因になっていた。
  // オフライン時のみ、キャッシュ済みの内容にフォールバックする。
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

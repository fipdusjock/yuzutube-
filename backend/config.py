"""環境変数から読み込む設定値。"""

import os

#: ytdlp_api のベースURL。設定画面等からユーザーが任意のURLに差し替えられるように
#: すると、このサーバーを任意のホストへのSSRF踏み台/オープンプロキシとして悪用でき
#: てしまうため、実行時オーバーライドは提供しない(サーバー管理者が環境変数で固定する)。
API_BASE = os.environ.get("YTDLP_API_BASE_URL", "https://yuzu3da.com").rstrip("/")

SITE_NAME = os.environ.get("SITE_NAME", "yuzutube")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

#: バックエンド(ytdlp_api)へのプロキシリクエストのタイムアウト(秒)
PROXY_TIMEOUT = 60
#: 動画/音声データそのものを中継するリクエストのタイムアウト(秒)
MEDIA_TIMEOUT = 30

# バックエンドへのリクエストにブラウザっぽいUser-Agentを付ける。
# 素のPython requestsのUA(python-requests/x.x)のままだと、Cloudflareの本物のゾーン
# (Bot対策付き)に乗っているドメインでは403でブロックされることがあったための対応。
BACKEND_REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ),
}

# ytdlp_api側の /api/token/issue から取得する短命トークン。X-API-Token ヘッダーで
# 全リクエストに付与する。
TOKEN_ISSUE_PATH = "/api/token/issue"
TOKEN_REFRESH_MARGIN_SECONDS = 30  # 期限ちょうどでの失効を避けるため、この秒数前倒しで取り直す
TOKEN_FETCH_TIMEOUT = 10

"""
ytdlp_frontend - ytdlp_apiを叩いて、YouTubeに寄せた見た目で
検索・視聴・関連動画・コメントを表示するフロントエンド。

実装は backend/ パッケージに分割してある。このファイルはgunicorn/各種
デプロイ設定(Procfile, render.yaml, railway.json, Dockerfile等)が参照する
`app:app` というエントリーポイントを保つためだけの薄いラッパー。
"""

import os

from backend import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, threaded=True)

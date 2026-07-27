# ytdlp_frontend

`ytdlp_api`(あなたのサーバー: `http://ytdlp56.duckdns.org:5000`)を叩いて、
YouTubeそっくりの見た目で検索・視聴・関連動画・コメントを表示するだけのフロントエンド。

- ロゴなどYouTubeの商標そのものは使っていません(配色・レイアウト・タイポグラフィだけ寄せてあります)
- サーバー(Flask)側でAPIを叩いてHTMLを組み立てて返す構成なので、ブラウザ側のCORS設定は不要です
- `ytdlp_api`本体とは完全に別プロセス・別ポートで動きます
- Vercel / Render / Railway / Docker対応プラットフォーム、どれでもデプロイできる構成にしてあります

## セットアップ(ローカル/Termux)

```bash
cd ytdlp_frontend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 起動(ローカル/Termux)

```bash
source venv/bin/activate
python3 app.py
# デフォルトで 0.0.0.0:8000 で待受
```

`ytdlp_api`が別の場所で動いている場合は、環境変数で向き先を変えられます。

```bash
YTDLP_API_BASE_URL=http://ytdlp56.duckdns.org:5000 python3 app.py
```

(何も指定しなければこのURLがデフォルトになっています)

同じTermux上で`ytdlp_api`(5000番)と`ytdlp_frontend`(8000番)を両方動かす場合は、
`tmux`で2枚窓を開いてそれぞれ起動するのがおすすめです。ngrokで外部公開する場合は
フロントエンド側の8000番をトンネルしてください。

---

## デプロイ

すべてのデプロイ先で共通して必要なのは環境変数 **`YTDLP_API_BASE_URL`** の設定だけです
(未設定でも `http://ytdlp56.duckdns.org:5000` がデフォルトなのでそのままでも動きます)。

`ytdlp_api`側(バックエンド)はTermux/自宅サーバーなど常時起動できる環境に置いたままにして、
このフロントエンドだけをVercel/Renderなどにデプロイする想定です。

### Vercel

`app.py`をFlaskのエントリポイントとして自動検出してくれるので、追加設定はほぼ不要です。

```bash
npm i -g vercel
cd ytdlp_frontend
vercel deploy
```

またはGitHubリポジトリをVercelダッシュボードでImportするだけでもOKです。
`vercel.json`で関数のタイムアウトを30秒に伸ばしてあります(yt-dlp経由の情報取得は
多少時間がかかることがあるため)。無料(Hobby)プランではこの上限がさらに短い場合があるので、
タイムアウトが頻発するようならプラン側の制限も確認してください。

静的ファイル(`style.css` / `app.js`)は`public/`ディレクトリに置いてあり、Vercelがここを
自動的にCDN配信してくれます(Flaskの`static_folder`はVercel上では推奨されないため、
あえて`public/`+専用ルートという構成にしてあります)。

### Render

1. GitHubにpushしたリポジトリをRenderで「New Web Service」として作成
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
4. 環境変数に `YTDLP_API_BASE_URL` を設定(任意、デフォルトのままでも可)

同梱の `render.yaml` を使えば、Renderの「Blueprint」機能でこの設定を自動反映できます。

### Railway / Heroku 系(Procfileベース)

`Procfile` を同梱しているので、リポジトリを繋ぐだけでほぼ自動的に認識されます。

```
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

### Docker対応プラットフォーム全般(Fly.io / Cloud Run / Azure Container Apps 等)

`Dockerfile` を同梱しているので、コンテナデプロイに対応しているプラットフォームなら
基本的にどこでも動きます。

```bash
docker build -t ytdlp-frontend .
docker run -p 8000:8000 -e YTDLP_API_BASE_URL=http://ytdlp56.duckdns.org:5000 ytdlp-frontend
```

---

## ページ構成

| パス | 内容 |
|---|---|
| `/` | トップページ。検索、または動画ID/URLを直接開く入力欄 |
| `/results?q=検索語` | 検索結果グリッド |
| `/watch?v=動画ID` | 動画再生ページ(プレイヤー・チャンネル情報・説明文・チャプター・関連動画・コメント) |
| `/channel/{channel_id}` | チャンネルページ(投稿動画一覧) |
| `/playlist?list=プレイリストID` | プレイリストページ(収録動画一覧) |

## 制限事項

- **「おすすめフィード」はありません。** YouTube本家のトップページは視聴履歴等を加味した
  レコメンドで動いていますが、`ytdlp_api`にはそれを再現する手段が無いため、
  トップページは検索窓+直接入力だけのシンプルな作りにしています。
- **再生できるのは「映像+音声が一体になったフォーマット」だけです。** YouTubeの高画質は
  映像onlyストリーム+音声onlyストリームに分かれていることが多く(DASH)、それらを
  ブラウザの`<video>`タグ単体で合成再生することはできません(MediaSource Extensionsでの
  自前合成が必要になり、今回は実装していません)。そのため、`/api/stream`が返す
  フォーマットの中から「映像+音声が両方揃っている」ものを選び、その中で一番解像度が
  高いものを自動で再生対象にしています。該当フォーマットが無い動画は再生不可の
  メッセージが表示されます(ネイティブHLSがあればそちらにフォールバックします)。
- チャンネルの登録者数・コメントなど、値が無い/取得できない項目は単純に非表示になります。

## 動作確認

Flaskのテストクライアント+ダミーAPIレスポンスで、全ページ(`/`, `/results`, `/watch`,
`/channel`, `/playlist`)のレンダリング、フォーマット選択ロジック(映像+音声一体の
フォーマットが優先して選ばれること)、APIサーバー接続失敗時のエラーページ表示を確認済みです。

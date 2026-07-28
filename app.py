"""
Tubely (ytdlp_frontend) - ytdlp_apiを叩いて、YouTubeに寄せた見た目で
検索・視聴・関連動画・コメントを表示するフロントエンド。

ページ自体は即座に返す(スケルトン状態のHTML)。中身のデータはブラウザ側のJSが
このFlaskアプリの /proxy/* を叩いて取りに行き、後から差し込む方式にしてある。
こうしておくと:
  - バックエンド(ytdlp_api)が重い/落ちてても最初の画面表示だけは即座に出る
  - スケルトンローディング(灰色のプレースホルダーが後から本物に置き換わる演出)ができる
  - /proxy/* はこのサーバー自身が叩くのでCORSを一切気にしなくていい

サイト名は "Tubely" にしてある(YouTube本家と誤認されないように、あえて別名にしてある)。
SITE_NAME環境変数で好きな名前に変更可能。
"""

import os
import re

import requests
from flask import Flask, render_template, request, redirect, url_for, abort, send_from_directory, jsonify, Response
from jinja2 import Undefined

app = Flask(__name__)

DEFAULT_API_BASE = os.environ.get("YTDLP_API_BASE_URL", "http://ytdlp56.duckdns.org:5000").rstrip("/")
SITE_NAME = os.environ.get("SITE_NAME", "Tubely")
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

# /proxy/* からバックエンドを叩く時のタイムアウト。ページ自体は即返すので、
# ここは「フェッチが固まって延々ローディングのままにならない」程度の短さでいい。
PROXY_TIMEOUT = 15

_URL_RE = re.compile(r"^https?://[^\s]+$")


@app.context_processor
def inject_globals():
    return {"site_name": SITE_NAME}


@app.route("/style.css")
def style_css():
    # Vercelはpublic/**をCDNから直接配信するのでこのルートは通らないが、
    # Render/Railway/Termuxなど普通にFlaskプロセスとして動く環境向けのフォールバック。
    return send_from_directory(PUBLIC_DIR, "style.css")


@app.route("/app.js")
def app_js():
    return send_from_directory(PUBLIC_DIR, "app.js")


# ---------- テンプレート用フィルタ(現状はエラーページ等でしか使わないが残しておく) ----------

def format_duration(seconds):
    if not seconds or isinstance(seconds, Undefined):
        return ""
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


app.jinja_env.filters["duration"] = format_duration


# ---------- ページルート(データを持たずに即レンダリング。中身はJSが後から取りに行く) ----------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/results")
def results():
    q = request.args.get("q", "").strip()
    if not q:
        return redirect(url_for("index"))
    return render_template("results.html", query=q)


@app.route("/watch")
def watch():
    video_id = request.args.get("v")
    if not video_id:
        abort(404)
    return render_template("watch.html", video_id=video_id)


@app.route("/channel/<channel_id>")
def channel(channel_id):
    return render_template("channel.html", channel_id=channel_id)


@app.route("/playlist")
def playlist():
    list_id = request.args.get("list")
    if not list_id:
        abort(404)
    return render_template("playlist.html", playlist_id=list_id)


@app.route("/settings")
def settings():
    return render_template("settings.html")


@app.route("/subscriptions")
def subscriptions():
    return render_template("subscriptions.html")


@app.route("/history")
def history():
    return render_template("history.html")


@app.errorhandler(404)
def not_found(e):
    return render_template("error.html", message="ページが見つかりません"), 404


# ---------- プロキシAPI (ブラウザ側のfetchがここを叩く。JSON専用、常にJSONで返す) ----------

def _resolve_api_base():
    """
    設定画面でユーザーが独自のAPI URLを指定していれば(?api_base=...)そちらを使う。
    未指定/不正な値なら環境変数のデフォルトにフォールバックする。
    誰でも叩けるエンドポイントなので、httpかhttpsのURLっぽい形かだけは軽く検証しておく
    (完全なSSRF対策ではない。個人利用のツールという前提)。
    """
    override = request.args.get("api_base", "").strip()
    if override and _URL_RE.match(override):
        return override.rstrip("/")
    return DEFAULT_API_BASE


def _proxy(path, **params):
    api_base = _resolve_api_base()
    try:
        resp = requests.get(f"{api_base}{path}", params=params, timeout=PROXY_TIMEOUT)
    except requests.RequestException as e:
        return jsonify({
            "error": True,
            "message": f"APIサーバーに接続できませんでした ({api_base})。サーバーが起動しているか、"
                       f"ポート開放/ドメイン設定が正しいか確認してください。詳細: {e}",
        }), 502

    if resp.status_code >= 400:
        try:
            detail = resp.json().get("detail")
        except ValueError:
            detail = resp.text[:200]
        return jsonify({"error": True, "message": f"APIエラー (HTTP {resp.status_code}): {detail}"}), resp.status_code

    try:
        data = resp.json()
    except ValueError:
        return jsonify({"error": True, "message": "APIの応答がJSONとして解釈できませんでした。"}), 502

    return jsonify(data)


@app.route("/proxy/trending")
def proxy_trending():
    limit = request.args.get("limit", "24")
    return _proxy("/api/trending", limit=limit)


@app.route("/proxy/search")
def proxy_search():
    q = request.args.get("q", "")
    limit = request.args.get("limit", "24")
    return _proxy("/api/search", q=q, limit=limit)


@app.route("/proxy/info/<video_id>")
def proxy_info(video_id):
    return _proxy(f"/api/info/{video_id}")


@app.route("/proxy/stream/<video_id>")
def proxy_stream(video_id):
    return _proxy(f"/api/stream/{video_id}")


@app.route("/proxy/related/<video_id>")
def proxy_related(video_id):
    limit = request.args.get("limit", "15")
    return _proxy(f"/api/related/{video_id}", limit=limit)


@app.route("/proxy/comments/<video_id>")
def proxy_comments(video_id):
    limit = request.args.get("limit", "30")
    return _proxy(f"/api/comments/{video_id}", limit=limit)


@app.route("/proxy/livechat/<video_id>")
def proxy_livechat(video_id):
    limit = request.args.get("limit", "200")
    return _proxy(f"/api/livechat/{video_id}", limit=limit)


@app.route("/proxy/channel/<channel_id>")
def proxy_channel(channel_id):
    limit = request.args.get("limit", "30")
    return _proxy(f"/api/channel/{channel_id}", limit=limit)


@app.route("/proxy/playlist/<playlist_id>")
def proxy_playlist(playlist_id):
    limit = request.args.get("limit", "100")
    return _proxy(f"/api/playlist/{playlist_id}", limit=limit)


# ---------- メディア中継 (実際の動画/音声バイト列をそのまま流す) ----------

MEDIA_TIMEOUT = 30


@app.route("/media/<video_id>")
def media_proxy(video_id):
    """
    <video src="..."> / <audio src="..."> が直接叩くエンドポイント。
    ytdlp_api の /api/proxy-stream をそのまま中継するだけ。二段プロキシになるが、
    こうしておくとブラウザからは常にこのフロントエンドのドメインしか見えないので、
    設定画面で隠しているAPIサーバーのURLがバレることもない。
    Rangeヘッダもそのまま転送するのでシークも普通に効く。
    """
    format_id = request.args.get("format_id", "18")
    api_base = _resolve_api_base()
    upstream_url = f"{api_base}/api/proxy-stream/{video_id}"

    range_header = request.headers.get("Range")
    fwd_headers = {"Range": range_header} if range_header else {}

    try:
        upstream = requests.get(
            upstream_url,
            params={"format_id": format_id},
            headers=fwd_headers,
            stream=True,
            timeout=MEDIA_TIMEOUT,
        )
    except requests.RequestException as e:
        abort(502, description=f"upstream fetch failed: {e}")

    if upstream.status_code >= 400:
        upstream.close()
        abort(502, description=f"upstream returned {upstream.status_code}")

    passthrough_headers = {}
    for h in ("Content-Range", "Content-Length", "Accept-Ranges", "Content-Type"):
        if h in upstream.headers:
            passthrough_headers[h] = upstream.headers[h]
    passthrough_headers.setdefault("Accept-Ranges", "bytes")
    passthrough_headers.setdefault("Content-Type", "video/mp4")

    def gen():
        try:
            for chunk in upstream.iter_content(65536):
                if chunk:
                    yield chunk
        finally:
            upstream.close()

    return Response(gen(), status=upstream.status_code, headers=passthrough_headers)


if __name__ == "__main__":
    # RenderやRailwayは $PORT を渡してくる。無ければFRONTEND_PORT、それも無ければ8000。
    port = int(os.environ.get("PORT", os.environ.get("FRONTEND_PORT", "8000")))
    app.run(host="0.0.0.0", port=port, threaded=True)

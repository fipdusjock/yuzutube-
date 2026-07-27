"""
ytdlp_frontend - ytdlp_api(http://ytdlp56.duckdns.org:5000 等)を叩いて、
YouTubeそっくりの見た目で検索・再生・関連動画・コメントを表示するだけのフロントエンド。

ロゴなどYouTubeの商標そのものは使っていない(レイアウト・配色・タイポグラフィだけ寄せてある)。
バックエンドとは完全に別プロセス。API_BASE_URL環境変数で向き先を変えられる。
"""

import os

import requests
from flask import Flask, render_template, request, redirect, url_for, abort, send_from_directory
from jinja2 import Undefined

app = Flask(__name__)

API_BASE = os.environ.get("YTDLP_API_BASE_URL", "http://ytdlp56.duckdns.org:5000").rstrip("/")

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")


@app.route("/style.css")
def style_css():
    # Vercelはpublic/**をCDNから直接配信するのでこのルートは通らないが、
    # Render/Railway/Termuxなど普通にFlaskプロセスとして動く環境向けのフォールバック。
    return send_from_directory(PUBLIC_DIR, "style.css")


@app.route("/app.js")
def app_js():
    return send_from_directory(PUBLIC_DIR, "app.js")


class ApiUnavailable(Exception):
    pass


def api_get(path, **params):
    try:
        resp = requests.get(f"{API_BASE}{path}", params=params, timeout=20)
    except requests.RequestException as e:
        raise ApiUnavailable(f"APIサーバーに接続できません: {e}")

    if resp.status_code >= 400:
        try:
            detail = resp.json().get("detail")
        except ValueError:
            detail = resp.text[:200]
        raise ApiUnavailable(f"APIエラー (HTTP {resp.status_code}): {detail}")

    return resp.json()


# ---------- テンプレート用フィルタ ----------

def format_duration(seconds):
    if not seconds or isinstance(seconds, Undefined):
        return ""
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def format_views(n):
    if n is None or isinstance(n, Undefined):
        return ""
    return f"{n:,} 回視聴"


def format_upload_date(date_str):
    # yt-dlpの upload_date は "20260101" みたいなYYYYMMDD文字列
    if not date_str or isinstance(date_str, Undefined) or len(date_str) != 8:
        return date_str if isinstance(date_str, str) else ""
    return f"{date_str[0:4]}/{date_str[4:6]}/{date_str[6:8]}"


app.jinja_env.filters["duration"] = format_duration
app.jinja_env.filters["views"] = format_views
app.jinja_env.filters["uploaddate"] = format_upload_date


def pick_playable_url(streams):
    """
    映像+音声が1本にまとまっている(いわゆるprogressive)フォーマットの中で
    一番解像度が高いものを選ぶ。html5の<video>タグは基本これしか単体再生できない
    (DASHの映像onlyストリームは別途MSEで合成する必要があり、今回はやっていない)。
    """
    combined = [
        s for s in streams
        if s.get("url")
        and s.get("vcodec") not in (None, "none")
        and s.get("acodec") not in (None, "none")
    ]
    if not combined:
        return None
    combined.sort(key=lambda s: (s.get("height") or 0), reverse=True)
    return combined[0]["url"]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/results")
def results():
    q = request.args.get("q", "").strip()
    if not q:
        return redirect(url_for("index"))
    try:
        data = api_get("/api/search", q=q, limit=24)
    except ApiUnavailable as e:
        return render_template("error.html", message=str(e)), 502
    return render_template("results.html", query=q, entries=data.get("entries", []))


@app.route("/watch")
def watch():
    video_id = request.args.get("v")
    if not video_id:
        abort(404)

    try:
        info = api_get(f"/api/info/{video_id}")
        stream = api_get(f"/api/stream/{video_id}")
        related_data = api_get(f"/api/related/{video_id}", limit=15)
        comments_data = api_get(f"/api/comments/{video_id}", limit=30)
    except ApiUnavailable as e:
        return render_template("error.html", message=str(e)), 502

    return render_template(
        "watch.html",
        info=info,
        video_id=video_id,
        playable_url=pick_playable_url(stream.get("streams", [])),
        hls_url=stream.get("hls_url"),
        related=related_data.get("entries", []),
        comments=comments_data.get("comments", []),
    )


@app.route("/channel/<channel_id>")
def channel(channel_id):
    try:
        data = api_get(f"/api/channel/{channel_id}", limit=30)
    except ApiUnavailable as e:
        return render_template("error.html", message=str(e)), 502
    return render_template("channel.html", channel=data)


@app.route("/playlist")
def playlist():
    list_id = request.args.get("list")
    if not list_id:
        abort(404)
    try:
        data = api_get(f"/api/playlist/{list_id}", limit=100)
    except ApiUnavailable as e:
        return render_template("error.html", message=str(e)), 502
    return render_template("playlist.html", playlist=data)


@app.errorhandler(404)
def not_found(e):
    return render_template("error.html", message="ページが見つかりません"), 404


if __name__ == "__main__":
    # RenderやRailwayは $PORT を渡してくる。無ければFRONTEND_PORT、それも無ければ8000。
    port = int(os.environ.get("PORT", os.environ.get("FRONTEND_PORT", "8000")))
    app.run(host="0.0.0.0", port=port, threaded=True)

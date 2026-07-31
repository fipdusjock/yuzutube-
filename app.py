import os
import json
import re

import requests
from flask import Flask, render_template, request, redirect, url_for, abort, send_from_directory, jsonify, Response, make_response
from jinja2 import Undefined

app = Flask(__name__)

DEFAULT_API_BASE = os.environ.get("YTDLP_API_BASE_URL", "https://yuzu3da.com").rstrip("/")
SITE_NAME = os.environ.get("SITE_NAME", "アップデート中")
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

PROXY_TIMEOUT = 60
_BACKEND_REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ),
}

_URL_RE = re.compile(r"^https://[^\s]+$")

FRONTEND_BYPASS_SECRET = os.environ.get("YTDLP_API_FRONTEND_SECRET", "FpmEWQxtgG50Gl69a7xg7vexzxjHyuEgDp2PtVAf8UhJeimO")


def _backend_auth_headers():
    return {"X-Frontend-Secret": FRONTEND_BYPASS_SECRET} if FRONTEND_BYPASS_SECRET else {}


@app.context_processor
def inject_globals():
    return {"site_name": SITE_NAME}


@app.route("/login", methods=["GET"])
def login_page():
    if _current_user_email():
        return redirect(url_for("index"))
    return render_template("login.html")


@app.route("/signup", methods=["GET"])
def signup_page():
    if _current_user_email():
        return redirect(url_for("index"))
    return render_template("signup.html")


@app.route("/api/auth/login", methods=["POST"])
def do_login():
    body = request.get_json(silent=True) or {}
    api_base = _resolve_api_base()
    try:
        resp = requests.post(
            f"{api_base}/api/auth/login",
            json={"email": body.get("email", ""), "password": body.get("password", ""), "ip": _client_ip()},
            headers={**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers()},
            timeout=PROXY_TIMEOUT,
        )
    except requests.RequestException as e:
        app.logger.error("login proxy failed: %s", e)
        return jsonify({"error": True, "message": "サーバーに接続できませんでした"}), 502

    if resp.status_code != 200:
        try:
            message = resp.json().get("detail") or f"ログインに失敗しました (HTTP {resp.status_code})"
        except ValueError:
            app.logger.error("login non-json response (%s): %s", resp.status_code, resp.text[:200])
            message = f"ログインに失敗しました (HTTP {resp.status_code}、サーバーの応答が不正でした)"
        return jsonify({"error": True, "message": message}), resp.status_code

    data = resp.json()
    response = make_response(jsonify({"email": data.get("email")}))
    response.set_cookie(
        SESSION_COOKIE_NAME, data.get("token", ""),
        max_age=SESSION_MAX_AGE, httponly=True, secure=True, samesite="Lax",
    )
    return response


@app.route("/api/auth/signup", methods=["POST"])
def do_signup():
    body = request.get_json(silent=True) or {}
    api_base = _resolve_api_base()
    try:
        resp = requests.post(
            f"{api_base}/api/auth/signup",
            json={"email": body.get("email", ""), "password": body.get("password", ""), "ip": _client_ip()},
            headers={**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers()},
            timeout=PROXY_TIMEOUT,
        )
    except requests.RequestException as e:
        app.logger.error("signup proxy failed: %s", e)
        return jsonify({"error": True, "message": "サーバーに接続できませんでした"}), 502

    if resp.status_code != 200:
        try:
            message = resp.json().get("detail") or f"登録に失敗しました (HTTP {resp.status_code})"
        except ValueError:
            app.logger.error("signup non-json response (%s): %s", resp.status_code, resp.text[:200])
            message = f"登録に失敗しました (HTTP {resp.status_code}、サーバーの応答が不正でした)"
        return jsonify({"error": True, "message": message}), resp.status_code

    data = resp.json()
    response = make_response(jsonify({"email": data.get("email")}))
    response.set_cookie(
        SESSION_COOKIE_NAME, data.get("token", ""),
        max_age=SESSION_MAX_AGE, httponly=True, secure=True, samesite="Lax",
    )
    return response


@app.route("/logout", methods=["GET", "POST"])
def logout():
    response = make_response(redirect(url_for("login_page")))
    response.delete_cookie(SESSION_COOKIE_NAME)
    return response


@app.route("/style.css")
def style_css():
    return send_from_directory(PUBLIC_DIR, "style.css")


@app.route("/app.js")
def app_js():
    return send_from_directory(PUBLIC_DIR, "app.js")


@app.route("/auth.css")
def auth_css():
    return send_from_directory(PUBLIC_DIR, "auth.css")



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



@app.route("/")
def index():
    return render_template("index.html")


@app.route("/results")
def results():
    q = request.args.get("q", "").strip()
    if not q:
        return redirect(url_for("index"))
    return render_template("results.html", query=q)


_PLAYLIST_ID_PREFIXES = ("PL", "UU", "LL", "WL", "FL", "RD", "OL")


@app.route("/watch")
def watch():
    video_id = request.args.get("v")
    if not video_id:
        abort(404)
    if len(video_id) != 11 and video_id.startswith(_PLAYLIST_ID_PREFIXES):
        return redirect(url_for("playlist", list=video_id))
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


@app.route("/changelog")
def changelog_page():
    changelog_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "changelog.json")
    try:
        with open(changelog_path, encoding="utf-8") as f:
            entries = json.load(f)
    except (OSError, json.JSONDecodeError):
        entries = []
    latest_date = entries[0]["date"] if entries else None
    version = f"v{latest_date.replace('-', '.')}" if latest_date else "v0"
    return render_template("changelog.html", entries=entries, version=version)


@app.route("/subscriptions")
def subscriptions():
    return render_template("subscriptions.html")


@app.route("/history")
def history():
    return render_template("history.html")


@app.errorhandler(404)
def not_found(e):
    return render_template("error.html", message="ページが見つかりません"), 404



SESSION_COOKIE_NAME = "yuzutube_session"
SESSION_MAX_AGE = 7 * 24 * 3600  

_AUTH_EXEMPT_PATHS = {
    "/login", "/signup", "/logout", "/style.css", "/app.js", "/auth.css", "/favicon.ico",
    "/api/auth/login", "/api/auth/signup", "/changelog",
}


def _current_user_email():
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        return None
    api_base = _resolve_api_base()
    try:
        resp = requests.post(f"{api_base}/api/auth/verify", json={"token": token}, headers={**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers()}, timeout=PROXY_TIMEOUT)
    except requests.RequestException:
        return None
    if resp.status_code != 200:
        return None
    return resp.json().get("email")


@app.before_request
def _require_login():
    path = request.path
    if path in _AUTH_EXEMPT_PATHS:
        return None
    if _current_user_email():
        return None
    if path.startswith("/proxy/") or path.startswith("/media/"):
        return jsonify({"error": True, "message": "ログインが必要です"}), 401
    return redirect(url_for("login_page"))


def _client_ip():

    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or ""


def _resolve_api_base():

    override = request.args.get("api_base", "").strip()
    if override and _URL_RE.match(override):
        return override.rstrip("/")
    return DEFAULT_API_BASE


def _proxy(path, method="GET", **params):
    api_base = _resolve_api_base()
    headers = {**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers(), "X-Forwarded-For": _client_ip()}
    try:
        resp = requests.request(method, f"{api_base}{path}", params=params, headers=headers, timeout=PROXY_TIMEOUT)
    except requests.RequestException as e:
        app.logger.error("proxy request failed: %s%s -> %s", api_base, path, e)
        return jsonify({
            "error": True,
            "message": "APIサーバーに接続できませんでした。しばらくしてからもう一度お試しください。",
        }), 502

    if resp.status_code >= 400:
        try:
            detail = resp.json().get("detail")
        except ValueError:
            detail = resp.text[:200]
        app.logger.error("proxy upstream error %s: %s", resp.status_code, detail)
        return jsonify({"error": True, "message": f"取得に失敗しました (HTTP {resp.status_code})"}), resp.status_code

    try:
        data = resp.json()
    except ValueError:
        return jsonify({"error": True, "message": "サーバーの応答を解釈できませんでした。"}), 502

    return jsonify(data)


@app.route("/proxy/trending")
def proxy_trending():
    limit = request.args.get("limit", "24")
    category = request.args.get("category", "trending")
    return _proxy("/api/trending", limit=limit, category=category)


@app.route("/proxy/search")
def proxy_search():
    q = request.args.get("q", "")
    limit = request.args.get("limit", "24")
    continuation = request.args.get("continuation", "")
    kwargs = {"q": q, "limit": limit}
    if continuation:
        kwargs["continuation"] = continuation
    return _proxy("/api/search", **kwargs)


@app.route("/proxy/suggest")
def proxy_suggest():
    q = request.args.get("q", "")
    return _proxy("/api/suggest", q=q)


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


@app.route("/proxy/subtitles/<video_id>")
def proxy_subtitles(video_id):
    lang = request.args.get("lang", "ja")
    auto = request.args.get("auto", "0")
    api_base = _resolve_api_base()
    headers = {**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers(), "X-Forwarded-For": _client_ip()}
    try:
        resp = requests.get(
            f"{api_base}/api/subtitles/{video_id}",
            params={"lang": lang, "auto": auto},
            headers=headers,
            timeout=PROXY_TIMEOUT,
        )
    except requests.RequestException as e:
        app.logger.error("subtitle proxy failed: %s -> %s", video_id, e)
        abort(502, description="字幕の取得に失敗しました")

    if resp.status_code >= 400:
        abort(resp.status_code, description="字幕が見つかりませんでした")

    return Response(resp.text, mimetype="text/vtt")


@app.route("/proxy/cache-clear-all", methods=["DELETE"])
def proxy_cache_clear_all():
    password = request.args.get("password", "")
    return _proxy("/api/cache", method="DELETE", password=password)


@app.route("/proxy/channel/<channel_id>")
def proxy_channel(channel_id):
    limit = request.args.get("limit", "30")
    tab = request.args.get("tab", "videos")
    offset = request.args.get("offset", "0")
    return _proxy(f"/api/channel/{channel_id}", limit=limit, tab=tab, offset=offset)


@app.route("/proxy/playlist/<playlist_id>")
def proxy_playlist(playlist_id):
    limit = request.args.get("limit", "100")
    return _proxy(f"/api/playlist/{playlist_id}", limit=limit)



MEDIA_TIMEOUT = 30


@app.route("/media/<video_id>")
def media_proxy(video_id):

    format_id = request.args.get("format_id", "18")
    api_base = _resolve_api_base()
    upstream_url = f"{api_base}/api/proxy-stream/{video_id}"

    range_header = request.headers.get("Range")
    fwd_headers = {**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers(), "X-Forwarded-For": _client_ip()}
    if range_header:
        fwd_headers["Range"] = range_header

    try:
        upstream = requests.get(
            upstream_url,
            params={"format_id": format_id},
            headers=fwd_headers,
            stream=True,
            timeout=MEDIA_TIMEOUT,
        )
    except requests.RequestException as e:
        app.logger.error("media proxy fetch failed: %s -> %s", video_id, e)
        abort(502, description="動画データの取得に失敗しました")

    if upstream.status_code >= 400:
        app.logger.error("media proxy upstream error: %s -> HTTP %s", video_id, upstream.status_code)
        upstream.close()
        abort(502, description="動画データの取得に失敗しました")

    passthrough_headers = {}
    for h in ("Content-Range", "Content-Length", "Accept-Ranges", "Content-Type"):
        if h in upstream.headers:
            passthrough_headers[h] = upstream.headers[h]
    passthrough_headers.setdefault("Accept-Ranges", "bytes")
    passthrough_headers.setdefault("Content-Type", "video/mp4")

    def gen():
        try:
            for chunk in upstream.iter_content(262144):
                if chunk:
                    yield chunk
        except (requests.exceptions.ChunkedEncodingError, requests.exceptions.ConnectionError):
            pass
        finally:
            upstream.close()

    return Response(gen(), status=upstream.status_code, headers=passthrough_headers)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", os.environ.get("FRONTEND_PORT", "8000")))
    app.run(host="0.0.0.0", port=port, threaded=True)

"""
ytdlp_frontend - ytdlp_apiを叩いて、YouTubeに寄せた見た目で
検索・視聴・関連動画・コメントを表示するフロントエンド。

ページ自体は即座に返す(スケルトン状態のHTML)。中身のデータはブラウザ側のJSが
このFlaskアプリの /proxy/* を叩いて取りに行き、後から差し込む方式にしてある。
こうしておくと:
  - バックエンド(ytdlp_api)が重い/落ちてても最初の画面表示だけは即座に出る
  - スケルトンローディング(灰色のプレースホルダーが後から本物に置き換わる演出)ができる
  - /proxy/* はこのサーバー自身が叩くのでCORSを一切気にしなくていい
"""

import os
import json
import re

import requests
from flask import Flask, render_template, request, redirect, url_for, abort, send_from_directory, jsonify, Response, make_response
from jinja2 import Undefined

app = Flask(__name__)

DEFAULT_API_BASE = os.environ.get("YTDLP_API_BASE_URL", "https://yuzu3da.com").rstrip("/")
SITE_NAME = os.environ.get("SITE_NAME", "yuzutube")
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

PROXY_TIMEOUT = 60
# バックエンドへのリクエストにブラウザっぽいUser-Agentを付ける。
# 素のPython requestsのUA(python-requests/x.x)のままだと、yuzu3da.comのように
# Cloudflareの本物のゾーン(Bot対策付き)に乗っているドメインでは403でブロック
# されることがあったための対応。
_BACKEND_REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ),
}

_URL_RE = re.compile(r"^https://[^\s]+$")

# ytdlp_api側は /api/* 全体にトークン必須の門番を置くようになったが、
# ytdlp_frontendだけは専用の合言葉(バックエンドと同じ値)を送ることで
# そのチェックを素通りできる。バックエンド側の YTDLP_API_FRONTEND_SECRET と
# 同じ値をここに設定すること(バックエンドが自動生成した値を frontend_secret.txt から
# コピーしてくるのが手っ取り早い)。
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
            json={
                "email": body.get("email", ""),
                "password": body.get("password", ""),
                "agreed_to_terms": body.get("agreed_to_terms", False),
                "ip": _client_ip(),
            },
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


@app.route("/manifest.json")
def manifest_json():
    return send_from_directory(PUBLIC_DIR, "manifest.json")


@app.route("/sw.js")
def service_worker():
    # Service WorkerはルートスコープでOK。Cache-Controlを短くして更新を反映しやすくする。
    resp = send_from_directory(PUBLIC_DIR, "sw.js")
    resp.headers["Cache-Control"] = "no-cache"
    return resp


@app.route("/favicon.svg")
def favicon_svg():
    return send_from_directory(PUBLIC_DIR, "favicon.svg")


@app.route("/favicon.ico")
def favicon_ico():
    # favicon.icoへの慣習的なアクセスにも、同じデザインのPNGを返しておく
    return send_from_directory(PUBLIC_DIR, "favicon-32.png")


@app.route("/favicon-16.png")
def favicon_16():
    return send_from_directory(PUBLIC_DIR, "favicon-16.png")


@app.route("/favicon-32.png")
def favicon_32():
    return send_from_directory(PUBLIC_DIR, "favicon-32.png")


@app.route("/icons/<path:filename>")
def icons(filename):
    return send_from_directory(os.path.join(PUBLIC_DIR, "icons"), filename)



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


@app.route("/account")
def account_page():
    return render_template("account.html")


@app.route("/inquiries")
def inquiries_page():
    return render_template("inquiries.html")


@app.route("/inquiries/<int:inquiry_id>")
def inquiry_detail_page(inquiry_id):
    return render_template("inquiry_detail.html", inquiry_id=inquiry_id)


@app.route("/admin/moderation")
def admin_moderation_page():
    return render_template("admin_moderation.html")


@app.route("/banned")
def banned_page():
    return render_template("banned.html")


@app.route("/my-playlists")
def my_playlists_page():
    return render_template("my_playlists.html")


@app.route("/my-playlists/<int:playlist_id>")
def my_playlist_detail_page(playlist_id):
    return render_template("my_playlist_detail.html", playlist_id=playlist_id)


@app.route("/terms")
def terms_page():
    return render_template("terms.html")


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


@app.get("/api/frontend-version")
def frontend_version():
    """
    フロントエンドが「アップデートされました」通知を自動表示するための軽量エンドポイント。
    changelog.jsonの最新日付+件数だけを返す(重い処理は無い)。
    """
    changelog_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "changelog.json")
    try:
        with open(changelog_path, encoding="utf-8") as f:
            entries = json.load(f)
    except (OSError, json.JSONDecodeError):
        entries = []
    latest = entries[0] if entries else {}
    version = f"{latest.get('date', '0')}:{len(latest.get('changes', []))}"
    return jsonify({
        "version": version,
        "date": latest.get("date"),
        "changes": latest.get("changes", []),
    })


@app.get("/api/announcement")
def announcement():
    """
    画面中央にモーダルで出す「アップデート予告」。announcement.jsonを直接編集するだけで
    内容を変えられる(コード修正不要)。idを新しい値に変えると、既に見た人にも
    再度表示される(idが変わっていなければ、一度閉じた人には出ない)。
    """
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "announcement.json")
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError):
        data = {}
    return jsonify({
        "id": data.get("id", ""),
        "enabled": bool(data.get("enabled", False)),
        "title": data.get("title", ""),
        "message": data.get("message", ""),
    })


@app.route("/subscriptions")
def subscriptions():
    return render_template("subscriptions.html")


@app.route("/liked")
def liked_videos():
    return render_template("liked.html")


@app.route("/history")
def history():
    return render_template("history.html")


@app.errorhandler(404)
def not_found(e):
    return render_template("error.html", message="ページが見つかりません"), 404



SESSION_COOKIE_NAME = "yuzutube_session"
SESSION_MAX_AGE = 7 * 24 * 3600  # 1週間

# ログイン無しでもアクセスできるパス(ログイン/登録ページ自体、静的ファイル、
# ログイン処理そのもののAPI)。それ以外は全部ログインしていないとリダイレクトされる。
_AUTH_EXEMPT_PATHS = {
    "/login", "/signup", "/logout", "/style.css", "/app.js", "/auth.css", "/favicon.ico",
    "/favicon.svg", "/favicon-16.png", "/favicon-32.png", "/manifest.json", "/sw.js",
    "/api/auth/login", "/api/auth/signup", "/changelog", "/api/frontend-version", "/api/announcement",
    "/banned", "/terms",
}
_AUTH_EXEMPT_PREFIXES = ("/icons/",)


def _current_user_email():
    """このリクエストのCookieに入っているセッショントークンを検証してemailを返す。
    無効/期限切れなら None。"""
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


_BAN_EXEMPT_PATHS = {
    "/banned", "/login", "/signup", "/logout", "/style.css", "/app.js", "/auth.css",
    "/favicon.ico", "/favicon.svg", "/favicon-16.png", "/favicon-32.png", "/manifest.json", "/sw.js",
    "/api/frontend-version", "/api/announcement", "/terms",
}
_BAN_EXEMPT_PREFIXES = ("/icons/", "/inquiries", "/proxy/inquiries", "/proxy/user/me")


@app.before_request
def _enforce_ip_ban():
    """
    BANされたIPからのアクセスは、お問い合わせ・ログイン・プロフィール確認の
    最低限のページ以外は「BANされました」という案内ページに誘導する。
    ログイン要求(_require_login)より先に判定する
    (ログインしていないBAN済みユーザーが、ただのログイン画面に見えてしまわないように)。
    """
    path = request.path
    if path in _BAN_EXEMPT_PATHS or path.startswith(_BAN_EXEMPT_PREFIXES):
        return None

    client_ip = _client_ip()
    api_base = _resolve_api_base()
    try:
        resp = requests.get(
            f"{api_base}/api/ban/check",
            headers={**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers(), "X-Forwarded-For": client_ip},
            timeout=PROXY_TIMEOUT,
        )
        banned = resp.status_code == 200 and resp.json().get("banned")
    except requests.RequestException:
        banned = False  # バックエンドに確認できない場合は、誤って全員弾かないよう素通りさせる

    if not banned:
        return None
    if path.startswith("/proxy/") or path.startswith("/media/") or path.startswith("/api/"):
        return jsonify({"error": True, "message": "このIPアドレスは利用を制限されています。お問い合わせフォームからご連絡ください。"}), 403
    return redirect(url_for("banned_page"))


@app.before_request
def _require_login():
    path = request.path
    if path in _AUTH_EXEMPT_PATHS or path.startswith(_AUTH_EXEMPT_PREFIXES):
        return None
    if _current_user_email():
        return None
    # ページ本体(HTML)はログインページへリダイレクト、
    # /proxy/* や /media/* のようなAPI的なものは401 JSONで返す。
    if path.startswith("/proxy/") or path.startswith("/media/"):
        return jsonify({"error": True, "message": "ログインが必要です"}), 401
    return redirect(url_for("login_page"))


def _client_ip():
    """
    Vercelは実際の訪問者IPを X-Forwarded-For ヘッダに入れて渡してくる
    (Vercelのエッジ〜このFlaskアプリの間はVercelが面倒を見てくれている)。
    このIPをバックエンド(ytdlp_api)側にも転送しておくことで、
    バックエンド側で不正利用対策(レート制限等)をしたくなった時に使えるようにする。
    """
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or ""


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


@app.route("/proxy/visit", methods=["GET", "POST"])
def proxy_visit():
    return _proxy("/api/visit", method=request.method)


@app.route("/proxy/history", methods=["GET", "POST"])
def proxy_history():
    """
    「みんなの視聴履歴」の中継。個人アカウントには紐づけない、サイト全体で
    共有される単一のフィード(誰が見たかは記録しない)。閲覧・記録はログイン
    さえしていれば誰でもできる(削除のような破壊的操作は用意していない)。
    """
    api_base = _resolve_api_base()
    headers = {**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers()}

    if request.method == "GET":
        limit = request.args.get("limit", "100")
        resp = requests.get(f"{api_base}/api/history", params={"limit": limit}, headers=headers, timeout=PROXY_TIMEOUT)
    elif request.method == "POST":
        body = request.get_json(silent=True) or {}
        resp = requests.post(f"{api_base}/api/history", json=body, headers=headers, timeout=PROXY_TIMEOUT)
    else:
        return jsonify({"error": True, "message": "この操作はサポートされていません"}), 405

    try:
        data = resp.json()
    except ValueError:
        return jsonify({"error": True, "message": f"サーバーの応答が不正です (HTTP {resp.status_code})"}), resp.status_code
    return jsonify(data), resp.status_code


def _proxy_user_api(path, method="GET", json_body=None):
    token = request.cookies.get(SESSION_COOKIE_NAME, "")
    if not token:
        return jsonify({"error": True, "message": "ログインが必要です"}), 401

    api_base = _resolve_api_base()
    headers = {**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers(), "X-Session-Token": token}
    url = f"{api_base}{path}"

    if method == "GET":
        resp = requests.get(url, headers=headers, timeout=PROXY_TIMEOUT)
    elif method == "POST":
        resp = requests.post(url, json=json_body, headers=headers, timeout=PROXY_TIMEOUT)
    elif method == "PUT":
        resp = requests.put(url, json=json_body, headers=headers, timeout=PROXY_TIMEOUT)
    else:
        resp = requests.delete(url, json=json_body, headers=headers, timeout=PROXY_TIMEOUT)

    try:
        data = resp.json()
    except ValueError:
        return jsonify({"error": True, "message": f"サーバーの応答が不正です (HTTP {resp.status_code})"}), resp.status_code
    return jsonify(data), resp.status_code


@app.route("/proxy/user/subscriptions", methods=["GET", "POST"])
def proxy_user_subscriptions():
    if request.method == "GET":
        return _proxy_user_api("/api/user/subscriptions")
    return _proxy_user_api("/api/user/subscriptions", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/user/subscriptions/<channel_id>", methods=["DELETE"])
def proxy_user_subscription_delete(channel_id):
    return _proxy_user_api(f"/api/user/subscriptions/{channel_id}", "DELETE")


@app.route("/proxy/user/likes", methods=["GET", "POST"])
def proxy_user_likes():
    if request.method == "GET":
        return _proxy_user_api("/api/user/likes")
    return _proxy_user_api("/api/user/likes", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/user/likes/<video_id>", methods=["DELETE"])
def proxy_user_like_delete(video_id):
    return _proxy_user_api(f"/api/user/likes/{video_id}", "DELETE")


@app.route("/proxy/user/me", methods=["GET", "PUT"])
def proxy_user_me():
    if request.method == "GET":
        return _proxy_user_api("/api/user/me")
    return _proxy_user_api("/api/user/me", "PUT", request.get_json(silent=True) or {})


@app.route("/proxy/inquiries", methods=["GET", "POST"])
def proxy_inquiries():
    if request.method == "GET":
        return _proxy_user_api("/api/inquiries")
    return _proxy_user_api("/api/inquiries", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/inquiries/<int:inquiry_id>", methods=["GET", "DELETE"])
def proxy_inquiry_detail(inquiry_id):
    if request.method == "DELETE":
        return _proxy_user_api(f"/api/inquiries/{inquiry_id}", "DELETE")
    return _proxy_user_api(f"/api/inquiries/{inquiry_id}")


@app.route("/proxy/inquiries/<int:inquiry_id>/replies", methods=["POST"])
def proxy_inquiry_reply(inquiry_id):
    return _proxy_user_api(f"/api/inquiries/{inquiry_id}/replies", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/playlists", methods=["GET", "POST"])
def proxy_playlists():
    if request.method == "GET":
        return _proxy_user_api("/api/playlists")
    return _proxy_user_api("/api/playlists", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/playlists/<int:playlist_id>", methods=["GET", "PUT", "DELETE"])
def proxy_playlist_detail(playlist_id):
    if request.method == "GET":
        return _proxy_user_api(f"/api/playlists/{playlist_id}")
    if request.method == "PUT":
        return _proxy_user_api(f"/api/playlists/{playlist_id}", "PUT", request.get_json(silent=True) or {})
    return _proxy_user_api(f"/api/playlists/{playlist_id}", "DELETE")


@app.route("/proxy/playlists/<int:playlist_id>/videos", methods=["POST"])
def proxy_playlist_add_video(playlist_id):
    return _proxy_user_api(f"/api/playlists/{playlist_id}/videos", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/playlists/<int:playlist_id>/videos/<video_id>", methods=["DELETE"])
def proxy_playlist_remove_video(playlist_id, video_id):
    return _proxy_user_api(f"/api/playlists/{playlist_id}/videos/{video_id}", "DELETE")


@app.route("/proxy/admin/banned-words", methods=["GET", "POST"])
def proxy_banned_words():
    if request.method == "GET":
        return _proxy_user_api("/api/admin/banned-words")
    return _proxy_user_api("/api/admin/banned-words", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/admin/banned-words/bulk", methods=["POST"])
def proxy_banned_words_bulk():
    return _proxy_user_api("/api/admin/banned-words/bulk", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/admin/banned-words/import-url", methods=["POST"])
def proxy_banned_words_import_url():
    return _proxy_user_api("/api/admin/banned-words/import-url", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/admin/banned-words/<int:word_id>", methods=["DELETE"])
def proxy_banned_word_delete(word_id):
    return _proxy_user_api(f"/api/admin/banned-words/{word_id}", "DELETE")


@app.route("/proxy/admin/banned-words/by-text", methods=["DELETE"])
def proxy_banned_word_delete_by_text():
    return _proxy_user_api("/api/admin/banned-words/by-text", "DELETE", request.get_json(silent=True) or {})


@app.route("/proxy/admin/banned-words/clear-all", methods=["DELETE"])
def proxy_banned_words_clear_all():
    return _proxy_user_api("/api/admin/banned-words", "DELETE")


@app.route("/proxy/admin/banned-ips", methods=["GET", "POST"])
def proxy_banned_ips():
    if request.method == "GET":
        return _proxy_user_api("/api/admin/banned-ips")
    return _proxy_user_api("/api/admin/banned-ips", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/admin/banned-ips/<path:ip>", methods=["DELETE"])
def proxy_banned_ip_delete(ip):
    return _proxy_user_api(f"/api/admin/banned-ips/{ip}", "DELETE")


@app.route("/proxy/admin/banned-emails", methods=["GET", "POST"])
def proxy_banned_emails():
    if request.method == "GET":
        return _proxy_user_api("/api/admin/banned-emails")
    return _proxy_user_api("/api/admin/banned-emails", "POST", request.get_json(silent=True) or {})


@app.route("/proxy/admin/banned-emails/<path:email>", methods=["DELETE"])
def proxy_banned_email_delete(email):
    return _proxy_user_api(f"/api/admin/banned-emails/{email}", "DELETE")


@app.route("/proxy/admin/ban-events", methods=["GET"])
def proxy_ban_events():
    ip = request.args.get("ip", "")
    email = request.args.get("email", "")
    path = "/api/admin/ban-events"
    params = []
    if ip:
        params.append(f"ip={ip}")
    if email:
        params.append(f"email={email}")
    if params:
        path += "?" + "&".join(params)
    return _proxy_user_api(path)


@app.route("/proxy/admin/moderation-policy", methods=["GET", "PUT"])
def proxy_moderation_policy():
    if request.method == "GET":
        return _proxy_user_api("/api/admin/moderation-policy")
    return _proxy_user_api("/api/admin/moderation-policy", "PUT", request.get_json(silent=True) or {})


@app.route("/proxy/moderation/check-search", methods=["POST"])
def proxy_check_search_moderation():
    """検索実行前のNGワードチェック。ログイン不要で誰でも呼べる
    (バックエンド側のcheck_search_moderation_endpointもログイン不要な設計になっている)。"""
    api_base = _resolve_api_base()
    headers = {**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers()}
    body = request.get_json(silent=True) or {}
    resp = requests.post(f"{api_base}/api/moderation/check-search", json=body, headers=headers, timeout=PROXY_TIMEOUT)
    try:
        data = resp.json()
    except ValueError:
        return jsonify({"blocked": False}), 200
    return jsonify(data), resp.status_code


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
    """字幕はJSONではなくWebVTTのテキストなので、_proxy()を使わず専用処理にしている。"""
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
    """サーバー側(ytdlp_api)のキャッシュを全部消す。間違ったデータがキャッシュされた時の
    強制リフレッシュ用。/settings ページから叩ける。ytdlp_api側で設定した管理者パスワードが必要。"""
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
    """
    <video src="..."> / <audio src="..."> が直接叩くエンドポイント。
    ytdlp_api の /api/proxy-stream をそのまま中継するだけ。二段プロキシになるが、
    こうしておくとブラウザからは常にこのフロントエンドのドメインしか見えないので、
    設定画面で隠しているAPIサーバーのURLがバレることもない。
    Rangeヘッダもそのまま転送するのでシークも普通に効く。
    """
    format_id = request.args.get("format_id", "18")
    download = request.args.get("download", "0")
    api_base = _resolve_api_base()
    upstream_url = f"{api_base}/api/proxy-stream/{video_id}"

    range_header = request.headers.get("Range")
    fwd_headers = {**_BACKEND_REQUEST_HEADERS, **_backend_auth_headers(), "X-Forwarded-For": _client_ip()}
    if range_header:
        fwd_headers["Range"] = range_header

    try:
        upstream = requests.get(
            upstream_url,
            params={"format_id": format_id, "download": download},
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
    for h in ("Content-Range", "Content-Length", "Accept-Ranges", "Content-Type", "Content-Disposition"):
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

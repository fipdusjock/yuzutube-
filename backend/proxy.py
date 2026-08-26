"""
ブラウザ側のJSが叩く /proxy/* エンドポイント群。すべてこのサーバー自身が
ytdlp_api(バックエンド)を代わりに叩いて結果を中継する。こうしておくと:
  - ブラウザからは常にこのフロントエンドのドメインしか見えず、CORSを気にしなくていい
  - バックエンドのURLを隠せる(設定画面等で露出しない)
"""

import logging

import requests
from flask import Blueprint, Response, abort, jsonify, request

from . import config
from .upstream import request_headers

logger = logging.getLogger(__name__)

bp = Blueprint("proxy", __name__, url_prefix="/proxy")


def _proxy(path, method="GET", **params):
    try:
        resp = requests.request(
            method,
            f"{config.API_BASE}{path}",
            params=params,
            headers=request_headers(),
            timeout=config.PROXY_TIMEOUT,
        )
    except requests.RequestException as e:
        logger.error("proxy request failed: %s%s -> %s", config.API_BASE, path, e)
        return jsonify({
            "error": True,
            "message": "APIサーバーに接続できませんでした。しばらくしてからもう一度お試しください。",
        }), 502

    if resp.status_code >= 400:
        try:
            detail = resp.json().get("detail")
        except ValueError:
            detail = resp.text[:200]
        logger.error("proxy upstream error %s: %s", resp.status_code, detail)
        return jsonify({"error": True, "message": f"取得に失敗しました (HTTP {resp.status_code})"}), resp.status_code

    try:
        data = resp.json()
    except ValueError:
        return jsonify({"error": True, "message": "サーバーの応答を解釈できませんでした。"}), 502

    return jsonify(data)


@bp.route("/trending")
def trending():
    limit = request.args.get("limit", "24")
    category = request.args.get("category", "trending")
    return _proxy("/api/trending", limit=limit, category=category)


@bp.route("/visit", methods=["GET", "POST"])
def visit():
    return _proxy("/api/visit", method=request.method)


@bp.route("/history", methods=["GET", "POST"])
def history():
    """
    「みんなの視聴履歴」の中継。個人アカウントには紐づけない、サイト全体で
    共有される単一のフィード(誰が見たかは記録しない)。閲覧・記録はログイン
    さえしていれば誰でもできる(削除のような破壊的操作は用意していない)。
    """
    headers = request_headers()

    if request.method == "GET":
        limit = request.args.get("limit", "100")
        resp = requests.get(f"{config.API_BASE}/api/history", params={"limit": limit}, headers=headers, timeout=config.PROXY_TIMEOUT)
    else:
        body = request.get_json(silent=True) or {}
        resp = requests.post(f"{config.API_BASE}/api/history", json=body, headers=headers, timeout=config.PROXY_TIMEOUT)

    try:
        data = resp.json()
    except ValueError:
        return jsonify({"error": True, "message": f"サーバーの応答が不正です (HTTP {resp.status_code})"}), resp.status_code
    return jsonify(data), resp.status_code


@bp.route("/search")
def search():
    q = request.args.get("q", "")
    limit = request.args.get("limit", "24")
    continuation = request.args.get("continuation", "")
    kwargs = {"q": q, "limit": limit}
    if continuation:
        kwargs["continuation"] = continuation
    return _proxy("/api/search", **kwargs)


@bp.route("/suggest")
def suggest():
    return _proxy("/api/suggest", q=request.args.get("q", ""))


@bp.route("/stream/<video_id>")
def stream(video_id):
    return _proxy(f"/api/stream/{video_id}")


@bp.route("/related/<video_id>")
def related(video_id):
    limit = request.args.get("limit", "15")
    return _proxy(f"/api/related/{video_id}", limit=limit)


@bp.route("/comments/<video_id>")
def comments(video_id):
    limit = request.args.get("limit", "30")
    return _proxy(f"/api/comments/{video_id}", limit=limit)


@bp.route("/livechat/<video_id>")
def livechat(video_id):
    after = request.args.get("after", "0")
    return _proxy(f"/api/livechat/{video_id}", after=after)


@bp.route("/subtitles/<video_id>")
def subtitles(video_id):
    """字幕はJSONではなくWebVTTのテキストなので、_proxy()を使わず専用処理にしている。"""
    lang = request.args.get("lang", "ja")
    auto = request.args.get("auto", "0")
    try:
        resp = requests.get(
            f"{config.API_BASE}/api/subtitles/{video_id}",
            params={"lang": lang, "auto": auto},
            headers=request_headers(),
            timeout=config.PROXY_TIMEOUT,
        )
    except requests.RequestException as e:
        logger.error("subtitle proxy failed: %s -> %s", video_id, e)
        abort(502, description="字幕の取得に失敗しました")

    if resp.status_code >= 400:
        abort(resp.status_code, description="字幕が見つかりませんでした")

    return Response(resp.text, mimetype="text/vtt")


@bp.route("/cache-clear-all", methods=["DELETE"])
def cache_clear_all():
    """
    サーバー側(ytdlp_api)のキャッシュを全部消す。/settings ページから叩ける。
    ytdlp_api側で設定した管理者パスワードが必要。パスワードはクエリ文字列に載せると
    サーバーのアクセスログやブラウザ履歴に残ってしまうため、専用のリクエストヘッダー
    で受け取る(バックエンドへは従来通りクエリパラメータとして中継する)。
    """
    password = request.headers.get("X-Admin-Password", "")
    return _proxy("/api/cache", method="DELETE", password=password)


@bp.route("/channel/<channel_id>")
def channel(channel_id):
    limit = request.args.get("limit", "30")
    tab = request.args.get("tab", "videos")
    offset = request.args.get("offset", "0")
    return _proxy(f"/api/channel/{channel_id}", limit=limit, tab=tab, offset=offset)


@bp.route("/playlist/<playlist_id>")
def playlist(playlist_id):
    limit = request.args.get("limit", "100")
    return _proxy(f"/api/playlist/{playlist_id}", limit=limit)

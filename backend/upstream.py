"""ytdlp_api(バックエンド)との通信で共通して使う認証まわりのヘルパー。"""

import logging
import re
import threading
import time

import requests
from flask import request

from . import config

logger = logging.getLogger(__name__)

_token_lock = threading.Lock()
_token_cache = {"token": None, "expires_at": 0.0}

# X-Forwarded-For に混入した制御文字(ヘッダーインジェクション対策の多層防御。
# requestsが送信時に弾くはずだが、念のためこちら側でも取り除いておく)。
_CONTROL_CHARS_RE = re.compile(r"[\r\n\x00]")


def _fetch_token():
    resp = requests.get(
        f"{config.API_BASE}{config.TOKEN_ISSUE_PATH}",
        headers=config.BACKEND_REQUEST_HEADERS,
        timeout=config.TOKEN_FETCH_TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    token = data.get("token", "")
    if not token:
        raise ValueError("token/issue のレスポンスに token が含まれていません")
    return token, data.get("expires_at", 0)


def get_api_token():
    """トークンをメモリキャッシュし、期限切れ間近なら取り直す。
    取得に失敗した場合は None を返す(呼び出し側はヘッダーを付けずに続行する)。"""
    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] - config.TOKEN_REFRESH_MARGIN_SECONDS > now:
        return _token_cache["token"]

    with _token_lock:
        # ロック待ちの間に他スレッドが更新している可能性があるので再チェック
        now = time.time()
        if _token_cache["token"] and _token_cache["expires_at"] - config.TOKEN_REFRESH_MARGIN_SECONDS > now:
            return _token_cache["token"]
        try:
            token, expires_at = _fetch_token()
        except (requests.RequestException, ValueError) as e:
            logger.error("token/issue 取得失敗: %s", e)
            return _token_cache["token"]
        _token_cache["token"] = token
        _token_cache["expires_at"] = expires_at
        return token


def auth_headers():
    token = get_api_token()
    return {"X-API-Token": token} if token else {}


def client_ip():
    """
    Vercelは実際の訪問者IPを X-Forwarded-For ヘッダに入れて渡してくる
    (Vercelのエッジ〜このFlaskアプリの間はVercelが面倒を見てくれている)。
    このIPをバックエンド(ytdlp_api)側にも転送しておくことで、バックエンド側で
    不正利用対策(レート制限等)をしたくなった時に使えるようにする。
    """
    forwarded = request.headers.get("X-Forwarded-For", "")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.remote_addr or "")
    return _CONTROL_CHARS_RE.sub("", ip)


def request_headers():
    """バックエンドへの全リクエストに共通で付ける基本ヘッダー一式。"""
    return {**config.BACKEND_REQUEST_HEADERS, **auth_headers(), "X-Forwarded-For": client_ip()}

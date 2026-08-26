"""
<video src="..."> / <audio src="..."> が直接叩くエンドポイント群。
ytdlp_api の /api/proxy-stream, /api/muxed-stream をそのまま中継するだけ。
二段プロキシになるが、こうしておくとブラウザからは常にこのフロントエンドの
ドメインしか見えないので、バックエンドAPIサーバーのURLがバレることもない。
"""

import logging

import requests
from flask import Blueprint, Response, abort, request

from . import config
from .upstream import request_headers

logger = logging.getLogger(__name__)

bp = Blueprint("media", __name__)

_CHUNK_SIZE = 262144


def _stream_upstream(upstream_path, fwd_headers, params, error_label):
    try:
        upstream = requests.get(
            f"{config.API_BASE}{upstream_path}",
            params=params,
            headers=fwd_headers,
            stream=True,
            timeout=config.MEDIA_TIMEOUT,
        )
    except requests.RequestException as e:
        logger.error("%s fetch failed: %s -> %s", error_label, upstream_path, e)
        abort(502, description="動画データの取得に失敗しました")

    if upstream.status_code >= 400:
        logger.error("%s upstream error: %s -> HTTP %s", error_label, upstream_path, upstream.status_code)
        upstream.close()
        abort(502, description="動画データの取得に失敗しました")

    return upstream


def _passthrough_body(upstream):
    def gen():
        try:
            for chunk in upstream.iter_content(_CHUNK_SIZE):
                if chunk:
                    yield chunk
        except (requests.exceptions.ChunkedEncodingError, requests.exceptions.ConnectionError):
            pass
        finally:
            upstream.close()
    return gen()


@bp.route("/media/<video_id>")
def media_proxy(video_id):
    """通常のストリーム中継。Rangeヘッダもそのまま転送するのでシークも普通に効く。"""
    format_id = request.args.get("format_id", "18")
    download = request.args.get("download", "0")

    fwd_headers = request_headers()
    range_header = request.headers.get("Range")
    if range_header:
        fwd_headers["Range"] = range_header

    upstream = _stream_upstream(
        f"/api/proxy-stream/{video_id}",
        fwd_headers,
        {"format_id": format_id, "download": download},
        "media proxy",
    )

    passthrough_headers = {}
    for h in ("Content-Range", "Content-Length", "Accept-Ranges", "Content-Type", "Content-Disposition"):
        if h in upstream.headers:
            passthrough_headers[h] = upstream.headers[h]
    passthrough_headers.setdefault("Accept-Ranges", "bytes")
    passthrough_headers.setdefault("Content-Type", "video/mp4")

    return Response(_passthrough_body(upstream), status=upstream.status_code, headers=passthrough_headers)


@bp.route("/media-muxed/<video_id>")
def media_muxed_proxy(video_id):
    """
    /api/muxed-stream(FFmpegでその場で映像+音声を結合するエンドポイント)専用の
    中継。media_proxyとほぼ同じ形だが、Rangeヘッダは転送しない(FFmpegのパイプ出力は
    シーク不可なストリームのため、途中からの範囲リクエストには対応できない)。
    """
    format_id = request.args.get("format_id", "")
    if not format_id:
        abort(400, description="format_idが必要です")
    download = request.args.get("download", "0")

    upstream = _stream_upstream(
        f"/api/muxed-stream/{video_id}",
        request_headers(),
        {"format_id": format_id, "download": download},
        "media-muxed proxy",
    )

    passthrough_headers = {}
    for h in ("Content-Type", "Content-Disposition"):
        if h in upstream.headers:
            passthrough_headers[h] = upstream.headers[h]
    passthrough_headers.setdefault("Content-Type", "video/mp4")

    return Response(_passthrough_body(upstream), status=upstream.status_code, headers=passthrough_headers)

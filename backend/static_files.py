"""
public/ 配下のほとんどのファイル(style.css, app.js, manifest.json, icons/*等)は
Flaskの静的ファイル機能(static_url_path="")でそのまま配信される。
ここでは、それだけでは表現できない特別な挙動が要る2つだけを扱う。
"""

from flask import Blueprint, send_from_directory

from . import config

bp = Blueprint("static_files", __name__)


@bp.route("/sw.js")
def service_worker():
    # Service WorkerはルートスコープでOK。Cache-Controlを短くして更新を反映しやすくする。
    resp = send_from_directory(config.PUBLIC_DIR, "sw.js")
    resp.headers["Cache-Control"] = "no-cache"
    return resp


@bp.route("/favicon.ico")
def favicon_ico():
    # favicon.icoへの慣習的なアクセスにも、同じデザインのPNGを返しておく
    # (public/にfavicon.ico自体は存在しないため明示的なルートが必要)。
    return send_from_directory(config.PUBLIC_DIR, "favicon-32.png")

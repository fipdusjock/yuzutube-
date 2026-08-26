import json
import os

from flask import Blueprint, jsonify

from . import config
from .changelog import load_entries

bp = Blueprint("local_api", __name__, url_prefix="/api")

_ANNOUNCEMENT_PATH = os.path.join(config.BASE_DIR, "announcement.json")


@bp.route("/frontend-version")
def frontend_version():
    """
    フロントエンドが「アップデートされました」通知を自動表示するための軽量エンドポイント。
    changelog.jsonの最新日付+件数だけを返す(重い処理は無い)。
    """
    entries = load_entries()
    latest = entries[0] if entries else {}
    version = f"{latest.get('date', '0')}:{len(latest.get('changes', []))}"
    return jsonify({
        "version": version,
        "date": latest.get("date"),
        "changes": latest.get("changes", []),
    })


@bp.route("/announcement")
def announcement():
    """
    画面中央にモーダルで出す「アップデート予告」。announcement.jsonを直接編集するだけで
    内容を変えられる(コード修正不要)。idを新しい値に変えると、既に見た人にも
    再度表示される(idが変わっていなければ、一度閉じた人には出ない)。
    """
    try:
        with open(_ANNOUNCEMENT_PATH, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError):
        data = {}
    return jsonify({
        "id": data.get("id", ""),
        "enabled": bool(data.get("enabled", False)),
        "title": data.get("title", ""),
        "message": data.get("message", ""),
    })

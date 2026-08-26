"""
ページ本体を返すルート群。ページ自体は即座に返す(スケルトン状態のHTML)。
中身のデータはブラウザ側のJSが /proxy/* を叩いて取りに行き、後から差し込む。
こうしておくと:
  - バックエンド(ytdlp_api)が重い/落ちてても最初の画面表示だけは即座に出る
  - スケルトンローディングの演出ができる
"""

from flask import Blueprint, abort, redirect, render_template, request, url_for

from .changelog import load_entries

bp = Blueprint("pages", __name__)

_PLAYLIST_ID_PREFIXES = ("PL", "UU", "LL", "WL", "FL", "RD", "OL")


@bp.route("/")
def index():
    return render_template("index.html")


@bp.route("/results")
def results():
    q = request.args.get("q", "").strip()
    if not q:
        return redirect(url_for("pages.index"))
    return render_template("results.html", query=q)


@bp.route("/watch")
def watch():
    video_id = request.args.get("v")
    if not video_id:
        abort(404)
    if len(video_id) != 11 and video_id.startswith(_PLAYLIST_ID_PREFIXES):
        return redirect(url_for("pages.playlist", list=video_id))
    return render_template("watch.html", video_id=video_id)


@bp.route("/channel/<channel_id>")
def channel(channel_id):
    return render_template("channel.html", channel_id=channel_id)


@bp.route("/playlist")
def playlist():
    list_id = request.args.get("list")
    if not list_id:
        abort(404)
    return render_template("playlist.html", playlist_id=list_id)


@bp.route("/settings")
def settings():
    return render_template("settings.html")


@bp.route("/my-playlists")
def my_playlists_page():
    return render_template("my_playlists.html")


@bp.route("/my-playlists/<playlist_id>")
def my_playlist_detail_page(playlist_id):
    return render_template("my_playlist_detail.html", playlist_id=playlist_id)


@bp.route("/subscriptions")
def subscriptions():
    return render_template("subscriptions.html")


@bp.route("/liked")
def liked_videos():
    return render_template("liked.html")


@bp.route("/history")
def history():
    return render_template("history.html")


@bp.route("/terms")
def terms_page():
    return render_template("terms.html")


@bp.route("/changelog")
def changelog_page():
    entries = load_entries()
    latest_date = entries[0]["date"] if entries else None
    version = f"v{latest_date.replace('-', '.')}" if latest_date else "v0"
    return render_template("changelog.html", entries=entries, version=version)

import os

from flask import Flask, render_template

from . import config, media, pages, proxy, static_files, template_filters


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(config.BASE_DIR, "templates"),
        static_folder=config.PUBLIC_DIR,
        static_url_path="",
    )

    template_filters.register(app)

    @app.context_processor
    def inject_globals():
        return {"site_name": config.SITE_NAME}

    @app.errorhandler(404)
    def not_found(_e):
        return render_template("error.html", message="ページが見つかりません"), 404

    app.register_blueprint(pages.bp)
    app.register_blueprint(proxy.bp)
    app.register_blueprint(media.bp)
    app.register_blueprint(static_files.bp)

    return app

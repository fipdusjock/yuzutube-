from jinja2 import Undefined


def format_duration(seconds):
    if not seconds or isinstance(seconds, Undefined):
        return ""
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def register(app):
    app.jinja_env.filters["duration"] = format_duration

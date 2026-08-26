import json
import os

from . import config

_CHANGELOG_PATH = os.path.join(config.BASE_DIR, "changelog.json")


def load_entries():
    try:
        with open(_CHANGELOG_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return []

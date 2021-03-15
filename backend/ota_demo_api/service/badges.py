icon_mapping = {
    "16aa": "airplane",
    "16t": "tree-palm",
    "16g": "call-bell",
    "16k": "tag",
    "16h": "suitcase",
    "16z": "cards",
    "16f": "building",
    "16r": "tree-palm",
    "16w": "tuxedo",
    "16y": "leaf",
    "16c": "family",
    "16p": "golf",
    "16ae": "hiking",
    "16u": "single",
    "16ab": "lake-house",
    "16b": "crown",
    "16af": "tag",
    "16ad": "road",
    "16i": "glass-martini",
    "16d": "couple",
    "16ac": "swimming",
    "16e": "lotus",
    "11": "window",
    "11b": "bed",
    "11e": "image",
    "111": "bed",
    "333": "housekeeping",
    "131": "food",
    "13": "food",
    "ef97": "food",
    "63": "glass-wine",
    "14": "map-marker",
    "14c": "museum",
    "14d": "food",
    "14e": "tag",
    "15a": "microphone",
    "15b": "call-bell",
    "15e": "housekeeping",
    "15h": "child",
    "15m": "room-service",
    "ddbc": "handshake",
    "171": "glass-martini",
    "18": "wifi",
    "201": "swimming",
    "21": "lotus",
    "21a": "lotus",
    "21b": "gym",
    "22a": "credit-card",
    "244": "coffee",
    "20": "tree-pine",
    "20c": "hiking",
    "20d": "child",
    "24": "building",
    "24a": "terrace",
    "24c": "users",
    "family": "family",
    "business": "suitcase",
    "couple": "couple",
    "solo": "single",
}


def get_badge_icon(badge):
    badge_type = badge["badge_type"]
    icon = "trophy"

    if badge_type in ("hotel_type", "category"):
        icon = icon_mapping.get(badge["badge_data"]["category_id"], "trophy")
    elif badge_type in ("popular_with",):
        icon = icon_mapping.get(badge["badge_data"]["trip_type"], "trophy")

    return icon

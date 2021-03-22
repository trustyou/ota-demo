from typing import Optional


def scale_score(field: Optional[float], scale: int) -> Optional[float]:
    """
    Scale the field from 100 to 5 scale.
    :param field: The score on 100 scale
    :param scale: The scale
    :return: The field on the requested scale
    """
    try:
        result = round(field / 20.0, 1) if scale != 100 else round(field)
    except TypeError:
        return None
    else:
        return result


def normalize_score(field: Optional[float], scale: int) -> Optional[float]:
    """
    Normalize to 100 scale the field expressed in scale.
    :param field: The score field
    :param scale: The current scale of the score
    :return: The normalizaed score
    """
    return round(field * 100 / scale)

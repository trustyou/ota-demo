from typing import Optional

SCORE_DESCRIPTIONS = {
    "score_0": "Excellent",
    "score_1": "Very Good",
    "score_2": "Good",
    "score_3": "Fair",
    "score_4": "Poor",
    "not_rated": "Not Rated"
}

SCORE_THRESHOLDS = [86.0, 80.0, 74.0, 68.0, 0.0]


def apply_threshold(value: float) -> Optional[int]:
    """
    Figure out the index of the threshold so that threshold < value <= next_threshold.
    :param value: Number
    :return: Index of the threshold where value falls
    """
    if value is None:
        return None
    for index, threshold in enumerate(SCORE_THRESHOLDS):
        if value > threshold:
            return index
    return len(thresholds)


def get_score_description(trust_score: float) -> str:
    """
    Fetch the correct description for this TrustScore, e.g. "Excellent"
    :param trust_score: TrustScore on 100 scale
    :return: String representation of TrustScore
    """
    if trust_score is None:
        return SCORE_DESCRIPTIONS["not_rated"]
    score_index = apply_threshold(trust_score)
    score_description_key = "score_{0:d}".format(score_index)
    return SCORE_DESCRIPTIONS[score_description_key]

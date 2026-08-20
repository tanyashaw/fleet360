"""Fleet360 — Shared Math / Analytics Helpers."""


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Division that returns `default` when denominator is zero or None."""
    if not denominator:
        return default
    return numerator / denominator


def calc_utilization(actual: float, available: float) -> float:
    """Return utilization %, capped at 100."""
    if not available:
        return 0.0
    return min((actual / available) * 100, 100.0)


def normalize_score(value: float, min_val: float, max_val: float) -> float:
    """
    Linearly normalize `value` into [0, 100].
    Values at or above max_val return 100; at or below min_val return 0.
    """
    if max_val <= min_val:
        return 0.0
    score = (value - min_val) / (max_val - min_val) * 100
    return max(0.0, min(100.0, score))


def round2(value: float) -> float:
    return round(value, 2)


def percentage_change(old_val: float, new_val: float) -> float:
    """Return percentage change from old_val to new_val."""
    if not old_val:
        return 0.0
    return ((new_val - old_val) / abs(old_val)) * 100

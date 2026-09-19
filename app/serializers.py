from enum import Enum

from sqlalchemy import inspect


def model_to_dict(obj):
    if obj is None:
        return None

    result = {}
    mapper = inspect(obj).mapper

    for column in mapper.column_attrs:
        value = getattr(obj, column.key)
        if isinstance(value, Enum):
            value = value.value
        result[column.key] = value

    return result


def models_to_dict(items):
    return [model_to_dict(item) for item in items]

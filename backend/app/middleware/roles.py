from collections.abc import Callable

from fastapi import Depends

from app.middleware.auth import get_current_admin


def require_roles(*_roles: str) -> Callable:
    def dependency(current_admin=Depends(get_current_admin)):
        return current_admin

    return dependency

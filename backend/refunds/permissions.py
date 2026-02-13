from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        if request.user and request.user.is_authenticated and request.user.is_staff:
            return True
        return getattr(obj, "user_id", None) == request.user.id


class IsReadOnly(BasePermission):
    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS

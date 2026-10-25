import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends
from postgrest.exceptions import APIError

from models import UserRequest, UpdateUserRequest
from database import supabase
from auth import hash_password, get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])
PROTECTED_USERNAME = "Administrator"

@router.get("/roles")
async def get_roles(current_user: dict = Depends(get_current_user)):
    """Ambil semua role yang tersedia."""
    result = supabase.table("role").select("*").execute()
    return result.data


@router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    """Ambil semua user admin beserta role-nya."""
    result = (
        supabase.table("users")
        .select("user_id, username, role_id, create_at, update_at, role(role_name)")
        .order("create_at", desc=False)
        .execute()
    )

    users = []
    for user in result.data:
        users.append(
            {
                "user_id": user["user_id"],
                "username": user["username"],
                "role_id": user["role_id"],
                "role_name": user["role"]["role_name"],
                "create_at": user["create_at"],
                "update_at": user["update_at"],
            }
        )

    return users


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    request: UserRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Buat akun admin baru.
    Hanya Super Admin yang diizinkan.
    """
    if current_user.get("role_name") != "Super Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Super Admin yang dapat menambah akun",
        )

    existing = (
        supabase.table("users")
        .select("user_id")
        .eq("username", request.username)
        .execute()
    )
    if existing.data and len(existing.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username sudah digunakan",
        )

    role_check = (
        supabase.table("role")
        .select("role_id, role_name")
        .eq("role_id", request.role_id)
        .execute()
    )
    if not role_check.data or len(role_check.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role tidak ditemukan",
        )

    hashed = hash_password(request.password)

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    new_user = {
        "user_id": user_id,
        "role_id": request.role_id,
        "username": request.username,
        "password": hashed,
        "create_at": now,
        "update_at": now,
    }

    supabase.table("users").insert(new_user).execute()

    role_name = role_check.data[0]["role_name"]

    return {
        "user_id": user_id,
        "username": request.username,
        "role_id": request.role_id,
        "role_name": role_name,
        "create_at": now,
        "update_at": now,
    }

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    request: UpdateUserRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Update username, password, dan/atau role akun.
    Hanya Super Admin yang diizinkan.
    """
    if current_user.get("role_name") != "Super Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Super Admin yang dapat mengubah akun",
        )

    user_result = (
        supabase.table("users")
        .select("*, role(role_name)")
        .eq("user_id", user_id)
        .execute()
    )
    if not user_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )
    user = user_result.data[0]

    updates: dict = {}

    if request.username is not None:
        new_username = request.username.strip()
        if not new_username:
            raise HTTPException(status_code=400, detail="Username tidak boleh kosong")
        if new_username != user["username"]:
            dup = (
                supabase.table("users")
                .select("user_id")
                .eq("username", new_username)
                .neq("user_id", user_id)
                .execute()
            )
            if dup.data:
                raise HTTPException(status_code=400, detail="Username sudah digunakan")
            updates["username"] = new_username

    role_name = user["role"]["role_name"]
    if request.role_id is not None and request.role_id != user["role_id"]:
        role_check = (
            supabase.table("role")
            .select("role_id, role_name")
            .eq("role_id", request.role_id)
            .execute()
        )
        if not role_check.data:
            raise HTTPException(status_code=400, detail="Role tidak ditemukan")
        if user["role"]["role_name"] == "Super Admin":
            raise HTTPException(
                status_code=403,
                detail="Role Super Admin tidak dapat diubah",
            )
        updates["role_id"] = request.role_id
        role_name = role_check.data[0]["role_name"]

    if request.password:
        updates["password"] = hash_password(request.password)

    if not updates:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan yang dikirim")

    updates["update_at"] = datetime.now(timezone.utc).isoformat()
    supabase.table("users").update(updates).eq("user_id", user_id).execute()

    return {
        "user_id": user_id,
        "username": updates.get("username", user["username"]),
        "role_id": updates.get("role_id", user["role_id"]),
        "role_name": role_name,
        "update_at": updates["update_at"],
    }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Hapus akun admin.
    Hanya Super Admin yang diizinkan.
    Akun dengan username 'Administrator' tidak bisa dihapus.
    Super Admin lain boleh dihapus.
    """
    if current_user.get("role_name") != "Super Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Super Admin yang dapat menghapus akun",
        )

    user_result = (
        supabase.table("users")
        .select("*, role(role_name)")
        .eq("user_id", user_id)
        .execute()
    )
    if not user_result.data or len(user_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )

    user = user_result.data[0]

    if (user.get("username") or "").strip().lower() == PROTECTED_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun Administrator tidak dapat dihapus",
        )

    try:
        supabase.table("users").delete().eq("user_id", user_id).execute()
    except APIError as e:
        code = getattr(e, "code", None)
        message = getattr(e, "message", "") or str(e)
        if code == "23503" or "violates foreign key constraint" in message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Akun {user['username']} tidak dapat dihapus karena sedang digunakan pada data perbaikan laptop",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal menghapus user",
        )

    return {"message": f"Akun {user['username']} berhasil dihapus"}

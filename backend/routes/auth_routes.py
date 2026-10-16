from fastapi import APIRouter, HTTPException, status

from models import LoginRequest, LoginResponse
from database import supabase
from auth import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login endpoint.
    Menerima username & password, mengembalikan JWT token jika valid.
    """
    result = (
        supabase.table("users")
        .select("*, role(role_name)")
        .eq("username", request.username)
        .execute()
    )

    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    user = result.data[0]

    if not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    token_data = {
        "user_id": user["user_id"],
        "username": user["username"],
        "role_id": user["role_id"],
        "role_name": user["role"]["role_name"],
    }

    access_token = create_access_token(token_data)

    return LoginResponse(
        access_token=access_token,
        user={
            "user_id": user["user_id"],
            "username": user["username"],
            "role_id": user["role_id"],
            "role_name": user["role"]["role_name"],
        },
    )

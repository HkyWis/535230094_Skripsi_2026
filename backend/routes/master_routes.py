from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends

from models import JenisLaptopRequest
from models import JenisServiceRequest
from database import supabase
from auth import get_current_user

router = APIRouter(prefix="/api/master", tags=["Master Data"])


@router.get("/jenis_laptop_public")
async def get_tipe_laptop_public():
    """Ambil semua jenis_laptop."""
    result = (
        supabase.table("jenis_laptop")
        .select("*")
        .order("create_at", desc=False)
        .execute()
    )
    return result.data

@router.get("/jenis_laptop")
async def get_tipe_laptop(current_user: dict = Depends(get_current_user)):
    """Ambil semua jenis_laptop."""
    result = (
        supabase.table("jenis_laptop")
        .select("*")
        .order("create_at", desc=False)
        .execute()
    )
    return result.data


@router.post("/jenis_laptop", status_code=status.HTTP_201_CREATED)
async def create_tipe_laptop(
    request: JenisLaptopRequest,
    current_user: dict = Depends(get_current_user),
):
    """Buat jenis_laptop baru."""
    
    now = datetime.now(timezone.utc).isoformat()

    existing = (
        supabase.table("jenis_laptop")
        .select("laptop_id")
        .eq("laptop_name", request.laptop_name)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jenis laptop dengan nama ini sudah ada",
        )

    latest = (
        supabase.table("jenis_laptop")
        .select("laptop_id")
        .order("laptop_id", desc=True)
        .limit(1)
        .execute()
    )

    if latest.data:
        last_id = latest.data[0]["laptop_id"]
        last_number = int(last_id[1:])
        new_id = f"L{last_number + 1:04d}"
    else:
        new_id = "L0001"

    new_tipe = {
        "laptop_id": new_id,
        "laptop_name": request.laptop_name,
        "create_at": now,
        "update_at": now,
    }

    result = (
        supabase
        .table("jenis_laptop")
        .insert(new_tipe)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal menambahkan jenis laptop",
        )

    return result.data[0]


@router.put("/jenis_laptop/{id}")
async def update_tipe_laptop(
    id: str,
    request: JenisLaptopRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update nama tipe laptop."""
    now = datetime.now(timezone.utc).isoformat()
    
    existing = supabase.table("jenis_laptop").select("laptop_id").eq("laptop_id", id).execute()
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipe laptop tidak ditemukan"
        )
        
    name_check = (
        supabase.table("jenis_laptop")
        .select("laptop_id")
        .eq("laptop_name", request.laptop_name)
        .neq("laptop_id", id)
        .execute()
    )
    if name_check.data and len(name_check.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipe laptop dengan nama ini sudah ada"
        )

    update_data = {
        "laptop_name": request.laptop_name,
        "update_at": now,
    }

    result = supabase.table("jenis_laptop").update(update_data).eq("laptop_id", id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal memperbarui tipe laptop"
        )
        
    return result.data[0]


@router.delete("/jenis_laptop/{id}")
async def delete_tipe_laptop(
    id: str,
    current_user: dict = Depends(get_current_user),
):
    """Hapus jenis_laptop."""
    existing = supabase.table("jenis_laptop").select("laptop_id, laptop_name").eq("laptop_id", id).execute()
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="jenis_laptop tidak ditemukan"
        )
        
    tipe_name = existing.data[0]["laptop_name"]
    
    result = supabase.table("jenis_laptop").delete().eq("laptop_id", id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal menghapus tipe laptop"
        )
        
    return {"message": f"jenis_laptop'{tipe_name}' berhasil dihapus"}

# ---------------------------------------------------------
# -------------------- JENIS SERVICE ----------------------
# ---------------------------------------------------------

@router.get("/jenis_service")
async def get_jenis_service(current_user: dict = Depends(get_current_user)):
    """Ambil semua jenis_service."""
    result = (
        supabase.table("jenis_service")
        .select("*")
        .order("create_at", desc=False)
        .execute()
    )
    return result.data


@router.post("/jenis_service", status_code=status.HTTP_201_CREATED)
async def create_jenis_service(
    request: JenisServiceRequest,
    current_user: dict = Depends(get_current_user),
):
    """Buat Jenis Service baru."""
    
    now = datetime.now(timezone.utc).isoformat()

    existing = (
        supabase.table("jenis_service")
        .select("jenis_service_id")
        .eq("jenis_service", request.jenis_service)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jenis Service dengan nama ini sudah ada",
        )

    latest = (
        supabase.table("jenis_service")
        .select("jenis_service_id")
        .order("jenis_service_id", desc=True)
        .limit(1)
        .execute()
    )

    if latest.data:
        last_id = latest.data[0]["jenis_service_id"]
        last_number = int(last_id[2:])
        new_id = f"JS{last_number + 1:03d}"
    else:
        new_id = "JS001"

    new_tipe = {
        "jenis_service_id": new_id,
        "jenis_service": request.jenis_service,
        "create_at": now,
        "update_at": now,
    }

    result = (
        supabase
        .table("jenis_service")
        .insert(new_tipe)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal menambahkan jenis service",
        )

    return result.data[0]


@router.put("/jenis_service/{id}")
async def update_jenis_service(
    id: str,
    request: JenisServiceRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update nama jenis service."""
    now = datetime.now(timezone.utc).isoformat()
    
    existing = supabase.table("jenis_service").select("jenis_service_id").eq("jenis_service_id", id).execute()
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jenis Service tidak ditemukan"
        )
        
    name_check = (
        supabase.table("jenis_service")
        .select("jenis_service_id")
        .eq("jenis_service", request.jenis_service)
        .neq("jenis_service_id", id)
        .execute()
    )
    if name_check.data and len(name_check.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipe laptop dengan nama ini sudah ada"
        )

    update_data = {
        "jenis_service": request.jenis_service,
        "update_at": now,
    }

    result = supabase.table("jenis_service").update(update_data).eq("jenis_service_id", id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal memperbarui tipe laptop"
        )
        
    return result.data[0]


@router.delete("/jenis_service/{id}")
async def delete_jenis_service(
    id: str,
    current_user: dict = Depends(get_current_user),
):
    """Hapus Jenis Service."""
    existing = supabase.table("jenis_service").select("jenis_service_id, jenis_service").eq("jenis_service_id", id).execute()
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jenis Service tidak ditemukan"
        )
        
    tipe_name = existing.data[0]["jenis_service"]
    
    result = supabase.table("jenis_service").delete().eq("jenis_service_id", id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal menghapus jenis service"
        )
        
    return {"message": f"jenis service'{tipe_name}' berhasil dihapus"}
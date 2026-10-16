from fastapi import APIRouter, HTTPException, status, Depends
from postgrest.exceptions import APIError

from models import DataServiceRequest, CreateDataServiceResponse, COMPLAINT_FLAGS
from database import supabase
from auth import get_current_user
from ml_model import predict_estimasi_hari

router = APIRouter(prefix="/api/data", tags=["Data Service"])

def generate_next_id(table: str, column: str, prefix: str, width: int = 4) -> str:
    """Ambil ID terakhir lalu +1, dengan pola yang sama seperti master_routes."""
    latest = (
        supabase.table(table)
        .select(column)
        .order(column, desc=True)
        .limit(1)
        .execute()
    )
    if latest.data:
        last_id = latest.data[0][column]
        last_number = int(last_id[len(prefix):])
        return f"{prefix}{last_number + 1:0{width}d}"
    return f"{prefix}{1:0{width}d}"


def record_exists(table: str, column: str, value: str) -> bool:
    result = (
        supabase.table(table)
        .select(column)
        .eq(column, value)
        .limit(1)
        .execute()
    )
    return bool(result.data)

@router.post("/predict", status_code=status.HTTP_200_OK)
async def predict_estimasi(request: DataServiceRequest):
    """
    Endpoint khusus untuk memprediksi estimasi hari service
    berdasarkan data tiket yang akan dibuat.
    """
    jenis_laptop_res = supabase.table("jenis_laptop").select("laptop_name").eq("laptop_id", request.laptop_id).execute()
    jenis_service_res = supabase.table("jenis_service").select("jenis_service").eq("jenis_service_id", request.jenis_service_id).execute()
    
    laptop_name = jenis_laptop_res.data[0]["laptop_name"] if jenis_laptop_res.data else ""
    jenis_service_name = jenis_service_res.data[0]["jenis_service"] if jenis_service_res.data else ""

    data = request.model_dump(mode="json")
    
    features = {
        "Jenis_Service": jenis_service_name,
        "Jenis_Produk": laptop_name,
        "Status_Garansi": data["status_garansi"],
        "Jumlah_Keluhan": data["jumlah_keluhan"],
    }
    
    for flag in COMPLAINT_FLAGS:
        key = flag.capitalize()
        if flag == "keluhan_kamera":
            key = "Keluhan_camera"
        features[key] = 1 if data.get(flag) else 0

    estimasi = predict_estimasi_hari(features)
    
    return {
        "estimasi_hari": estimasi
    }


@router.post("/data_service",
    status_code=status.HTTP_201_CREATED,
    response_model=CreateDataServiceResponse,)
async def create_data_service(
    request: DataServiceRequest,
    current_user: dict = Depends(get_current_user),
):
    """Buat customer + service + keluhan dalam satu transaksi."""

    user_id = request.user_id

    # ---------- Validasi ----------
    jenis_laptop_res = supabase.table("jenis_laptop").select("laptop_name").eq("laptop_id", request.laptop_id).execute()
    if not jenis_laptop_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jenis laptop tidak ditemukan",
        )

    jenis_service_res = supabase.table("jenis_service").select("jenis_service").eq("jenis_service_id", request.jenis_service_id).execute()
    if not jenis_service_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jenis service tidak ditemukan",
        )

    if user_id and not record_exists("users", "user_id", user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )

    if record_exists("service", "nomor_tiket_service", request.nomor_tiket_service):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nomor tiket service sudah digunakan",
        )

    customer_id = generate_next_id("customer", "customer_id", "C")
    service_id = generate_next_id("service", "service_id", "S")
    keluhan_id = generate_next_id("keluhan", "keluhan_id", "K")

    data = request.model_dump(mode="json") 
    
    # ML Prediction untuk estimasi hari
    laptop_name = jenis_laptop_res.data[0]["laptop_name"]
    jenis_service_name = jenis_service_res.data[0]["jenis_service"]
    
    features = {
        "Jenis_Service": jenis_service_name,
        "Jenis_Produk": laptop_name,
        "Status_Garansi": data["status_garansi"],
        "Jumlah_Keluhan": data["jumlah_keluhan"],
    }
    
    for flag in COMPLAINT_FLAGS:
        key = flag.capitalize()
        if flag == "keluhan_kamera":
            key = "Keluhan_camera"
        features[key] = 1 if data.get(flag) else 0

    estimasi = predict_estimasi_hari(features)
    data["estimasi_hari"] = estimasi

    customer_data = {
        "customer_id": customer_id,
        "customer_name": data["customer_name"],
        "no_telepon": data["no_telepon"],
    }

    service_data = {
        "service_id": service_id,
        "customer_id": customer_id,
        "user_id": user_id,
        "laptop_id": data["laptop_id"],
        "jenis_service_id": data["jenis_service_id"],
        "nomor_tiket_service": data["nomor_tiket_service"],
        "tanggal_masuk": data["tanggal_masuk"],
        "laptop_sn": data["laptop_sn"],
        "status_garansi": data["status_garansi"],
        "status_service": data["status_service"],
        "solusi": data["solusi"],
        "kategori_kerusakan": data["kategori_kerusakan"],
        "harga": data["harga"],
        "estimasi_hari": data["estimasi_hari"],
        "tanggal_selesai": data["tanggal_selesai"],
    }

    keluhan_data = {
        "keluhan_id": keluhan_id,
        "service_id": service_id,
        "keluhan": data["keluhan"],
        "jumlah_keluhan": data["jumlah_keluhan"],
        **{flag: data[flag] for flag in COMPLAINT_FLAGS},
    }

    try:
        result = supabase.rpc(
            "create_data_service",
            {
                "p_customer": customer_data,
                "p_service": service_data,
                "p_keluhan": keluhan_data,
            },
        ).execute()
    except APIError as e:
        print("RPC ERROR:", getattr(e, "code", None), e.message, getattr(e, "details", None), getattr(e, "hint", None))
        code = getattr(e, "code", None)
        if code == "23505":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="ID atau nomor tiket bentrok dengan data lain, silakan coba lagi",
            )
        if code == "23503":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referensi data tidak valid",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat data service: {e.message}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal membuat data service",
        )

    return {
        "message": "Data service berhasil dibuat",
        "customer": result.data["customer"],
        "service": result.data["service"],
        "keluhan": result.data["keluhan"],
    }

@router.get("/data_service")
async def get_data_service():
    result = (
        supabase.table("service")
        .select("""
            service_id,
            customer_id,
            user_id,
            laptop_id,
            jenis_service_id,
            nomor_tiket_service,
            tanggal_masuk,
            laptop_sn,
            status_garansi,
            status_service,
            solusi,
            kategori_kerusakan,
            harga,
            estimasi_hari,
            tanggal_selesai,

            customer (
                customer_name,
                no_telepon
            ),

            jenis_laptop (
                laptop_name
            ),

            jenis_service (
                jenis_service
            ),

            users (
                username
            ),

            keluhan (
                keluhan,
                jumlah_keluhan,
                keluhan_lcd,
                keluhan_keyboard,
                keluhan_charger,
                keluhan_baterai,
                keluhan_engsel,
                keluhan_motherboard,
                keluhan_storage,
                keluhan_memory,
                keluhan_booting,
                keluhan_kipas,
                keluhan_port,
                keluhan_software_os,
                keluhan_password,
                keluhan_touchpad,
                keluhan_speaker,
                keluhan_part,
                keluhan_kamera,
                keluhan_power
            )
        """)
        .order("create_at", desc=True)
        .execute()
    )

    return result.data

@router.put(
    "/data_service/{service_id}",
    response_model=CreateDataServiceResponse,
)
async def update_data_service(
    service_id: str,
    request: DataServiceRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update customer + service + keluhan dalam satu transaksi."""

    # ---------- Validasi ----------
    if not record_exists("service", "service_id", service_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data service tidak ditemukan",
        )

    if not record_exists("jenis_laptop", "laptop_id", request.laptop_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jenis laptop tidak ditemukan",
        )

    if not record_exists("jenis_service", "jenis_service_id", request.jenis_service_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jenis service tidak ditemukan",
        )

    if request.user_id and not record_exists("users", "user_id", request.user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )

    # Nomor tiket tidak boleh dipakai service lain (service ini sendiri dikecualikan)
    ticket_check = (
        supabase.table("service")
        .select("service_id")
        .eq("nomor_tiket_service", request.nomor_tiket_service)
        .neq("service_id", service_id)
        .limit(1)
        .execute()
    )
    if ticket_check.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nomor tiket service sudah digunakan",
        )

    data = request.model_dump(mode="json")

    # Ambil nama produk laptop untuk input model CatBoost
    jenis_laptop_res = (
        supabase.table("jenis_laptop")
        .select("laptop_name")
        .eq("laptop_id", data["laptop_id"])
        .execute()
    )

    # Ambil jenis service untuk input model CatBoost
    jenis_service_res = (
        supabase.table("jenis_service")
        .select("jenis_service")
        .eq("jenis_service_id", data["jenis_service_id"])
        .execute()
    )

    if not jenis_laptop_res.data or not jenis_service_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jenis laptop atau jenis service tidak ditemukan",
        )

    laptop_name = jenis_laptop_res.data[0]["laptop_name"]
    jenis_service_name = jenis_service_res.data[0]["jenis_service"]

    # Susun fitur berdasarkan input model CatBoost
    features = {
        "Jenis_Service": jenis_service_name,
        "Jenis_Produk": laptop_name,
        "Status_Garansi": data["status_garansi"],
        "Jumlah_Keluhan": data["jumlah_keluhan"],
    }

    # Masukkan semua fitur keluhan biner
    for flag in COMPLAINT_FLAGS:
        key = flag.capitalize()

        if flag == "keluhan_kamera":
            key = "Keluhan_camera"

        features[key] = 1 if data.get(flag) else 0

    # Prediksi ulang estimasi hari berdasarkan data terbaru
    estimasi = predict_estimasi_hari(features)

    # Gunakan hasil prediksi backend, bukan estimasi dari frontend
    data["estimasi_hari"] = estimasi

    customer_data = {
        "customer_name": data["customer_name"],
        "no_telepon": data["no_telepon"],
    }

    service_data = {
        "user_id": data["user_id"],
        "laptop_id": data["laptop_id"],
        "jenis_service_id": data["jenis_service_id"],
        "nomor_tiket_service": data["nomor_tiket_service"],
        "tanggal_masuk": data["tanggal_masuk"],
        "laptop_sn": data["laptop_sn"],
        "status_garansi": data["status_garansi"],
        "status_service": data["status_service"],
        "solusi": data["solusi"],
        "kategori_kerusakan": data["kategori_kerusakan"],
        "harga": data["harga"],
        "estimasi_hari": estimasi,
        "tanggal_selesai": data["tanggal_selesai"],
    }

    keluhan_data = {
        "keluhan": data["keluhan"],
        "jumlah_keluhan": data["jumlah_keluhan"],
        **{flag: data[flag] for flag in COMPLAINT_FLAGS},
    }

    # ---------- Update atomik lewat RPC ----------
    try:
        result = supabase.rpc(
            "update_data_service",
            {
                "p_service_id": service_id,
                "p_customer": customer_data,
                "p_service": service_data,
                "p_keluhan": keluhan_data,
            },
        ).execute()
    except APIError as e:
        print("RPC ERROR:", getattr(e, "code", None), e.message, getattr(e, "details", None), getattr(e, "hint", None))
        code = getattr(e, "code", None)
        if code == "P0002":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
            )
        if code == "23505":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Nomor tiket bentrok dengan data lain",
            )
        if code == "23503":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referensi data tidak valid",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memperbarui data service: {e.message}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal memperbarui data service",
        )

    return {
        "message": "Data service berhasil diperbarui",
        "customer": result.data["customer"],
        "service": result.data["service"],
        "keluhan": result.data["keluhan"],
    }

# Delete
@router.delete("/data_service/{service_id}")
async def delete_data_service(
    service_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Hapus service + keluhan (+ customer jika tidak dipakai service lain)."""

    if not record_exists("service", "service_id", service_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data service tidak ditemukan",
        )

    try:
        result = supabase.rpc(
            "delete_data_service",
            {"p_service_id": service_id},
        ).execute()
    except APIError as e:
        print("RPC ERROR:", getattr(e, "code", None), e.message, getattr(e, "details", None), getattr(e, "hint", None))
        code = getattr(e, "code", None)
        if code == "P0002":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
            )
        if code == "23503":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Data masih dipakai oleh data lain sehingga tidak bisa dihapus",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menghapus data service: {e.message}",
        )

    return {
        "message": "Data service berhasil dihapus",
        "service_id": service_id,
    }
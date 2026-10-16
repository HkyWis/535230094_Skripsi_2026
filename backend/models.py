from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, model_validator


# ---- Auth ----

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ---- User Management ----

class UserRequest(BaseModel):
    username: str
    password: str
    role_id: str

class UpdateUserRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=1)
    password: Optional[str] = Field(None, min_length=6)
    role_id: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    username: str
    role_id: str
    role_name: str
    create_at: str
    update_at: str


class RoleResponse(BaseModel):
    role_id: str
    role_name: str


# ---- Master Data ----

class JenisLaptopRequest(BaseModel):
    laptop_name: str

class JenisLaptopResponse(BaseModel):
    laptop_id: str
    laptop_name: str
    create_at: str
    update_at: str


# ---- Master Data ----

class JenisServiceRequest(BaseModel):
    jenis_service: str

class JenisServiceResponse(BaseModel):
    jenis_service_id: str
    jenis_service: str
    create_at: str
    update_at: str

# ---- Customer ----
class CustomerRequest(BaseModel):
    customer_name: str
    no_telepon: str

class CustomerResponse(BaseModel):
    customer_id: str
    customer_name: str
    no_telepon: str
    create_at: str
    update_at: str

# ---- Data Service ----

class DataServiceRequest(BaseModel):
    user_id: str
    customer_id: str
    laptop_id: str
    jenis_service_id: str

    nomor_tiket_service: str
    tanggal_masuk: str

    laptop_sn: str
    status_garansi: str
    status_service: str

    solusi: str
    kategori_kerusakan: str
    harga: int
    estimasi_hari: int
    tanggal_selesai: str


class DataServiceResponse(BaseModel):
    service_id: str
    user_id: str
    customer_id: str
    laptop_id: str
    jenis_service_id: str

    nomor_tiket_service: str
    tanggal_masuk: str

    laptop_sn: str
    status_garansi: str
    status_service: str

    solusi: str
    kategori_kerusakan: str
    harga: int
    estimasi_hari: int
    tanggal_selesai: str

    create_at: str
    update_at: str

# ---- Keluhan ----

class KeluhanRequest(BaseModel):
    service_id: str

    keluhan: str
    jumlah_keluhan: int

    keluhan_lcd: bool = False
    keluhan_keyboard: bool = False
    keluhan_charger: bool = False
    keluhan_baterai: bool = False
    keluhan_engsel: bool = False
    keluhan_motherboard: bool = False
    keluhan_storage: bool = False
    keluhan_memory: bool = False
    keluhan_booting: bool = False
    keluhan_kipas: bool = False
    keluhan_port: bool = False
    keluhan_software_os: bool = False
    keluhan_password: bool = False
    keluhan_touchpad: bool = False
    keluhan_speaker: bool = False
    keluhan_part: bool = False
    keluhan_kamera: bool = False
    keluhan_power: bool = False


class KeluhanResponse(BaseModel):
    keluhan_id: str
    service_id: str

    keluhan: str
    jumlah_keluhan: int

    keluhan_lcd: bool
    keluhan_keyboard: bool
    keluhan_charger: bool
    keluhan_baterai: bool
    keluhan_engsel: bool
    keluhan_motherboard: bool
    keluhan_storage: bool
    keluhan_memory: bool
    keluhan_booting: bool
    keluhan_kipas: bool
    keluhan_port: bool
    keluhan_software_os: bool
    keluhan_password: bool
    keluhan_touchpad: bool
    keluhan_speaker: bool
    keluhan_part: bool
    keluhan_kamera: bool
    keluhan_power: bool

    create_at: str
    update_at: str

# ---- Data Service ----

COMPLAINT_FLAGS = [
    "keluhan_lcd", "keluhan_keyboard", "keluhan_charger", "keluhan_baterai",
    "keluhan_engsel", "keluhan_motherboard", "keluhan_storage", "keluhan_memory",
    "keluhan_booting", "keluhan_kipas", "keluhan_port", "keluhan_software_os",
    "keluhan_password", "keluhan_touchpad", "keluhan_speaker", "keluhan_part",
    "keluhan_kamera", "keluhan_power",
]

class DataServiceRequest(BaseModel):
    # customer
    customer_name: str
    no_telepon: str

    # service
    user_id: Optional[str] = None 
    laptop_id: str
    jenis_service_id: str

    nomor_tiket_service: str
    tanggal_masuk: date

    laptop_sn: Optional[str] = None
    status_garansi: str
    status_service: str

    solusi: Optional[str] = None
    kategori_kerusakan: Optional[str] = None
    harga: Optional[int] = Field(None, ge=0)
    estimasi_hari: Optional[int] = Field(None, ge=0)
    tanggal_selesai: Optional[date] = None

    # keluhan
    keluhan: str
    jumlah_keluhan: int = Field(..., ge=0)

    keluhan_lcd: bool = False
    keluhan_keyboard: bool = False
    keluhan_charger: bool = False
    keluhan_baterai: bool = False
    keluhan_engsel: bool = False
    keluhan_motherboard: bool = False
    keluhan_storage: bool = False
    keluhan_memory: bool = False
    keluhan_booting: bool = False
    keluhan_kipas: bool = False
    keluhan_port: bool = False
    keluhan_software_os: bool = False
    keluhan_password: bool = False
    keluhan_touchpad: bool = False
    keluhan_speaker: bool = False
    keluhan_part: bool = False
    keluhan_kamera: bool = False
    keluhan_power: bool = False

    @model_validator(mode="after")
    def check_jumlah_keluhan(self):
        aktif = sum(1 for f in COMPLAINT_FLAGS if getattr(self, f))
        if self.jumlah_keluhan != aktif:
            raise ValueError(
                f"jumlah_keluhan ({self.jumlah_keluhan}) tidak sesuai dengan "
                f"jumlah flag keluhan yang true ({aktif})"
            )
        return self


class DataServiceResponse(BaseModel):
    service_id: str
    user_id: Optional[str] = None
    customer_id: str
    laptop_id: str
    jenis_service_id: str

    nomor_tiket_service: str
    tanggal_masuk: str

    laptop_sn: Optional[str] = None
    status_garansi: str
    status_service: str

    solusi: Optional[str] = None
    kategori_kerusakan: Optional[str] = None
    harga: Optional[int] = None
    estimasi_hari: Optional[int] = None
    tanggal_selesai: Optional[str] = None

    create_at: str
    update_at: str

class CreateDataServiceResponse(BaseModel):
    message: str
    customer: CustomerResponse
    service: DataServiceResponse
    keluhan: KeluhanResponse

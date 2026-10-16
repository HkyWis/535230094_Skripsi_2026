import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

# JWT
JWT_SECRET: str = os.getenv("JWT_SECRET", "default-secret-change-this")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_MINUTES: int = 60 * 24 

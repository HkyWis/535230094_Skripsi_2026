from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes.admin_routes import router as admin_router
from routes.master_routes import router as master_router
from routes.data_service import router as data_service

app = FastAPI(
    title="Z-Tech Admin API",
    description="Backend API untuk manajemen akun admin Z-Tech",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(master_router)
app.include_router(data_service)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Z-Tech Admin API is running"}

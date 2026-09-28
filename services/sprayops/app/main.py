from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v2.router import api_v2_router

app = FastAPI(
    title="DATERRA Smart 2.0 • SprayOps Engine",
    description="Motor Geoespacial e Normativo para Drones Agrícolas (UAV/UASS) - Decreto-Lei n.º 91/2016 e DGAV",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração de CORS para permitir acesso a partir da PWA DATERRA Smart
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v2_router)

@app.get("/health", tags=["Sistema"])
async def health_check():
    return {
        "status": "healthy",
        "service": "sprayops-drone-compliance",
        "version": "2.0.0",
        "legislation": "Decreto-Lei n.º 91/2016"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

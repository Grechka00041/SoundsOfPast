import os
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import data_manager


load_dotenv()

app = FastAPI(title="Sounds of Past API")
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173")
origins = [origin.strip() for origin in raw_origins.split(",")]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        
    allow_credentials=True,       
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],  
)

@app.get("/api/tracks/{region_name}")
async def get_region_tracks(region_name: str):
    json_data = data_manager.get_tracks_by_region_json(region_name)
    if json_data == "[]":
        raise HTTPException(status_code=404, detail=f"Записи для региона '{region_name}' не найдены.")
    return Response(content=json_data, media_type="application/json")


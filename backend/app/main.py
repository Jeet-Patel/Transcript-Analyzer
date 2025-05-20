from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
import os
from dotenv import load_dotenv
from app.database import Base, engine
from app import models

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Interview Transcript Processor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def health_check():
    return {"status": "ok"}

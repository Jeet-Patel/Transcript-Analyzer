from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.tasks import process_transcript_job
from app.schemas import JobDetailResponse, JobCreateResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TranscriptJob, JobStatus
from fastapi import Depends
from fastapi.responses import FileResponse
import uuid
import os

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
router = APIRouter()

@router.post("/api/upload", response_model=JobCreateResponse)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    allowed_types = ["audio/mpeg", "text/plain", "audio/mp3", "application/octet-stream"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    job_id = str(uuid.uuid4())
    extension = file.filename.split(".")[-1]
    file_location = f"{UPLOAD_DIR}/{job_id}.{extension}"
    with open(file_location, "wb") as f:
        content = await file.read()
        f.write(content)
    print(f"[DEBUG] File saved to: {file_location}")

    new_job = TranscriptJob(
        job_id=job_id,
        status=JobStatus.PENDING,
        file_path=file_location
    )
    db.add(new_job)
    db.commit()
    print(f"[DEBUG] Job {job_id} inserted into DB with status PENDING.")

    process_transcript_job.apply_async(
        args=[job_id, file_location, file.content_type],
        queue="transcript-jobs"
    )
    print(f"[API] Submitted job {job_id} to Celery")

    return {"job_id": job_id, "status": "PENDING"}


@router.get("/api/jobs", response_model=list[JobDetailResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = db.query(TranscriptJob).all()
    print(f"[DEBUG] Retrieved jobs: {jobs}")
    return jobs

@router.get("/api/job/{job_id}", response_model=JobDetailResponse)
def get_job_by_id(job_id: str, db: Session = Depends(get_db)):
    print(f"[DEBUG] Looking for Job ID: {job_id}")
    job = db.query(TranscriptJob).filter(TranscriptJob.job_id == job_id).first()
    if not job:
        print(f"[DEBUG] Job ID {job_id} NOT found in DB.")
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/api/job/{job_id}/transcript")
def get_transcript(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TranscriptJob).filter(TranscriptJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"transcript": job.transcript or ""}

@router.get("/api/job/{job_id}/status")
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TranscriptJob).filter(TranscriptJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "status": job.status.value}

@router.delete("/api/job/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TranscriptJob).filter(TranscriptJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": f"Job {job_id} deleted successfully."}

@router.delete("/api/jobs/delete_all")
def delete_all_jobs(db: Session = Depends(get_db)):
    deleted = db.query(TranscriptJob).delete()
    db.commit()
    return {"message": f"Deleted {deleted} job records successfully."}

@router.get("/api/job/{job_id}/audio")
def get_job_audio(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TranscriptJob).filter(TranscriptJob.job_id == job_id).first()
    if not job or not job.file_path.endswith(".mp3"):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(job.file_path, media_type="audio/mpeg", filename=f"{job_id}.mp3")



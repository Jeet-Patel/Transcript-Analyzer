from app.database import SessionLocal
from app.models import TranscriptJob, JobStatus
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os

def update_job_status(job_id: str, status: str, transcript: str = None, candidate_name: str = None, position: str = None):
    print(f"[DEBUG] Using DB URL: {os.getenv('DATABASE_URL')}")
    db: Session = SessionLocal()
    print(f"[DEBUG] DB Session Created: {db}")
    try:
        job = db.query(TranscriptJob).filter(TranscriptJob.job_id == job_id).first()
        if job:
            job.status = JobStatus(status)
            if transcript:
                job.transcript = transcript
            if candidate_name:
                job.candidate_name = candidate_name
            if position:
                job.position = position
            job.updated_at = datetime.now(timezone.utc)
            db.commit()
            print(f"[DEBUG] DB Updated: Job {job_id} set to {status}")
    except Exception as e:
        print(f"[DB Update Error] {e}")
        db.rollback()
    finally:
        db.close()

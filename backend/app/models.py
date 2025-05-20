from sqlalchemy import Column, String, Text, Enum, DateTime
from sqlalchemy.sql import func
from app.database import Base
import enum

class JobStatus(enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class TranscriptJob(Base):
    __tablename__ = "transcript_jobs"

    job_id = Column(String, primary_key=True, index=True)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING)
    file_path = Column(String, nullable=False)
    transcript = Column(Text, nullable=True)
    candidate_name = Column(String, nullable=True)
    position = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

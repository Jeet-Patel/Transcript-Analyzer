from pydantic import BaseModel
from typing import Optional
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class JobCreateResponse(BaseModel):
    job_id: str
    status: JobStatus

class JobDetailResponse(BaseModel):
    job_id: str
    status: JobStatus
    transcript: Optional[str] = None
    candidate_name: Optional[str] = None
    position: Optional[str] = None

    class Config:
        orm_mode = True 
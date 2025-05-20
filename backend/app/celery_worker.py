from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "pyamqp://guest:guest@rabbitmq//")
CELERY_BACKEND_URL = os.getenv("CELERY_BACKEND_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_BACKEND_URL
)

celery_app.conf.task_routes = {
    "app.tasks.*": {"queue": "transcript-jobs"},
}

import app.tasks
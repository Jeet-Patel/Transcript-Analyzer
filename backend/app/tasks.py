from app.celery_worker import celery_app
from app.services.transcription_service import transcribe_audio
from app.services.translation_service import detect_language_and_translate
from app.services.extraction_service import extract_candidate_info
from app.db_utils import update_job_status

@celery_app.task
def process_transcript_job(job_id, file_path, content_type):
    try:
        update_job_status(job_id, "IN_PROGRESS")
        print(f"[CELERY TASK] Processing Job ID: {job_id}")
        audio_types = ["audio/mpeg", "audio/mp3", "application/octet-stream"]
        if content_type in audio_types:
            transcript = transcribe_audio(file_path)
        else:  
            with open(file_path, "r") as f:
                transcript = f.read()
        print("Transcript:", transcript)
        translated_transcript = detect_language_and_translate(transcript)
        print("Translated Transcript:", translated_transcript)
        candidate_name, position = extract_candidate_info(translated_transcript)
        print("Candidate Name:", candidate_name)
        print("Position:", position)

        update_job_status(
            job_id,
            "COMPLETED",
            transcript=translated_transcript,
            candidate_name=candidate_name,
            position=position
        )

    except Exception as e:
        update_job_status(job_id, "FAILED")

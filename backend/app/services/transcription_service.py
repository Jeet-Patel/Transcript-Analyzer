import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def transcribe_audio(file_path: str) -> str:
    """
    Uses OpenAI Whisper API to transcribe audio files to text.
    """
    try:
        with open(file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        transcript = response.text
        return transcript
    except Exception as e:
        print(f"[Transcription Error] {e}")
        raise e

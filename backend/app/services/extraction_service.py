import os
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_candidate_info(transcript: str) -> tuple:
    """
    Extracts the candidate's name and the position they are applying for from the transcript.
    Returns a tuple (candidate_name, position).
    """
    try:
        prompt = f"""
        Analyze the following job interview transcript and extract:
        1. The full name of the candidate.
        2. The position the candidate is applying for.

        Respond strictly in JSON format like:
        {{
            "candidate_name": "John Doe",
            "position": "Software Engineer"
        }}

        Transcript:
        {transcript}
        """

        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.choices[0].message.content.strip()

        extracted = json.loads(content)
        candidate_name = extracted.get("candidate_name", "").strip()
        position = extracted.get("position", "").strip()

        return candidate_name, position

    except Exception as e:
        print(f"[Extraction Error] {e}")
        return "", ""

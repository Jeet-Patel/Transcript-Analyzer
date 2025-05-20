import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def detect_language_and_translate(text: str) -> str:
    """
    Detects the language of the given text and translates it to English if necessary.
    Returns the translated or original text.
    """
    try:
        detection_prompt = f"Detect the language of the following text. Respond only with the language name.\n\n{text[:500]}"
        detection_response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": detection_prompt}]
        )
        detected_language = detection_response.choices[0].message.content.strip().lower()

        if detected_language in ["english", "en"]:
            return text 

        translation_prompt = f"Translate the following text to English:\n\n{text}"
        translation_response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": translation_prompt}]
        )
        translated_text = translation_response.choices[0].message.content.strip()

        return translated_text

    except Exception as e:
        print(f"[Translation Error] {e}")
        raise e

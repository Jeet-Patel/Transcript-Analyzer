# 🧠 Transcript Processing App

A full-stack application to process, transcribe, and analyze `.mp3` audio and `.txt` transcript files using AI services like OpenAI Whisper and GPT models.

---

## 🚀 Features

### ✅ Core Functionality
- Upload `.mp3` or `.txt` files
- Asynchronous job processing using **Celery + RabbitMQ**
- Transcription using **OpenAI Whisper API**
- Automatic language detection and translation to English
- Candidate name and job position extraction using **OpenAI GPT**
- Persistent job storage in **PostgreSQL (via Supabase or local DB)**

### 📊 UI Functionality (React + TypeScript + TailwindCSS)
- Upload form with progress handling
- Dashboard to list all jobs and their statuses
- View transcript in a modal
- Download transcript as `.txt`
- ✅ **Bonus:** Audio playback of uploaded `.mp3` files

---

## ✨ Other Features Implemented
- 🟢 Transcript Viewer Modal (in-app instead of full page navigation)
- 🟢 Audio player embedded inline in the modal
- 🟢 Status badge styling and UI beautification with TailwindCSS
- 🟢 Polling with React Query for live updates

---

## 🧱 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React, TypeScript, TailwindCSS, ShadCN UI, Vite |
| Backend      | FastAPI, SQLAlchemy, PostgreSQL, Celery, Pydantic |
| Message Queue| RabbitMQ                       |
| Result Store | Redis (for task result tracking) |
| Transcription| OpenAI Whisper API             |
| Translation/Extraction | OpenAI GPT API      |
| Containerization | Docker + Docker Compose |

---

## 🛠️ Setup Instructions

### 📦 Prerequisites

- Node.js + npm
- Python 3.10+
- Docker & Docker Compose
- OpenAI API Key
- Conda (for managing Python envs)

---

### 🧩 1. Backend Setup

```bash
cd backend

# Create and activate environment
conda create -n int_proc python=3.10
conda activate int_proc

# Install dependencies
pip install -r requirements.txt

# Set up .env file
cp .env.example .env
# Fill in your OpenAI key and database details

# Start the backend
docker-compose up --build

### 🧩 2. Frontend Setup

cd frontend
npm install
npm run dev

# Visit: http://localhost:5173


## 🎥 Demo
Watch the recorded walkthrough:
📽️ Google Drive Demo Link - https://drive.google.com/file/d/1u4DVD6pJvaac9CtrOtAZ4sJmxxItkFbE/view?usp=drive_link

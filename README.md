# CortifMain: AI FinTech Platform

A state-of-the-art AI-driven financial analysis platform using a RAG (Retrieval-Augmented Generation) architecture.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js 18+** & **npm**
- **Python 3.10+**
- **Supabase CLI** (installed via root `package.json`)

### 2. Environment Setup
Create a `.env.local` file from the example:
```bash
cp .env.example .env.local
```
Fill in your **Supabase URL** and **Anon Key**.

### 3. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Unix/Mac
source venv/bin/activate

pip install fastapi uvicorn
# To run the dev server:
uvicorn main:app --reload
```

### 4. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Architecture Summary
- **Frontend**: Next.js 15 (React 19, Tailwind CSS 4)
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Infrastructure**: Local Supabase dev environment

## 🛡️ "First Push" Checklist
- [x] Comprehensive `.gitignore` configured.
- [x] `.env.example` provided.
- [x] `backend/__init__.py` for module recognition.
- [ ] `backend/requirements.txt` generated.

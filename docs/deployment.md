# MineGuard-AI — Deployment & Hosting Guide

---

## 1. Frontend Vercel Deployment (PWA)

1. Push repository to GitHub.
2. Import `frontend` project into Vercel.
3. Build Settings:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Pre-Demo PWA Caching Instruction:
   - Open deployed Vercel site on presentation laptop **BEFORE** presentation while connected to internet.
   - PWA Service Worker will cache the Application Shell for offline operation.

---

## 2. Backend Hosting (FastAPI & SQLite)

1. Deploy `backend` to Python hosting service (e.g. Render, Railway, AWS EC2).
2. Set Environment Variables:
   - `PORT=8000`
   - `CORS_ORIGINS=https://mineguard-ai.vercel.app`
3. Start command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

---

## 3. Hardware USB Serial Presentation (Offline Mode)

> [!IMPORTANT]
> The presentation laptop does NOT require Python or local servers.
> 1. Open compatible browser (Chrome, Edge, Opera).
> 2. Open MineGuard-AI web application.
> 3. Connect ESP32 Gateway to laptop over USB cable.
> 4. Click **[ Connect Hardware ]** -> **Web Serial** -> Grant serial permission.
> 5. Live telemetry streams directly into browser dashboard.

# 🎬 Caught in 4K - Quick Start Guide

Everything is set up! Just follow these 3 steps:

## Step 1️⃣: Install Dependencies

Use Node 20 for this repo.

### Windows:
Run: `scripts\setup\setup.bat`

### Mac/Linux:
```bash
bash scripts/setup/setup.sh
```

Or manually:
```bash
npm install
```

---

## Step 2️⃣: Start the App

### Terminal 1 - Start React App:
```bash
npm start
```

Wait for it to compile, then open `https://localhost:8080/`.

Canon Takes work out of the box through Pollinations. You only need the Gemini proxy if you want the fallback path.

### Optional: Enable the Gemini fallback
The local proxy follows the same Node 20 repo runtime and uses the built-in `fetch` API.

1. Create `.env` in the project root with `GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE`
2. Start the local proxy in a second terminal:
```bash
node api-proxy.js
```
3. Export `REACT_APP_CANON_PROXY_URL` before restarting the frontend:
PowerShell:
```powershell
$env:REACT_APP_CANON_PROXY_URL='http://localhost:3001/api/canon-take'
npm start
```

bash/zsh:
```bash
export REACT_APP_CANON_PROXY_URL='http://localhost:3001/api/canon-take'
npm start
```

---

## Step 3️⃣: Test Canon Takes

1. Open https://localhost:8080/
2. Browse to any movie
3. Scroll down → You'll see **Canon Take** box loading
4. After a short delay → AI-generated summary appears if generation succeeds before the UI timeout ✨

---

## 📋 Files And Config Used:

- ✅ `.env` - create this only if you want Gemini fallback locally
- ✅ `REACT_APP_CANON_PROXY_URL` - export this in shell/CI when Gemini fallback is needed
- ✅ `api-proxy.js` - Backend server
- ✅ All components and hooks are in place

---

## ⚠️ If Something Goes Wrong:

**"API Key: ❌ NOT FOUND"**
- Check `.env` file exists in project root if you are using the Gemini fallback
- Has `GEMINI_API_KEY=`

**Gemini fallback never triggers**
- Export `REACT_APP_CANON_PROXY_URL` in the shell before `npm start`
- Pollinations remains the default path when the fallback URL is unset

**"Cannot find module 'express'"**
- Run: `npm install`

**React shows "Failed to fetch"**
- Make sure `api-proxy.js` is running if you enabled the Gemini fallback
- Check http://localhost:3001 is accessible

---

## 🎯 That's It!

Everything else is automated. In the default flow, just run `npm start` and browse the app. Add the proxy steps only if you want Gemini fallback locally. 🚀

# 🎬 Caught in 4K - Quick Start Guide

Everything is set up! Just follow these 3 steps:

## Step 1️⃣: Install Dependencies

### Windows:
Double-click: `setup.bat`

### Mac/Linux:
```bash
bash setup.sh
```

Or manually:
```bash
npm install express cors dotenv
```

---

## Step 2️⃣: Open TWO Terminal Windows

### Terminal 1 - Start Backend (Canon Takes API):
```bash
node api-proxy.js
```

You should see:
```
🎬 Caught in 4K - Canon Takes Proxy
📍 Running on http://localhost:3001
🔌 Endpoint: POST http://localhost:3001/api/canon-take
🔑 API Key: ✅ Configured
```

### Terminal 2 - Start React App:
```bash
npm start
```

Wait for it to compile... Browser should open automatically.

---

## Step 3️⃣: Test Canon Takes

1. App opens to http://localhost:3000
2. Browse to any movie
3. Scroll down → You'll see **Canon Take** box loading
4. After 2-3 seconds → AI-generated summary appears! ✨

---

## 📋 Files Already Created:

- ✅ `.env` - API key configured
- ✅ `.env.local` - React proxy URL configured
- ✅ `api-proxy.js` - Backend server
- ✅ All components and hooks are in place

---

## ⚠️ If Something Goes Wrong:

**"API Key: ❌ NOT FOUND"**
- Check `.env` file exists in project root
- Has `GEMINI_API_KEY=AIzaSyBwEQQSZpVlpTt_8QaXWQWQ5Mttjf8zSrI`

**"Cannot find module 'express'"**
- Run: `npm install express cors dotenv`

**React shows "Failed to fetch"**
- Make sure proxy is running on Terminal 1
- Check http://localhost:3001 is accessible

---

## 🎯 That's It!

Everything else is automated. Just run the two commands above and enjoy! 🚀

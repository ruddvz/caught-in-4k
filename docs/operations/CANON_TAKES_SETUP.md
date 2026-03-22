# Canon Takes API Proxy - Deployment Guide

## Overview
The Canon Takes feature uses Gemini 2.0 Flash to generate movie summaries. For security, the API key is never exposed to the frontend. Instead, you deploy a lightweight proxy server that securely calls Gemini.

---

## Quick Start: Local Development

### 1. Install Dependencies
```bash
npm install express cors dotenv
```

### 2. Create `.env` file in project root
```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 3. Create `api-proxy.js` in project root
Copy the code from `api-proxy-template.js` (uncomment the Express section at the bottom).

### 4. Start proxy server
```bash
node api-proxy.js
```

Server runs on `http://localhost:3001`

### 5. Update frontend config
Create `.env` in the React app root:
```
REACT_APP_CANON_PROXY_URL=http://localhost:3001/api/canon-take
```

### 6. Start React app
```bash
npm start
```

---

## Production Deployment

### Option A: Deploy to Vercel

**1. Copy proxy code to Vercel**
```bash
mkdir -p api
cp api-proxy-template.js api/canon-take.js
```

**2. Install Vercel CLI**
```bash
npm install -g vercel
```

**3. Deploy**
```bash
vercel
```

**4. Set environment variable in Vercel Dashboard**
- Go to Settings → Environment Variables
- Add: `GEMINI_API_KEY` = your API key

**5. Update frontend `.env`**
```
REACT_APP_CANON_PROXY_URL=https://your-project.vercel.app/api/canon-take
```

---

### Option B: Deploy to Netlify

**1. Copy proxy code**
```bash
mkdir -p netlify/functions
# Create netlify/functions/canon-take.js from api-proxy-template.js
```

**2. Edit `netlify.toml` at project root**
```toml
[build]
functions = "netlify/functions"
```

**3. Deploy**
```bash
npm run build
netlify deploy
```

**4. Set environment variable in Netlify Dashboard**
- Site Settings → Build & Deploy → Environment
- Add: `GEMINI_API_KEY` = your API key

**5. Update frontend `.env`**
```
REACT_APP_CANON_PROXY_URL=https://your-project.netlify.app/.netlify/functions/canon-take
```

---

### Option C: Deploy to Heroku / Self-Hosted

**1. Create `server.js`**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const canonical = require('./api-proxy-template.js');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/canon-take', canonical);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Canon proxy running on port ${PORT}`);
});
```

**2. Install & deploy (Heroku example)**
```bash
npm install
git push heroku main
```

**3. Set environment variable**
```bash
heroku config:set GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

**4. Update frontend `.env`**
```
REACT_APP_CANON_PROXY_URL=https://your-heroku-app.herokuapp.com/api/canon-take
```

---

## Testing the Proxy

### Local Test
```bash
curl -X POST http://localhost:3001/api/canon-take \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Oppenheimer",
    "year": 2023,
    "genres": "biography, drama, history",
    "imdbRating": 8.1
  }'
```

### Expected Response
```json
{
  "canonTake": "oppenheimer is basically mission: impossible but make it atomic. 3 hours of christopher nolan slow-motion and tenet-level audio mixing, but honestly? the man assembled every powerful actor available and made them all regret it differently. instant classic."
}
```

---

## Troubleshooting

### "API key not configured"
- Ensure `GEMINI_API_KEY` environment variable is set on your server
- Check `.env` file exists locally (if running locally)

### "No response from Gemini"
- Check your Gemini API key is valid
- Verify you're using `gemini-2.0-flash` model
- Check Gemini API status page

### Proxy returns 405 error
- Only POST requests allowed
- Verify your frontend is sending POST requests

### CORS errors in browser
- Ensure proxy has `cors` middleware enabled (it does by default)
- Check frontend `REACT_APP_CANON_PROXY_URL` is correct

---

## Rate Limiting

The default configuration processes 3 canon takes every 15 seconds (4/min). This is safe for free tier Gemini. If you need faster processing:

Edit `src/services/CanonTakesQueue/CanonTakesQueue.js`:
```javascript
const BATCH_SIZE = 5; // More per batch
const BATCH_DELAY = 12000; // 5/min
```

Monitor your Gemini API usage in Google Cloud Console.

---

## Security Notes

✅ **API key is server-side only** - Never exposed to browser
✅ **CORS enabled** - Frontend can safely call the proxy
✅ **Rate limiting** - Built-in batch processing prevents abuse
✅ **Error handling** - Graceful fallback if API fails

⚠️ **For production**, consider adding:
- API rate limiting per IP
- Request validation
- Logging/monitoring
- Authentication (if needed)

---

## Next Steps

1. Choose deployment option (local, Vercel, Netlify, etc.)
2. Deploy the proxy
3. Update `REACT_APP_CANON_PROXY_URL` in frontend `.env`
4. Restart React app
5. Open a movie detail page → Canon Takes should appear!

Questions? Check error logs in proxy server console.

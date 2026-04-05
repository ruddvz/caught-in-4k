# Canon Takes Fallback Proxy - Deployment Guide

## Overview
The Canon Takes feature uses Pollinations as the primary generator for movie summaries. Gemini 2.0 Flash is the fallback path, and its API key is never exposed to the frontend. Instead, you deploy a lightweight proxy server that securely calls Gemini only when the fallback is needed.

This repo is pinned to Node 20. Use that runtime anywhere you run the fallback proxy in this project.

---

## Quick Start: Local Development Fallback

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` file in project root
```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 3. Use the checked-in local proxy
This repo already includes `api-proxy.js` at the project root for local development. It adds the local middleware stack, including Helmet and server-side rate limiting, on top of the Gemini handler.

### 4. Start proxy server
```bash
node api-proxy.js
```

Server runs on `http://localhost:3001`

### 5. Enable the Gemini fallback in frontend config
Export `REACT_APP_CANON_PROXY_URL` in the same shell you use to start the app or in your CI environment:
PowerShell:
```powershell
$env:REACT_APP_CANON_PROXY_URL='http://localhost:3001/api/canon-take'
```

bash/zsh:
```bash
export REACT_APP_CANON_PROXY_URL='http://localhost:3001/api/canon-take'
```

Webpack in this repo reads existing environment variables from the shell or CI. It does not auto-load `.env.local` into the frontend build.

If `REACT_APP_CANON_PROXY_URL` is not set, Canon Takes still work through Pollinations and the Gemini proxy path stays disabled.

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
cp scripts/deployment/api-proxy-template.js api/canon-take.js
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

**5. Export frontend fallback URL before the app build or dev server starts**
PowerShell:
```powershell
$env:REACT_APP_CANON_PROXY_URL='https://your-project.vercel.app/api/canon-take'
npm start
```

bash/zsh:
```bash
export REACT_APP_CANON_PROXY_URL='https://your-project.vercel.app/api/canon-take'
npm start
```

---

### Option B: Deploy to Netlify

The shared `scripts/deployment/api-proxy-template.js` file is not a Netlify function entrypoint by itself. If you need Netlify, add a Netlify-specific wrapper around the Gemini handler first. Until that wrapper exists, prefer Vercel or a self-hosted deployment for the fallback proxy.

---

### Option C: Deploy to Heroku / Self-Hosted

**1. Create `server.js`**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const canonical = require('./scripts/deployment/api-proxy-template.js');

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

**4. Export frontend fallback URL before the app build or dev server starts**
PowerShell:
```powershell
$env:REACT_APP_CANON_PROXY_URL='https://your-heroku-app.herokuapp.com/api/canon-take'
npm start
```

bash/zsh:
```bash
export REACT_APP_CANON_PROXY_URL='https://your-heroku-app.herokuapp.com/api/canon-take'
npm start
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

The default configuration drains the Canon Takes queue every 5 seconds and processes up to 3 items per pass. Pollinations handles the primary generation path, so the Gemini proxy is only hit when fallback is needed. If you need to retune that behavior:

Edit `src/services/BackgroundAgents/C4KBackgroundAgents.js`:
```javascript
// in start()
this.interval = setInterval(() => this._processQueues(), 5000);

// in _processQueues()
const items = Array.from(this.canonTakesQueue.values()).slice(0, 3);
```

Monitor your Gemini API usage in Google Cloud Console.

For local development, `api-proxy.js` also applies Express rate limiting on the server side. If you deploy the lightweight template to a serverless platform, add platform-level or application-level request limits there as well.

---

## Security Notes

✅ **API key is server-side only** - Never exposed to browser
✅ **CORS enabled** - Frontend can safely call the proxy
✅ **Queue throttling** - Board catalog prefetch uses a batched queue before it reaches the Gemini fallback path
✅ **Error handling** - Graceful fallback if API fails

⚠️ **For production**, consider adding:
- API rate limiting per IP if your deployment target does not provide it already
- Request validation
- Logging/monitoring
- Authentication (if needed)

---

## Next Steps

1. Choose deployment option (local, Vercel, Netlify, etc.)
2. Deploy the proxy
3. Export `REACT_APP_CANON_PROXY_URL` before starting the frontend build or dev server
4. Restart React app
5. Open a movie detail page → Canon Takes should appear!

Questions? Check error logs in proxy server console.

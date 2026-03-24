/**
 * Caught in 4K - Canon Takes API Proxy
 * Local development server
 * 
 * Run: node api-proxy.js
 * Server: http://localhost:3001/api/canon-take
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security headers — applied first, before all other middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors());
app.use(express.json());

// General API rate limiter: 30 requests per IP per minute
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

// Stricter limiter for Canon Takes endpoint: 10 per IP per minute
const canonTakeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Canon Takes rate limit reached.' },
});
app.use('/api/canon-take', canonTakeLimiter);

const handleCanonTake = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, year, genres, imdbRating } = req.body;

  if (!title || !year || !genres || imdbRating === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const userPrompt = `Write a Canon Take for: ${title} (${year}). Genre: ${genres}. IMDB: ${imdbRating}/10.`;

    const systemPrompt = `You write Canon Takes — short, honest movie summaries for a Gen Z film platform called Caught in 4K. Rules: max 3 sentences, no more. Sound like a friend who has seen the film giving you the real verdict. Have an actual opinion. Reference the cultural moment if there is one (memes, catchphrases, awards, controversies). Never start with "This film" or "The movie". No spoilers. No em dashes. No AI tells like "delves into", "testament to", "nuanced". Write in lowercase where it fits the tone.`;

    console.log(`[Canon Take] Generating for: ${title} (${year})`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: userPrompt }],
            },
          ],
          safety_settings: [
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
          generation_config: {
            max_output_tokens: 120,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error(`[Canon Take] Gemini error:`, data.error);
      return res.status(400).json({ error: data.error.message });
    }

    const canonTake = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!canonTake) {
      return res.status(500).json({ error: 'No response from Gemini' });
    }

    console.log(`[Canon Take] ✅ Generated: "${canonTake.substring(0, 60)}..."`);
    return res.status(200).json({ canonTake });
  } catch (error) {
    console.error('[Canon Take] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

app.post('/api/canon-take', handleCanonTake);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🎬 Caught in 4K - Canon Takes Proxy`);
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`🔌 Endpoint: POST http://localhost:${PORT}/api/canon-take`);
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ NOT FOUND'}\n`);
});

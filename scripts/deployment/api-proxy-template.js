/**
 * Gemini API Proxy Service Template
 * Deploy to Vercel, Netlify, or run locally as Node.js server
 * 
 * This proxy safely handles the Gemini API key on the backend
 * Frontend calls this endpoint instead of calling Gemini directly
 */

// ============================================
// DEPLOYMENT OPTIONS:
// ============================================
// 1. VERCEL: Create api/canon-take.js with this code
// 2. NETLIFY: Create netlify/functions/canon-take.js with this code
// 3. LOCAL: npm install express cors, then run this as Node.js server
// ============================================

// For LOCAL DEVELOPMENT (Node.js + Express):
// Save this as api-proxy.js, then:
// npm install express cors dotenv
// Add to .env: GEMINI_API_KEY=your_key_here
// Run: node api-proxy.js

// ============================================
// LOCALHOST/VERCEL/NETLIFY HANDLER
// ============================================

const handler = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, year, genres, imdbRating } = req.body;

  // Validate inputs
  if (!title || !year || !genres || imdbRating === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build user prompt
    const userPrompt = `Write a Canon Take for: ${title} (${year}). Genre: ${genres}. IMDB: ${imdbRating}/10.`;

    // System prompt from requirements
    const systemPrompt = `You write Canon Takes — short, honest movie summaries for a Gen Z film platform called Caught in 4K. Rules: max 3 sentences, no more. Sound like a friend who has seen the film giving you the real verdict. Have an actual opinion. Reference the cultural moment if there is one (memes, catchphrases, awards, controversies). Never start with "This film" or "The movie". No spoilers. No em dashes. No AI tells like "delves into", "testament to", "nuanced". Write in lowercase where it fits the tone.`;

    // Call Gemini API
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

    // Extract text from response
    const canonTake =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!canonTake) {
      return res.status(500).json({ error: 'No response from Gemini' });
    }

    return res.status(200).json({ canonTake });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ============================================
// FOR DEVELOPMENT SERVER (Node.js + Express)
// ============================================
// Uncomment below if running as standalone Express server

/*
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/canon-take', handler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Canon Takes proxy running on http://localhost:${PORT}`);
});
*/

module.exports = handler;

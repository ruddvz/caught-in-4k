/**
 * Server-side Canon Take LLM provider chain.
 * Tries Gemini, then Groq, then OpenRouter.
 */

const CANON_TAKE_SYSTEM = 'Write ONE sentence (max 15 words) that nails this movie\'s vibe for a Gen Z film platform. Be punchy, specific, honest — no generic filler. Tone must match genre: horror = dread, comedy = roast, action = hype, drama = dry wit, romance = knowing smirk, thriller = nervous energy. Low score = deserved shade, high score = earned hype. Never start with "This film" or "The movie". No em dashes. No AI tells. Write in lowercase where it fits. Reply ONLY with the sentence, nothing else.';

function normalizeGeneratedText(text) {
    if (typeof text !== 'string') {
        return '';
    }

    return text.trim().replace(/^["']|["']$/g, '');
}

async function callGemini(userPrompt, systemPrompt, env) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        return '';
    }

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
                generation_config: {
                    max_output_tokens: 80,
                    temperature: 0.7,
                },
            }),
        }
    );

    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data?.error?.message || `Gemini ${response.status}`);
    }

    return normalizeGeneratedText(data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function callOpenAiCompatibleChat({
    url,
    apiKey,
    model,
    userPrompt,
    systemPrompt,
    providerName,
}) {
    if (!apiKey) {
        return '';
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 80,
            temperature: 0.7,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || `${providerName} ${response.status}`);
    }

    return normalizeGeneratedText(data?.choices?.[0]?.message?.content || '');
}

async function callGroq(userPrompt, systemPrompt, env) {
    return callOpenAiCompatibleChat({
        url: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        userPrompt,
        systemPrompt,
        providerName: 'Groq',
    });
}

async function callOpenRouter(userPrompt, systemPrompt, env) {
    return callOpenAiCompatibleChat({
        url: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey: env.OPENROUTER_API_KEY,
        model: env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
        userPrompt,
        systemPrompt,
        providerName: 'OpenRouter',
    });
}

async function generateCanonTakeText({ title, year, genres, imdbRating }, env = process.env) {
    const userPrompt = `Write a Canon Take for: ${title} (${year}). Genre: ${genres}. IMDB: ${imdbRating}/10.`;
    const providers = [
        { name: 'Gemini', run: () => callGemini(userPrompt, CANON_TAKE_SYSTEM, env) },
        { name: 'Groq', run: () => callGroq(userPrompt, CANON_TAKE_SYSTEM, env) },
        { name: 'OpenRouter', run: () => callOpenRouter(userPrompt, CANON_TAKE_SYSTEM, env) },
    ];

    for (const provider of providers) {
        try {
            const text = await provider.run();
            if (text) {
                return { canonTake: text, provider: provider.name };
            }
        } catch (error) {
            console.error(`[Canon Take] ${provider.name} failed:`, error.message);
        }
    }

    return { canonTake: '', provider: null };
}

module.exports = {
    CANON_TAKE_SYSTEM,
    generateCanonTakeText,
};

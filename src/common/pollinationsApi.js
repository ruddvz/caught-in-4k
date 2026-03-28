/**
 * Pollinations.AI API — Free generative AI, no API key required
 * https://pollinations.ai
 *
 * Used for:
 *   - Canon Takes (Gen Z movie commentary)
 *   - Satisfaction Meter (dynamic AI-powered one-liners)
 */

const POLLINATIONS_TEXT_URL = 'https://text.pollinations.ai';

const CANON_TAKE_SYSTEM = 'You write Canon Takes — 1 to 2 sentence honest movie verdicts for a Gen Z film platform called Caught in 4K. HARD RULE: maximum 2 sentences. Include at least one joke, cultural reference, or brutally honest line. Tone must match genre — horror: unsettled dread; romance: knowing smirk; action: pure hype; comedy: roast energy; drama: dry wit; thriller: nervous energy; tragedy: wry sadness. Examples: horror → "the kind of movie that made people sleep with the lights on for a week — and honestly, fair."; comedy → "if you didn\'t ugly-laugh at least once, we can\'t be friends."; drama → "oscar bait that actually earned it, which is rarer than you think." Draw from public reception vibe — low score = deserved shade, high score = earned hype. Never start with "This film" or "The movie". No spoilers. No em dashes. No AI tells like "delves into", "testament to", "nuanced". Write in lowercase where it fits the tone. Reply ONLY with the take text, nothing else.';

const SATISFACTION_SYSTEM = 'You generate one short sentence (max 12 words) that captures the vibe of a movie\'s reception in Gen Z internet slang. Be funny, opinionated, specific. No em dashes. No generic filler. Reply ONLY with the sentence, nothing else.';

/**
 * Low-level call to Pollinations text endpoint
 */
async function pollinationsText(systemPrompt, userPrompt, { seed, model } = {}) {
    const params = new URLSearchParams({
        system: systemPrompt,
        nohtml: 'true',
    });
    if (seed !== undefined) params.set('seed', String(seed));
    if (model) params.set('model', model);

    const encodedPrompt = encodeURIComponent(userPrompt);
    const url = `${POLLINATIONS_TEXT_URL}/${encodedPrompt}?${params.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Pollinations API ${response.status}`);
        }

        const text = await response.text();
        return text.trim().replace(/^["']|["']$/g, '');
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

/**
 * Generate a Canon Take for a movie
 */
async function generateCanonTake(title, year, genres, imdbRating) {
    const userPrompt = `Write a Canon Take for: ${title} (${year}). Genre: ${genres || 'unknown'}. IMDB: ${imdbRating || 'N/A'}/10.`;
    const seed = hashCode(`${title}_${year}`);
    return pollinationsText(CANON_TAKE_SYSTEM, userPrompt, { seed });
}

/**
 * Generate a personalized satisfaction one-liner for a movie
 */
async function generateSatisfactionOneLiner(title, year, tierName, score) {
    const userPrompt = `Movie: ${title} (${year}). Audience score: ${score}%. Tier: "${tierName}". Write a one-liner about why this movie got this score.`;
    const seed = hashCode(`sat_${title}_${year}`);
    return pollinationsText(SATISFACTION_SYSTEM, userPrompt, { seed });
}

/** Simple deterministic hash for consistent seed per movie */
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

module.exports = { generateCanonTake, generateSatisfactionOneLiner, pollinationsText };

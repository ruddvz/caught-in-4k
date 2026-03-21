/**
 * C4K Background Agent System
 * Runs non-blocking background workers for Gen Z AI Summaries (Canon Takes)
 * and global Satisfaction Meter metrics calculation.
 */

const { SATISFACTION_TIERS } = require('../../common/useSatisfactionMeter');

const CACHE_PREFIX = 'c4k_canon_take_';

const getCached = (title, year) => {
    try {
        const key = `${CACHE_PREFIX}${title}_${year}`;
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (_e) {
        return null;
    }
};

const setCached = (title, year, canonTake) => {
    try {
        const key = `${CACHE_PREFIX}${title}_${year}`;
        localStorage.setItem(key, JSON.stringify({ canonTake, timestamp: Date.now() }));
    } catch (_e) {
        console.warn('Failed to cache Canon Take', _e);
    }
};

class C4KBackgroundAgents {
    constructor() {
        this.canonTakesQueue = new Map();
        this.satisfactionData = new Map();
        this.isProcessing = false;
        this.interval = null;
        this.PROXY_URL = process.env.REACT_APP_CANON_PROXY_URL || 'http://localhost:3001/api/canon-take';
    }

    start() {
        if (this.interval) return;
        console.warn('[🤖 C4K Agent] Background agents started.');
        // Run background processing loop every 10 seconds
        this.interval = setInterval(() => this._processQueues(), 10000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
   * Queue items for the Gen Z Summary Agent
   */
    queueForCanonTake(items = []) {
        items.forEach((item) => {
            const id = `${item.name}_${item.releaseInfo || 'unknown'}`;
            if (!this.canonTakesQueue.has(id)) {
                this.canonTakesQueue.set(id, item);
            }
        });
    }

    /**
   * Pre-calculate Satisfaction Metrics
   */
    processSatisfactionMetrics(items = []) {
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
            window.requestIdleCallback(() => this._calculateMetrics(items));
        } else {
            setTimeout(() => this._calculateMetrics(items), 100);
        }
    }

    _calculateMetrics(items) {
        items.forEach((item) => {
            const id = `${item.name}_${item.releaseInfo || 'unknown'}`;
            const rating = item.vote_average || 0;
            const score = Math.round((rating / 10) * 100);

            const tier = SATISFACTION_TIERS.find((t) => score >= t.minScore && score <= t.maxScore)
                   || SATISFACTION_TIERS[SATISFACTION_TIERS.length - 1];

            this.satisfactionData.set(id, { score, tier });
        });
    }

    async _processQueues() {
        if (this.isProcessing || this.canonTakesQueue.size === 0) return;
        this.isProcessing = true;

        // Process up to 3 items per cycle to prevent overwhelming the AI API
        const batch = Array.from(this.canonTakesQueue.values()).slice(0, 3);

        for (const item of batch) {
            const id = `${item.name}_${item.releaseInfo || 'unknown'}`;
            this.canonTakesQueue.delete(id); // Remove from queue

            const cached = getCached(item.name, item.releaseInfo);
            if (cached) {
                continue;
            }

            console.warn(`[🤖 Gen Z Agent] Processing summary for: ${item.name}`);
            try {
                const response = await fetch(this.PROXY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: item.name,
                        year: item.releaseInfo,
                        genres: item.genre || 'unknown',
                        voteAverage: item.vote_average || 0
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.canonTake) {
                        setCached(item.name, item.releaseInfo, data.canonTake);
                    }
                }
            } catch (err) {
                console.error('[🤖 Gen Z Agent] Failed to fetch summary:', err);
            }
        }

        this.isProcessing = false;
    }

    getSatisfactionData(id) {
        return this.satisfactionData.get(id);
    }
}

const c4kAgents = new C4KBackgroundAgents();

module.exports = { c4kAgents };

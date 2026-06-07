/**
 * C4K Background Agent System
 * Runs non-blocking background workers for Gen Z AI Summaries (Canon Takes)
 * and global Satisfaction Meter metrics calculation.
 * Uses Pollinations.AI (free, no key) as primary, Gemini proxy as fallback.
 */

const { SATISFACTION_TIERS } = require('../../common/useSatisfactionMeter');
const { generateCanonTakeWithFallbacks, hasCanonTakeProxy } = require('../../common/pollinationsApi');

const CACHE_PREFIX = 'c4k_canon_take_';
const MAX_PROXY_RETRIES = 2;

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
        this.canonTakeRetryCounts = new Map();
        this.satisfactionData = new Map();
        this.isProcessing = false;
        this.interval = null;
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => this._processQueues(), 5000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    queueForCanonTake(items = []) {
        items.forEach((item) => {
            const id = `${item.name}_${item.releaseInfo || 'unknown'}`;
            if (!this.canonTakesQueue.has(id)) {
                this.canonTakesQueue.set(id, item);
                this.canonTakeRetryCounts.set(id, 0);
            }
        });
    }

    // Move a single item to the front of the queue so it's processed in the next batch
    prioritizeForCanonTake(item) {
        if (!item || !item.name) return;
        const id = `${item.name}_${item.releaseInfo || 'unknown'}`;
        if (getCached(item.name, item.releaseInfo)) return; // already cached
        // Rebuild map with this item first
        const rest = new Map(this.canonTakesQueue);
        rest.delete(id);
        this.canonTakesQueue = new Map([[id, item], ...rest]);
        this.canonTakeRetryCounts.set(id, this.canonTakeRetryCounts.get(id) || 0);
    }

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

        const batch = Array.from(this.canonTakesQueue.values()).slice(0, 3);

        for (const item of batch) {
            const id = `${item.name}_${item.releaseInfo || 'unknown'}`;
            this.canonTakesQueue.delete(id);

            const cached = getCached(item.name, item.releaseInfo);
            if (cached) {
                this.canonTakeRetryCounts.delete(id);
                continue;
            }

            const genres = Array.isArray(item.genre) ? item.genre.join(', ') : (item.genre || 'unknown');
            let take = '';
            let shouldRetry = false;

            try {
                take = await generateCanonTakeWithFallbacks(
                    item.name,
                    item.releaseInfo,
                    genres,
                    item.vote_average || 0
                );
            } catch (_e) {
                shouldRetry = true;
            }

            if (!take) {
                shouldRetry = true;
            }

            if (take) {
                setCached(item.name, item.releaseInfo, take);
                this.canonTakeRetryCounts.delete(id);
                continue;
            }

            if (shouldRetry && hasCanonTakeProxy) {
                const retries = this.canonTakeRetryCounts.get(id) || 0;
                if (retries < MAX_PROXY_RETRIES) {
                    this.canonTakeRetryCounts.set(id, retries + 1);
                    this.canonTakesQueue.set(id, item);
                    continue;
                }
            }

            this.canonTakeRetryCounts.delete(id);
        }

        this.isProcessing = false;
    }

    getSatisfactionData(id) {
        return this.satisfactionData.get(id);
    }
}

const c4kAgents = new C4KBackgroundAgents();

module.exports = { c4kAgents };

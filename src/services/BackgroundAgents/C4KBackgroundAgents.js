/**
 * C4K Background Agent System
 * Runs non-blocking background workers for Gen Z AI Summaries (Canon Takes)
 * and global Satisfaction Meter metrics calculation.
 * Uses Pollinations.AI (free, no key) as primary, Gemini proxy as fallback.
 */

const { SATISFACTION_TIERS } = require('../../common/useSatisfactionMeter');
const { generateCanonTake } = require('../../common/pollinationsApi');

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
        this.proxyAvailable = false;
        this.proxyChecked = false;
        this.PROXY_URL = process.env.REACT_APP_CANON_PROXY_URL || '';
    }

    start() {
        if (this.interval) return;
        // Start immediately — Pollinations doesn't need a proxy
        this.interval = setInterval(() => this._processQueues(), 5000);
    }

    async _checkProxy() {
        // Legacy — only used if Pollinations fails and PROXY_URL is set
        if (!this.PROXY_URL) {
            this.proxyChecked = true;
            return;
        }
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const resp = await fetch(this.PROXY_URL, { method: 'OPTIONS', signal: controller.signal }).catch(() => null);
            clearTimeout(timeout);
            this.proxyAvailable = resp !== null;
        } catch (_e) {
            this.proxyAvailable = false;
        }
        this.proxyChecked = true;
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
                continue;
            }

            // Primary: Pollinations.AI (free, no key)
            try {
                const take = await generateCanonTake(
                    item.name,
                    item.releaseInfo,
                    item.genre || 'unknown',
                    item.vote_average || 0
                );
                if (take) {
                    setCached(item.name, item.releaseInfo, take);
                    continue;
                }
            } catch (_pollErr) {
                // Pollinations failed — try proxy fallback
            }

            // Fallback: Gemini proxy (if configured)
            if (!this.PROXY_URL) continue;
            if (!this.proxyChecked) await this._checkProxy();
            if (!this.proxyAvailable) continue;

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
            } catch (_err) {
                this.proxyAvailable = false;
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

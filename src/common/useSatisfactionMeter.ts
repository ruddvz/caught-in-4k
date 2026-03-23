// Copyright (C) 2017-2023 Smart code 203358507
/**
 * Caught in 4K — Satisfaction Meter
 * Converts a voteAverage (0–10 IMDB-style) into a Gen Z
 * satisfaction tier with emoji, gradient, and one-liner.
 */

export const SATISFACTION_TIERS = [
    { id: 'absolute-cinema', emoji: '🏆', name: 'Absolute Cinema', minScore: 85, maxScore: 100, oneLiner: 'a certified masterpiece. no debates.', gradientStart: '#F5C842', gradientEnd: '#FF5C00' },
    { id: 'certified-fresh', emoji: '🔥', name: 'Certified Fresh', minScore: 70, maxScore: 84, oneLiner: 'worth the hype fr fr.', gradientStart: '#22B365', gradientEnd: '#00D68F' },
    { id: 'mid', emoji: '😐', name: 'Mid', minScore: 50, maxScore: 69, oneLiner: 'it had its moments.', gradientStart: '#E6B422', gradientEnd: '#FFD700' },
    { id: 'flop-era', emoji: '💀', name: 'Flop Era', minScore: 25, maxScore: 49, oneLiner: 'should have stayed in the group chat.', gradientStart: '#DC2626', gradientEnd: '#7F1D1D' },
    { id: 'dead-on-arrival', emoji: '🪦', name: 'Dead on Arrival', minScore: 0, maxScore: 24, oneLiner: 'no one asked for this.', gradientStart: '#6B7280', gradientEnd: '#374151' },
];

export const useSatisfactionMeter = (voteAverage: number | null | undefined) => {
    if (voteAverage === null || voteAverage === undefined || isNaN(voteAverage)) {
        return null;
    }

    const percentage = Math.round(Math.min(100, Math.max(0, (voteAverage / 10) * 100)));

    const tier = SATISFACTION_TIERS.find(
        (t) => percentage >= t.minScore && percentage <= t.maxScore
    ) || SATISFACTION_TIERS[SATISFACTION_TIERS.length - 1];

    return { ...tier, percentage, voteAverage };
};

export default useSatisfactionMeter;

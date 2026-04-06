// Copyright (C) 2017-2023 Smart code 203358507
/**
 * Caught in 4K — Satisfaction Meter
 * Maps either a 0-10 score or a 0-100 percentage to the premium
 * five-tier verdict system used across the browse and details surfaces.
 */

export type SatisfactionScale = 'ten' | 'percent';

type SatisfactionOptions = {
    scale?: SatisfactionScale,
};

export const SATISFACTION_TIERS = [
    { id: 'absolute-cinema', emoji: '🏆', name: 'Absolute Cinema', minScore: 90, maxScore: 100, oneLiner: 'Event viewing with zero compromise.', gradientStart: '#F6D89A', gradientEnd: '#FFB05F' },
    { id: 'must-watch', emoji: '✦', name: 'Must Watch', minScore: 75, maxScore: 89, oneLiner: 'Big-screen energy and an easy recommendation.', gradientStart: '#F3C766', gradientEnd: '#F69F52' },
    { id: 'worth-your-time', emoji: '✓', name: 'Worth Your Time', minScore: 60, maxScore: 74, oneLiner: 'Solid craft, steady payoff, low regret.', gradientStart: '#78C8A4', gradientEnd: '#4596B8' },
    { id: 'for-fans-first', emoji: '•', name: 'For Fans First', minScore: 40, maxScore: 59, oneLiner: 'Works best if the premise already has you.', gradientStart: '#7C89C9', gradientEnd: '#58619A' },
    { id: 'skip-this-one', emoji: '–', name: 'Skip This One', minScore: 0, maxScore: 39, oneLiner: 'Styled well enough for the carousel. Not much else.', gradientStart: '#666E84', gradientEnd: '#343B4D' },
];

export const useSatisfactionMeter = (
    scoreInput: number | null | undefined,
    options: SatisfactionOptions = {}
) => {
    if (scoreInput === null || scoreInput === undefined || Number.isNaN(scoreInput)) {
        return null;
    }

    const scale = options.scale || 'ten';
    const percentage = Math.round(Math.min(100, Math.max(0, scale === 'percent' ? scoreInput : (scoreInput / 10) * 100)));

    const tier = SATISFACTION_TIERS.find(
        (candidate) => percentage >= candidate.minScore && percentage <= candidate.maxScore
    ) || SATISFACTION_TIERS[SATISFACTION_TIERS.length - 1];

    return { ...tier, percentage, voteAverage: scale === 'ten' ? scoreInput : percentage / 10 };
};

export default useSatisfactionMeter;

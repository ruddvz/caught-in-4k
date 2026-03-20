/**
 * Caught in 4K Satisfaction Meter Hook
 * Converts TMDB vote_average to 5-tier satisfaction level with styling
 */

import { useMemo } from 'react';

// Tier definitions
export const SATISFACTION_TIERS = [
  {
    id: 'absolute-cinema',
    emoji: '🏆',
    name: 'Absolute Cinema',
    minScore: 85,
    maxScore: 100,
    oneLiner: 'a certified masterpiece. no debates.',
    gradientStart: '#F5C842',
    gradientEnd: '#FF5C00',
  },
  {
    id: 'bussin-fr-fr',
    emoji: '🔥',
    name: 'Bussin FR FR',
    minScore: 75,
    maxScore: 84.9,
    oneLiner: 'genuinely good. watch tonight.',
    gradientStart: '#16A34A',
    gradientEnd: '#6EE7B7',
  },
  {
    id: 'decent-sit',
    emoji: '👍',
    name: 'Decent Sit',
    minScore: 65,
    maxScore: 74.9,
    oneLiner: 'solid. no ragrets (intentional).',
    gradientStart: '#0891B2',
    gradientEnd: '#22D3EE',
  },
  {
    id: 'meh-be-okay',
    emoji: '😑',
    name: 'Meh, Be Okay',
    minScore: 50,
    maxScore: 64.9,
    oneLiner: 'questionable life choice. you do you bestie.',
    gradientStart: '#92400E',
    gradientEnd: '#FBBF24',
  },
  {
    id: 'flop-era',
    emoji: '🪦',
    name: 'Flop Era',
    minScore: 0,
    maxScore: 49.9,
    oneLiner: 'we are so sorry for your time.',
    gradientStart: '#374151',
    gradientEnd: '#6B7280',
  },
];

/**
 * Hook to calculate satisfaction tier from rating
 * @param {number|null} voteAverage - TMDB vote_average (0-10 scale)
 * @returns {Object} Tier object with emoji, name, oneLiner, percentage, gradient colors
 */
export const useSatisfactionMeter = (voteAverage) => {
  return useMemo(() => {
    if (voteAverage === null || voteAverage === undefined) {
      return null;
    }

    // Convert to percentage (0-100)
    const percentage = Math.round((voteAverage / 10) * 100);

    // Find the matching tier
    const tier = SATISFACTION_TIERS.find(
      (t) => percentage >= t.minScore && percentage <= t.maxScore
    );

    if (!tier) {
      // Fallback to Flop Era if no match (shouldn't happen)
      tier = SATISFACTION_TIERS[4];
    }

    return {
      ...tier,
      percentage,
      voteAverage,
    };
  }, [voteAverage]);
};

export default useSatisfactionMeter;

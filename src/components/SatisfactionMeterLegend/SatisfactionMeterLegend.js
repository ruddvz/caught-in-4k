/**
 * Satisfaction Meter Legend Component
 * Displays all 5 satisfaction tiers with emoji, name, and range
 */

import React from 'react';
import { SATISFACTION_TIERS } from '../../common/useSatisfactionMeter';
import styles from './styles.less';

const SatisfactionMeterLegend = () => {
  return (
    <div className={styles.legend}>
      <div className={styles.title}>Satisfaction Ratings</div>
      <div className={styles.tiers}>
        {SATISFACTION_TIERS.map((tier) => (
          <div key={tier.id} className={styles.tierItem}>
            <span className={styles.emoji}>{tier.emoji}</span>
            <div className={styles.tierDetails}>
              <span className={styles.tierName}>{tier.name}</span>
              <span className={styles.tierRange}>
                {tier.minScore}–{Math.floor(tier.maxScore)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SatisfactionMeterLegend;

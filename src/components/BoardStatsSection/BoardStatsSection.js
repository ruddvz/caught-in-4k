/**
 * Board Stats Section Component
 * Displays global satisfaction meter with average rating from all catalogs
 * Includes shimmer animation and tier legend
 */

import React, { useMemo } from 'react';
import SatisfactionMeterBar from '../SatisfactionMeterBar/SatisfactionMeterBar';
import SatisfactionMeterLegend from '../SatisfactionMeterLegend/SatisfactionMeterLegend';
import { useSatisfactionMeter } from '../../common/useSatisfactionMeter';
import styles from './styles.less';

const BoardStatsSection = ({ metaRows = [] }) => {
  const averageRating = useMemo(() => {
    if (!metaRows || metaRows.length === 0) {
      return null;
    }

    // Flatten all meta items from all rows
    const allMetaItems = metaRows.flatMap((row) => row.content || []);

    // Filter items with vote_average
    const ratedItems = allMetaItems.filter((item) => item.vote_average != null);

    if (ratedItems.length === 0) {
      return null;
    }

    // Calculate average
    const sum = ratedItems.reduce((acc, item) => acc + item.vote_average, 0);
    return sum / ratedItems.length;
  }, [metaRows]);

  const tier = useSatisfactionMeter(averageRating);

  if (!tier) {
    return null;
  }

  return (
    <div className={styles.statsSection}>
      <div className={styles.content}>
        <div className={styles.meterContainer}>
          <h2 className={styles.heading}>How's the vibe?</h2>
          <SatisfactionMeterBar tier={tier} size="global" animated={true} />
        </div>
        <SatisfactionMeterLegend />
      </div>
    </div>
  );
};

export default BoardStatsSection;

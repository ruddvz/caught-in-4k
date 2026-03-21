/**
 * Board Stats Section Component
 * Displays global satisfaction meter with average rating from all catalogs
 * Includes shimmer animation and tier legend
 */

const React = require('react');
const { useMemo } = React;
const PropTypes = require('prop-types');
const SatisfactionMeterBar = require('../SatisfactionMeterBar/SatisfactionMeterBar');
const SatisfactionMeterLegend = require('../SatisfactionMeterLegend/SatisfactionMeterLegend');
const { useSatisfactionMeter } = require('../../common/useSatisfactionMeter');
const useTranslate = require('stremio/common/useTranslate');
const styles = require('./styles.less');

const BoardStatsSection = ({ metaRows = [] }) => {
    const t = useTranslate();
    const averageRating = useMemo(() => {
        if (!metaRows || metaRows.length === 0) {
            return null;
        }

        // Flatten all meta items from all ready rows (content is nested: row.content.content)
        const allMetaItems = metaRows.flatMap((row) => {
            if (row.content && row.content.type === 'Ready' && Array.isArray(row.content.content)) {
                return row.content.content;
            }
            return [];
        });

        // Filter items with vote_average
        const ratedItems = allMetaItems.filter((item) => typeof item.vote_average === 'number' && !isNaN(item.vote_average));

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
                    <h2 className={styles.heading}>{t('How\'s the vibe?')}</h2>
                    <SatisfactionMeterBar tier={tier} size="global" animated={true} />
                </div>
                <SatisfactionMeterLegend />
            </div>
        </div>
    );
};

module.exports = BoardStatsSection;

BoardStatsSection.propTypes = {
    metaRows: PropTypes.array,
};

/**
 * Satisfaction Meter Legend Component
 * Displays all 5 satisfaction tiers with emoji, name, and range
 */

const React = require('react');
const useTranslate = require('stremio/common/useTranslate');
const { SATISFACTION_TIERS } = require('../../common/useSatisfactionMeter');
const styles = require('./styles.less');

const SatisfactionMeterLegend = () => {
    const t = useTranslate();
    return (
        <div className={styles.legend}>
            <div className={styles.title}>{t('Satisfaction Ratings')}</div>
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

module.exports = SatisfactionMeterLegend;

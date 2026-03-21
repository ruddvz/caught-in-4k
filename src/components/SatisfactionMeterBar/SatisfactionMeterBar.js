/**
 * Satisfaction Meter Bar Component
 * Displays a colored gradient bar with tier emoji, percentage, and oneLiner
 * Supports 3 sizes: global (board), card (3px strip), detail (full bar in panel)
 */

const React = require('react');
const { useState } = React;
const PropTypes = require('prop-types');
const styles = require('./styles.less');

const SatisfactionMeterBar = ({ tier, size = 'detail', animated = false }) => {
    const [showLabel, setShowLabel] = useState(false);

    if (!tier) {
        return null;
    }

    const sizeClass = {
        global: styles.global,
        card: styles.card,
        detail: styles.detail,
    }[size] || styles.detail;

    const animatedClass = animated ? styles.shimmer : '';

    const barStyle = {
        background: `linear-gradient(90deg, ${tier.gradientStart} 0%, ${tier.gradientEnd} 100%)`,
        width: `${tier.percentage}%`,
    };

    return (
        <div
            className={`${styles.container} ${sizeClass} ${animatedClass}`}
            onMouseEnter={() => setShowLabel(true)}
            onMouseLeave={() => setShowLabel(false)}
        >
            <div className={styles.track}>
                <div className={styles.bar} style={barStyle} />
            </div>

            {size === 'detail' && (
                <div className={styles.detailContent}>
                    <span className={styles.percentage}>{tier.percentage}%</span>
                    <span className={styles.tierInfo}>
                        {tier.emoji} {tier.name}
                    </span>
                    <span className={styles.oneLiner}>{tier.oneLiner}</span>
                </div>
            )}

            {size === 'card' && showLabel && (
                <div className={styles.cardLabel}>
                    <span>{tier.emoji}</span>
                    <span>{tier.name}</span>
                </div>
            )}

            {size === 'global' && (
                <div className={styles.globalContent}>
                    <span className={styles.percentage}>{tier.percentage}%</span>
                    <span className={styles.tierInfo}>{tier.emoji} {tier.name}</span>
                </div>
            )}
        </div>
    );
};

module.exports = SatisfactionMeterBar;

SatisfactionMeterBar.propTypes = {
    tier: PropTypes.shape({
        gradientStart: PropTypes.string,
        gradientEnd: PropTypes.string,
        percentage: PropTypes.number,
        emoji: PropTypes.string,
        name: PropTypes.string,
        oneLiner: PropTypes.string,
    }),
    size: PropTypes.string,
    animated: PropTypes.bool,
};

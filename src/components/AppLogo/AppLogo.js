/**
 * App Logo Component
 * Neon-style "Caught in 4K" branding with cyberpunk aesthetic
 * Bright cyan text with neon pink accent diamond and glowing effects
 */

const React = require('react');
const PropTypes = require('prop-types');
const useTranslate = require('stremio/common/useTranslate');
const styles = require('./styles.less');

const AppLogo = ({ variant = 'full', className = '' }) => {
    const t = useTranslate();
    return (
        <div className={`${styles.logoContainer} ${className}`}>
            <div className={styles.logoText}>
                <span className={styles.highlightNeon}>◆</span>
                <span className={styles.wordmarkNeon}>{t('Caught in 4K')}</span>
            </div>
            {variant === 'full' && (
                <div className={styles.taglineNeon}>{t('watch in 4K')}</div>
            )}
        </div>
    );
};

AppLogo.propTypes = {
    variant: PropTypes.oneOf(['compact', 'full']),
    className: PropTypes.string,
};

module.exports = AppLogo;

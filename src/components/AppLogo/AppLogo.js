const React = require('react');
const PropTypes = require('prop-types');
const useTranslate = require('stremio/common/useTranslate');
const styles = require('./styles.less');

const logoSrc = require('/assets/images/logo1.png');

const AppLogo = ({ variant = 'full', className = '' }) => {
    const t = useTranslate();

    return (
        <div className={`${styles.logoContainer} ${className}`}>
            <img
                className={`${styles.logoImage} ${variant === 'compact' ? styles.compact : styles.full}`}
                src={logoSrc}
                alt={t.string('Caught in 4K')}
            />
            {variant === 'full' ? (
                <div className={styles.tagline}>{t.string('Caught in 4K')}</div>
            ) : null}
        </div>
    );
};

AppLogo.propTypes = {
    variant: PropTypes.oneOf(['compact', 'full']),
    className: PropTypes.string,
};

module.exports = AppLogo;

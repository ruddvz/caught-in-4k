/**
 * App Logo Component
 * Text-based "Caught in 4K" branding with green wordmark and gold diamond
 * Styled to look premium like Apple TV
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.less';

const AppLogo = ({ variant = 'full', className = '' }) => {
  return (
    <div className={`${styles.logoContainer} ${className}`}>
      <div className={styles.logoText}>
        <span className={styles.highlight}>◆</span>
        <span className={styles.wordmark}>Caught in 4K</span>
      </div>
      {variant === 'full' && (
        <div className={styles.tagline}>we see you. we see what you watch.</div>
      )}
    </div>
  );
};

AppLogo.propTypes = {
  variant: PropTypes.oneOf(['compact', 'full']),
  className: PropTypes.string,
};

export default AppLogo;

/**
 * App Logo Component
 * Neon-style "Caught in 4K" branding with cyberpunk aesthetic
 * Bright cyan text with neon pink accent diamond and glowing effects
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.less';

const AppLogo = ({ variant = 'full', className = '' }) => {
  return (
    <div className={`${styles.logoContainer} ${className}`}>
      <div className={styles.logoText}>
        <span className={styles.highlightNeon}>◆</span>
        <span className={styles.wordmarkNeon}>Caught in 4K</span>
      </div>
      {variant === 'full' && (
        <div className={styles.taglineNeon}>watch in 4K</div>
      )}
    </div>
  );
};

AppLogo.propTypes = {
  variant: PropTypes.oneOf(['compact', 'full']),
  className: PropTypes.string,
};

export default AppLogo;

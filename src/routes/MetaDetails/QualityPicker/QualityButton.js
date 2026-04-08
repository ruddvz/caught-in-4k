// Copyright (C) 2024 Caught In 4K

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const styles = require('./styles');

const TIER_LABELS = {
    '4k': '4K',
    '2k': '2K',
    '1080p': '1080p',
    '720p': '720p',
    'custom': 'Custom',
};

const QualityButton = ({ tier, status, candidateCount, onClick, className }) => {
    const isCustom = tier === 'custom';
    const isAvailable = status === 'available' || isCustom;
    const isLoading = status === 'loading';
    const isUnavailable = status === 'unavailable';

    const buttonClass = classnames(
        styles['quality-button'],
        {
            [styles['quality-button-available']]: isAvailable && !isCustom,
            [styles['quality-button-loading']]: isLoading,
            [styles['quality-button-unavailable']]: isUnavailable,
            [styles['custom-button']]: isCustom,
        },
        className
    );

    const countText = isCustom
        ? 'Browse all streams'
        : candidateCount > 0
            ? `${candidateCount} source${candidateCount !== 1 ? 's' : ''}`
            : 'No sources';

    return (
        <Button
            className={buttonClass}
            onClick={onClick}
            disabled={isUnavailable}
        >
            <div className={styles['quality-label']}>
                {TIER_LABELS[tier] || tier}
            </div>
            <div className={styles['quality-count']}>
                {isLoading ? 'Scanning...' : countText}
            </div>
        </Button>
    );
};

QualityButton.propTypes = {
    tier: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['available', 'loading', 'unavailable']).isRequired,
    candidateCount: PropTypes.number,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

module.exports = QualityButton;

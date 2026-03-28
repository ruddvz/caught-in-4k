// Copyright (C) 2017-2024 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const styles = require('./styles');

const TIERS = [
    { min: 0,  max: 39,  name: 'Certified Flop', color: '#ff3b30' },
    { min: 40, max: 59,  name: 'Mid at Best',     color: '#ff9f0a' },
    { min: 60, max: 74,  name: 'Worth a Watch',   color: '#ffd60a' },
    { min: 75, max: 89,  name: 'Slaps Hard',      color: '#30d158' },
    { min: 90, max: 100, name: 'Absolute Cinema', color: '#00f0ff' },
];

function getTier(score) {
    return TIERS.find((t) => score >= t.min && score <= t.max) || TIERS[0];
}

const ARC_LENGTH = Math.PI * 80; // π × r = ~251.3

const SatisfactionMeterDial = ({ score, imdbRaw, rtScore, mcScore }) => {
    if (score === null || score === undefined || isNaN(score)) return null;

    const tier = getTier(score);
    const dashOffset = ARC_LENGTH - (score / 100) * ARC_LENGTH;

    // Needle endpoint: angle 180° at score 0, 0° at score 100
    const angleRad = (Math.PI * (100 - score)) / 100;
    const needleX = 100 + 70 * Math.cos(angleRad);
    const needleY = 100 - 70 * Math.sin(angleRad);

    return (
        <div className={styles['dialContainer']}>
            <svg
                key={score}
                viewBox="0 0 200 110"
                width="100%"
                style={{ maxWidth: '280px' }}
                aria-label={`Satisfaction meter: ${score} — ${tier.name}`}
            >
                {/* Track arc */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {/* Fill arc */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={tier.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={ARC_LENGTH}
                    strokeDashoffset={dashOffset}
                    className={styles['fillArc']}
                />
                {/* Needle */}
                <line
                    x1="100"
                    y1="100"
                    x2={needleX}
                    y2={needleY}
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={styles['needle']}
                />
                {/* Pivot circle */}
                <circle cx="100" cy="100" r="4" fill="white" />
                {/* Score number */}
                <text
                    x="100"
                    y="88"
                    fontSize="32"
                    fontWeight="800"
                    textAnchor="middle"
                    fill="white"
                >
                    {score}
                </text>
                {/* Tier name */}
                <text
                    x="100"
                    y="104"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    fill={tier.color}
                    className={styles['tierLabel']}
                >
                    {tier.name.toUpperCase()}
                </text>
            </svg>
            <div className={styles['badges']}>
                <span className={styles['badge']}>⭐ {imdbRaw ?? '–'} IMDb</span>
                <span className={styles['badge']}>🍅 {rtScore !== null && rtScore !== undefined ? `${rtScore}%` : '–'} RT</span>
                <span className={styles['badge']}>Ⓜ {mcScore !== null && mcScore !== undefined ? mcScore : '–'} MC</span>
            </div>
        </div>
    );
};

SatisfactionMeterDial.propTypes = {
    score: PropTypes.number,
    imdbRaw: PropTypes.string,
    rtScore: PropTypes.number,
    mcScore: PropTypes.number,
};

module.exports = SatisfactionMeterDial;

/**
 * Canon Take Box Component
 * Displays AI-generated summaries with green accent badge
 * Shows skeleton loader while fetching
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useCanonTakes } from '../../common/useCanonTakes';
const useTranslate = require('stremio/common/useTranslate');
import styles from './styles.less';

const CanonTakeBox = ({ title, year, genres, voteAverage }) => {
    const { fetchCanonTake, getCached } = useCanonTakes();
    const t = useTranslate();
    const [canonTake, setCanonTake] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!title || !year) return;

        // Check cache first
        const cached = getCached(title, year);
        if (cached) {
            setCanonTake(cached.canonTake);
            return;
        }

        // Fetch from API
        setIsLoading(true);
        fetchCanonTake(title, year, genres || '', voteAverage || 0)
            .then((result) => {
                setCanonTake(result);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [title, year, genres, voteAverage, getCached, fetchCanonTake]);

    if (!canonTake && !isLoading) {
        return null; // Don't show if no content and not loading
    }

    return (
        <div className={styles.canonTakeBox}>
            <div className={styles.header}>
                <span className={styles.badge}>{t('✦ canon take')}</span>
            </div>

            {isLoading ? (
                <div className={styles.skeleton}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} style={{ width: '70%' }} />
                </div>
            ) : (
                <div className={styles.content}>{canonTake}</div>
            )}
        </div>
    );
};

export default CanonTakeBox;

CanonTakeBox.propTypes = {
    title: PropTypes.string,
    year: PropTypes.number,
    genres: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    voteAverage: PropTypes.number,
};

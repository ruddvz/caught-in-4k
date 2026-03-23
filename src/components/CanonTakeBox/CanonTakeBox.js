const React = require('react');
const { useState, useEffect } = React;
const styles = require('./styles.less');

const CACHE_PREFIX = 'c4k_canon_take_';

const getCached = (title, year) => {
    try {
        const key = `${CACHE_PREFIX}${title}_${year}`;
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (_e) {
        return null;
    }
};

const CanonTakeBox = ({ title, year, takeOverride }) => {
    const [canonTake, setCanonTake] = useState(null);

    useEffect(() => {
        if (takeOverride) {
            setCanonTake(takeOverride);
            return;
        }
        if (!title) return;
        const cached = getCached(title, year);
        if (cached && cached.canonTake) {
            setCanonTake(cached.canonTake);
        }
    }, [title, year, takeOverride]);

    // Skeleton/loading state when no cached take yet
    const renderSkeleton = () => (
        <div className={styles.skeleton}>
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
            <div className={styles.skeletonLine} style={{ width: '50%' }} />
        </div>
    );

    return (
        <div className={styles.canonTakeBox}>
            <div className={styles.header}>
                <span className={styles.badge}>{'✦ canon take'}</span>
                {title && (
                    <span className={styles.subtle}>
                        {title} {year ? `(${year})` : ''}
                    </span>
                )}
            </div>
            <div className={styles.content}>
                {canonTake ? (
                    <React.Fragment>
                        <span className={styles.quoteMark}>{'"'}</span>
                        {canonTake}
                        <span className={styles.quoteMark}>{'"'}</span>
                    </React.Fragment>
                ) : (
                    renderSkeleton()
                )}
            </div>
        </div>
    );
};

module.exports = CanonTakeBox;

const React = require('react');
const styles = require('./styles.less');

const CanonTakeBox = () => {
    // Design-only placeholder copy; no external data or translations required.
    const canonTake = 'An absolute cinematic masterpiece. The vibes are immaculate and the plot actually makes sense — certified fresh, fr fr.';

    return (
        <div className={styles.canonTakeBox}>
            <div className={styles.header}>
                <span className={styles.badge}>✦ canon take</span>
                <span className={styles.subtle}>Gen Z summary preview</span>
            </div>
            <div className={styles.content}>{canonTake}</div>
        </div>
    );
};

module.exports = CanonTakeBox;
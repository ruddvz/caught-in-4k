const React = require('react');
const useTranslate = require('stremio/common/useTranslate');
const styles = require('./styles.less');

const CanonTakeBox = () => {
    // useTranslate returns an object with helpers; grab the string translator
    const { string: t } = useTranslate();
    const canonTake = 'an absolute cinematic masterpiece. the vibes are immaculate and the plot actually makes sense. certified fresh fr fr.';
    return (
        <div className={styles.canonTakeBox}>
            <div className={styles.header}>
                <span className={styles.badge}>{t('✦ canon take')}</span>
            </div>
            <div className={styles.content}>{canonTake}</div>
        </div>
    );
};

module.exports = CanonTakeBox;
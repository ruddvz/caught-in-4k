// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Button } = require('stremio/components');
const CONSTANTS = require('stremio/common/CONSTANTS');
const useInViewport = require('stremio/common/useInViewport');
const styles = require('./styles');

const MetaRowPlaceholder = ({ className, title, deepLinks, catalog, index = 0 }) => {
    const { t } = useTranslation();
    const ref = React.useRef(null);
    const isVisible = useInViewport(ref);

    const posterShape = React.useMemo(() => {
        return catalog?.content?.posterShape ?? catalog?.posterShape ?? 'poster';
    }, [catalog]);

    return (
        <div ref={ref} className={classnames(className, styles['meta-row-placeholder-container'], { [styles['visible']]: isVisible })} style={{ '--row-index': index }}>
            <div className={styles['header-container']}>
                <div className={styles['title-container']} title={typeof title === 'string' && title.length > 0 ? title : null}>
                    {typeof title === 'string' && title.length > 0 ? title : null}
                </div>
                {
                    deepLinks && typeof deepLinks.discover === 'string' ?
                        <Button className={styles['see-all-container']} title={t('BUTTON_SEE_ALL')} href={deepLinks.discover} tabIndex={-1}>
                            <div className={styles['label']}>{ t('BUTTON_SEE_ALL') }</div>
                            <Icon className={styles['icon']} name={'chevron-forward'} />
                        </Button>
                        :
                        null
                }
            </div>
            <div className={styles['meta-items-container']}>
                {Array(CONSTANTS.CATALOG_PREVIEW_SIZE).fill(null).map((_, index) => (
                    <div key={index} className={classnames(styles['meta-item'], styles[`poster-shape-${posterShape}`])}>
                        <div className={classnames(styles['poster-container'], styles['skeleton-shimmer'])} />
                        <div className={styles['title-bar-container']}>
                            <div className={classnames(styles['title-label'], styles['skeleton-shimmer'])} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

MetaRowPlaceholder.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    deepLinks: PropTypes.shape({
        discover: PropTypes.string
    }),
    catalog: PropTypes.object
};

module.exports = MetaRowPlaceholder;

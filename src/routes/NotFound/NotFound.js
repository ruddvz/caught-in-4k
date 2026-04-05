// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const { HorizontalNavBar } = require('stremio/components');
const { Glitchy404 } = require('@/components/ui/glitchy-404-1');
const styles = require('./styles');

const NotFound = () => {
    const { t } = useTranslation();
    return (
        <div className={styles['not-found-container']}>
            <HorizontalNavBar
                className={styles['nav-bar']}
                title={t('PAGE_NOT_FOUND')}
                backButton={true}
                fullscreenButton={true}
                navMenu={true}
            />
            <div className={styles['not-found-content']}>
                <Glitchy404 width={800} height={232} color="#ffffff" />
            </div>
        </div>
    );
};

module.exports = NotFound;

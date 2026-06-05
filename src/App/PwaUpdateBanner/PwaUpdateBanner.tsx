// Copyright (C) 2017-2023 Smart code 203358507

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@stremio/stremio-icons/react';
import { useBinaryState } from 'stremio/common';
import { Button } from 'stremio/components';
import styles from './PwaUpdateBanner.less';

type Props = {
    className?: string,
};

const PwaUpdateBanner = ({ className }: Props) => {
    const { t } = useTranslation();
    const [visible, show, hide] = useBinaryState(false);

    useEffect(() => {
        const onUpdateReady = () => show();
        window.addEventListener('c4k-sw-update-ready', onUpdateReady);
        return () => window.removeEventListener('c4k-sw-update-ready', onUpdateReady);
    }, [show]);

    const onRefresh = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
            registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
        });
        window.location.reload();
    };

    if (!visible) {
        return null;
    }

    return (
        <div className={className}>
            <div className={styles['update-banner']} role="status">
                <span className={styles['label']}>
                    {t('C4K_UPDATE_READY', 'A new version of C4K is ready.')}
                </span>
                <Button className={styles['button']} onClick={onRefresh}>
                    {t('C4K_UPDATE_REFRESH', 'Update')}
                </Button>
                <Button className={styles['close']} onClick={hide} title={t('CLOSE', 'Close')}>
                    <Icon className={styles['icon']} name="close" />
                </Button>
            </div>
        </div>
    );
};

export default PwaUpdateBanner;

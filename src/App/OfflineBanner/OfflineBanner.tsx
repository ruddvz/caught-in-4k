// Copyright (C) 2017-2023 Smart code 203358507

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OfflineBanner.less';

const OfflineBanner = () => {
    const { t } = useTranslation();
    return (
        <div className={styles['offline-banner']} role="status" aria-live="polite">
            {t('C4K_OFFLINE_MESSAGE', 'You are offline. Library and cached pages may still be available.')}
        </div>
    );
};

export default OfflineBanner;

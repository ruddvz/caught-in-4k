// Copyright (C) 2017-2023 Smart code 203358507

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'stremio/components';
import styles from './PwaInstallBanner.less';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Props = {
    className?: string,
};

const DISMISS_KEY = 'c4k_pwa_install_dismissed';

const PwaInstallBanner = ({ className }: Props) => {
    const { t } = useTranslation();
    const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(display-mode: standalone)').matches) {
            return undefined;
        }
        try {
            if (localStorage.getItem(DISMISS_KEY) === '1') {
                return undefined;
            }
        } catch (_error) {
            // ignore storage errors
        }

        const onBeforeInstall = (event: Event) => {
            event.preventDefault();
            deferredRef.current = event as BeforeInstallPromptEvent;
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    }, []);

    const onInstall = async () => {
        const prompt = deferredRef.current;
        if (!prompt) {
            return;
        }
        await prompt.prompt();
        await prompt.userChoice;
        setVisible(false);
        deferredRef.current = null;
    };

    const onDismiss = () => {
        try {
            localStorage.setItem(DISMISS_KEY, '1');
        } catch (_error) {
            // ignore storage errors
        }
        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <div className={className}>
            <div className={styles['install-banner']} role="region" aria-label={t('C4K_INSTALL_APP', 'Install app')}>
                <span className={styles['label']}>
                    {t('C4K_INSTALL_PROMPT', 'Install Caught in 4K for a full-screen app experience.')}
                </span>
                <Button className={styles['button']} onClick={onInstall}>
                    {t('C4K_INSTALL_ACTION', 'Install')}
                </Button>
                <Button className={styles['dismiss']} onClick={onDismiss} title={t('CLOSE', 'Close')}>
                    {t('CLOSE', 'Close')}
                </Button>
            </div>
        </div>
    );
};

export default PwaInstallBanner;

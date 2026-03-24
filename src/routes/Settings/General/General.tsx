import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Link } from '../components';
import styles from './General.less';

type Props = {
    profile: Profile,
};

const General = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { t } = useTranslation();

    const avatar = useMemo(() => (
        `url('${require('/assets/images/anonymous.png')}')`
    ), []);

    return (
        <div ref={ref} className={styles['account-widget']}>
            <div className={styles['account-header']}>
                <div className={styles['master-avatar']} style={{ backgroundImage: avatar }} />
                <div className={styles['user-details']}>
                    <div className={styles['display-name']}>
                        Stranger.
                    </div>
                    <Link 
                        label={`${t('LOG_IN')} / ${t('SIGN_UP')}`} 
                        href={'#/intro'} 
                        className={styles['login-link']} 
                    />
                </div>
            </div>
        </div>
    );
});

export default General;

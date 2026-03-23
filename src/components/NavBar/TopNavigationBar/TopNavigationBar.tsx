import React, { memo, useCallback } from 'react';
import classnames from 'classnames';
// @ts-ignore
import Icon from '@stremio/stremio-icons/react';
// @ts-ignore
import Button from 'stremio/components/Button';
// @ts-ignore
import AppLogo from 'stremio/components/AppLogo/AppLogo';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import styles from './styles.less';
import useFullscreen from '../../../common/useFullscreen';


type Props = {
    className?: string;
    route?: string;
    query?: string;
    tabs: { id: string; label: string; icon: string; href: string }[];
};

const TopNavigationBar = memo(({ className, route, query, tabs }: Props) => {
    const { t } = useTranslation();
    const [fullscreen, , , toggleFullscreen] = useFullscreen() as [boolean, unknown, unknown, () => void];

    const onFullscreenClick = React.useCallback(() => {
        toggleFullscreen();
    }, [toggleFullscreen]);

    const onSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        const currentUrl = new URL(window.location.href);
        if (query.length > 0) {
            currentUrl.hash = `#/search?search=${encodeURIComponent(query)}`;
        } else {
            currentUrl.hash = '#/search';
        }
        window.location.hash = currentUrl.hash;
    }, []);

    const [currentProfile, setCurrentProfile] = React.useState<any>(null);

    React.useEffect(() => {
        const stored = localStorage.getItem('c4k_current_profile');
        if (stored) {
            try {
                setCurrentProfile(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const avatars = [
        require('../../../assets/images/avatars/abstract-avatar-1-circle-x3ecvpg9e9e3jtdw7ny2xs.png'),
        require('../../../assets/images/avatars/abstract-avatar-2-circle-rfv7tepq8onk3cwh4hta4d.png'),
        require('../../../assets/images/avatars/abstract-avatar-3-circle-0yg49l6kn99g7py9q5r7gj.png'),
        require('../../../assets/images/avatars/abstract-avatar-4-circle-nb6qd1yx1gas0k26aq3jrf.png'),
        require('../../../assets/images/avatars/abstract-avatar-5-circle-u6e0p97idsipndksw2lcaq.png'),
        require('../../../assets/images/avatars/abstract-avatar-6-circle-9xlbldchfaeckxehv4tjpk.png'),
        require('../../../assets/images/avatars/abstract-avatar-7-circle-76pjyw5fm6gdvqjgyuort.png'),
        require('../../../assets/images/avatars/abstract-avatar-8-circle-83i2c7b13kbvq9x6crxf.png'),
        require('../../../assets/images/avatars/abstract-avatar-9-circle-bugfxnw039lgvn25kqzo4c.png'),
        require('../../../assets/images/avatars/abstract-avatar-10-circle-lrsrjd2txm8mkkolw7902.png'),
        require('../../../assets/images/avatars/abstract-avatar-11-circle-7apdsvuf90sqtke9ybhz3.png'),
        require('../../../assets/images/avatars/abstract-avatar-12-circle-k7p9le9zztnhp0wfjxzcpl.png'),
        require('../../../assets/images/avatars/abstract-avatar-13-circle-xwe9z0rcnakp9ehxtqpqp.png'),
        require('../../../assets/images/avatars/abstract-avatar-14-circle-iflsbo952sl97g9h1c8uqb.png'),
        require('../../../assets/images/avatars/abstract-avatar-15-circle-lges9w2kuam0yxwl9s51ixd.png'),
        require('../../../assets/images/avatars/abstract-avatar-16-circle-dcwuud5dq7kw3o25bu1qz8.png')
    ];

    return (
        <nav className={classnames(className, styles['top-nav-bar-container'])}>
            <div className={styles['left-section']}>
                <a href="#/" className={styles['logo-wrapper']}>
                    <AppLogo variant="compact" className={styles['logo']} />
                </a>
            </div>
            
            <div className={styles['center-section']}>
                {route === 'search' ? (
                    <div className={styles['search-input-wrapper']}>
                        <Icon name="search" className={styles['search-icon']} />
                        <input
                            autoFocus
                            className={styles['search-input']}
                            placeholder={t('SEARCH')}
                            defaultValue={query}
                            onChange={onSearchChange}
                        />
                    </div>
                ) : (
                    <div className={styles['nav-pill-wrapper']}>
                        <div className={styles['nav-pill']}>
                            {tabs.map((tab) => (
                                <Button 
                                    key={tab.id}
                                    href={tab.href}
                                    className={classnames(styles['nav-tab'], { [styles['active']]: route === tab.id })}
                                >
                                    <Icon name={tab.icon} className={styles['tab-icon']} />
                                    <span className={styles['tab-label']}>{t(tab.label.toUpperCase())}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className={styles['right-section']}>
                <Button 
                    className={classnames(styles['action-btn'], styles['fullscreen-btn'])} 
                    onClick={onFullscreenClick}
                    title={t(fullscreen ? 'EXIT_FULLSCREEN' : 'ENTER_FULLSCREEN')}
                >
                    <Icon name={fullscreen ? 'minimize' : 'maximize'} className={styles['icon']} />
                </Button>
                <Button className={classnames(styles['action-btn'], styles['profile-btn'])} href="#/profiles">
                    {currentProfile ? (
                        <div 
                            className={styles['profile-avatar']} 
                            style={{ backgroundImage: `url(${avatars[currentProfile.avatarIndex]})` }} 
                        />
                    ) : (
                        <Icon name="person-outline" className={styles['icon']} />
                    )}
                </Button>
            </div>
        </nav>
    );
});

TopNavigationBar.displayName = 'TopNavigationBar';

export default TopNavigationBar;


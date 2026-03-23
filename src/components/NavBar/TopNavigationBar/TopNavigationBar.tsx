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
// @ts-ignore
import NavMenu from '../HorizontalNavBar/NavMenu';
import useFullscreen from '../../../common/useFullscreen';

const profileSrc = require('/assets/images/profile_placeholder.png');
const zoomSrc = require('/assets/images/zoom_icon.png');

type Props = {
    className?: string;
    route?: string;
    tabs: { id: string; label: string; icon: string; href: string }[];
};

const TopNavigationBar = memo(({ className, route, tabs }: Props) => {
    const { t } = useTranslation();
    const [fullscreen, , , toggleFullscreen] = useFullscreen() as [boolean, unknown, unknown, () => void];

    const onFullscreenClick = useCallback(() => {
        toggleFullscreen();
    }, [toggleFullscreen]);

    return (
        <nav className={classnames(className, styles['top-nav-bar-container'])}>
            <div className={styles['left-section']}>
                <div className={styles['logo-wrapper']}>
                    <AppLogo variant="compact" className={styles['logo']} />
                </div>
            </div>
            
            <div className={styles['center-section']}>
                <div className={styles['nav-pill-wrapper']}>
                    <div className={styles['nav-pill']}>
                        {tabs && tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                className={classnames(styles['nav-tab'], { [styles['active']]: route === tab.id })}
                                href={tab.href}
                            >
                                <Icon name={tab.icon} className={styles['tab-icon']} />
                                <span className={styles['tab-label']}>{t(tab.label)}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={styles['right-section']}>
                <Button 
                    className={classnames(styles['action-btn'], styles['fullscreen-btn'])} 
                    onClick={onFullscreenClick}
                    title={t(fullscreen ? 'EXIT_FULLSCREEN' : 'ENTER_FULLSCREEN')}
                >
                    <img src={zoomSrc} alt="Zoom" className={styles['zoom-img']} />
                </Button>
                
                <NavMenu renderLabel={({ onClick }: { onClick: () => void }) => (
                    <Button className={styles['profile-btn']} onClick={onClick}>
                        <img src={profileSrc} alt="Profile" className={styles['profile-img']} />
                    </Button>
                )} />
            </div>
        </nav>
    );
});

TopNavigationBar.displayName = 'TopNavigationBar';

export default TopNavigationBar;


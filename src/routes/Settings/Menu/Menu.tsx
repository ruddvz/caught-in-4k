import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useServices } from 'stremio/services';
import { Button } from 'stremio/components';
import { SECTIONS } from '../constants';
import { usePlatform } from 'stremio/common';
import styles from './Menu.less';

type Props = {
    selected: string | null,
    streamingServer: StreamingServer,
    onSelect: (sectionId: string) => void,
};

const NAV_ITEMS = [
    { id: SECTIONS.GENERAL, labelKey: 'SETTINGS_NAV_GENERAL', icon: 'person' },
    { id: SECTIONS.INTERFACE, labelKey: 'INTERFACE', icon: 'settings' },
    { id: SECTIONS.PLAYER, labelKey: 'SETTINGS_NAV_PLAYER', icon: 'play' },
    { id: SECTIONS.STREAMING, labelKey: 'SETTINGS_NAV_STREAMING', icon: 'cloud' },
];

const Menu = ({ selected, streamingServer, onSelect }: Props) => {
    const { t } = useTranslation();

    const handleTabClick = useCallback((sectionId: string) => {
        onSelect(sectionId);
    }, [onSelect]);

    return (
        <div className={styles['menu']}>
            <div className={styles['nav-pill']}>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={classNames(styles['nav-tab'], {
                            [styles['active']]: selected === item.id,
                        })}
                        onClick={() => handleTabClick(item.id)}
                    >
                        <span className={styles['tab-label']}>{t(item.labelKey)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Menu;

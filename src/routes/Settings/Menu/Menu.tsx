import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useServices } from 'stremio/services';
import { Button } from 'stremio/components';
import { SECTIONS } from '../constants';
import { usePlatform } from 'stremio/common';
import styles from './Menu.less';

type Props = {
    selected: string,
    streamingServer: StreamingServer,
    onSelect: (event: React.MouseEvent<HTMLDivElement>) => void,
};

const MENU_ITEMS = [
    { id: 'GENERAL',    labelKey: 'SETTINGS_NAV_GENERAL' },
    { id: 'INTERFACE',  labelKey: 'INTERFACE' },
    { id: 'PLAYER',     labelKey: 'SETTINGS_NAV_PLAYER' },
    { id: 'STREAMING',  labelKey: 'SETTINGS_NAV_STREAMING' },
    { id: 'SHORTCUTS',  labelKey: 'SETTINGS_NAV_SHORTCUTS', mobileHide: true },
];

const Menu = ({ selected, streamingServer, onSelect }: Props) => {
    const { t } = useTranslation();
    const { shell } = useServices();
    const platform = usePlatform();

    const settings = useMemo(() => (
        streamingServer?.settings?.type === 'Ready' ?
            streamingServer.settings.content as StreamingServerSettings : null
    ), [streamingServer?.settings]);

    return (
        <div className={styles['menu']}>
            {MENU_ITEMS.map((item) => {
                if (item.mobileHide && platform.isMobile) return null;
                return (
                    <Button
                        key={item.id}
                        className={classNames(styles['button'], { [styles['selected']]: selected === (SECTIONS as any)[item.id] })}
                        title={t(item.labelKey)}
                        data-section={(SECTIONS as any)[item.id]}
                        onClick={onSelect}
                    >
                        {t(item.labelKey)}
                    </Button>
                );
            })}

            <div className={styles['spacing']} />

            <div className={styles['version-info-label']} title={process.env.VERSION}>
                {t('SETTINGS_APP_VERSION')}: {process.env.VERSION}
            </div>
            <div className={styles['version-info-label']} title={process.env.COMMIT_HASH}>
                {t('SETTINGS_BUILD_VERSION')}: {process.env.COMMIT_HASH}
            </div>
            {
                settings?.serverVersion &&
                    <div className={styles['version-info-label']} title={settings.serverVersion}>
                        {t('SETTINGS_SERVER_VERSION')}: {settings.serverVersion}
                    </div>
            }
            {
                typeof shell?.transport?.props?.shellVersion === 'string' &&
                    <div className={styles['version-info-label']} title={shell.transport.props.shellVersion}>
                        {t('SETTINGS_SHELL_VERSION')}: {shell.transport.props.shellVersion}
                    </div>
            }
        </div>
    );
};

export default Menu;

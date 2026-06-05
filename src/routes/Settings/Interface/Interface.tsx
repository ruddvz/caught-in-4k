import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from 'stremio/services';
import { Toggle } from 'stremio/components';
import { Option } from '../components';
import useInterfaceOptions from './useInterfaceOptions';
import useC4KSettings from 'stremio/common/useC4KSettings';
import styles from './Interface.less';

type Props = {
    profile: Profile,
};

const Interface = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { t } = useTranslation();
    const { shell } = useServices();

    const {
        quitOnCloseToggle,
        escExitFullscreenToggle,
        hideSpoilersToggle,
    } = useInterfaceOptions(profile);
    const [c4kSettings, updateC4kSetting] = useC4KSettings();

    const gamepadToggle = {
        checked: c4kSettings.gamepadNavigation !== false,
        onClick: () => updateC4kSetting('gamepadNavigation', c4kSettings.gamepadNavigation === false),
    };

    return (
        <div ref={ref} className={styles['interface-widget']}>
            <div className={styles['widget-label']}>{t('SETTINGS_INTERFACE_SYSTEM')}</div>

            <div className={styles['options-stack']}>
                <Option label={'SETTINGS_BLUR_UNWATCHED_IMAGE'}>
                    <Toggle tabIndex={-1} {...hideSpoilersToggle} />
                </Option>

                {shell.active && (
                    <Option label={'SETTINGS_QUIT_ON_CLOSE'}>
                        <Toggle tabIndex={-1} {...quitOnCloseToggle} />
                    </Option>
                )}

                {shell.active && (
                    <Option label={'SETTINGS_FULLSCREEN_EXIT'}>
                        <Toggle tabIndex={-1} {...escExitFullscreenToggle} />
                    </Option>
                )}

                <Option label={'C4K_GAMEPAD_NAVIGATION'}>
                    <Toggle tabIndex={-1} {...gamepadToggle} />
                </Option>
            </div>
        </div>
    );
});

export default Interface;


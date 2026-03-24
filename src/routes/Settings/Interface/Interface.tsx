import React, { forwardRef } from 'react';
import { useServices } from 'stremio/services';
import { Toggle } from 'stremio/components';
import { Section, Option } from '../components';
import useInterfaceOptions from './useInterfaceOptions';
import styles from './Interface.less';

type Props = {
    profile: Profile,
};

const Interface = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { shell } = useServices();

    const {
        quitOnCloseToggle,
        escExitFullscreenToggle,
        hideSpoilersToggle,
    } = useInterfaceOptions(profile);

    return (
        <div ref={ref} className={styles['interface-widget']}>
            <div className={styles['widget-label']}>INTERFACE & SYSTEM</div>

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
            </div>
        </div>
    );
});

export default Interface;


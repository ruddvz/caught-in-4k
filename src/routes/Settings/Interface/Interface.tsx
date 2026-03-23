import React, { forwardRef } from 'react';
import { useServices } from 'stremio/services';
import { Button, Toggle } from 'stremio/components';
import { usePlatform } from 'stremio/common';
import { Section, Option } from '../components';
import useInterfaceOptions from './useInterfaceOptions';
import styles from './Interface.less';

type Props = {
    profile: Profile,
};

const Interface = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { shell } = useServices();
    const platform = usePlatform();

    const {
        quitOnCloseToggle,
        escExitFullscreenToggle,
        hideSpoilersToggle,
    } = useInterfaceOptions(profile);

    return (
        <Section ref={ref} label={'INTERFACE'}>
            {
                shell.active &&
                    <Option label={'SETTINGS_QUIT_ON_CLOSE'}>
                        <Toggle
                            tabIndex={-1}
                            {...quitOnCloseToggle}
                        />
                    </Option>
            }
            {
                shell.active &&
                    <Option label={'SETTINGS_FULLSCREEN_EXIT'}>
                        <Toggle
                            tabIndex={-1}
                            {...escExitFullscreenToggle}
                        />
                    </Option>
            }
            <Option label={'SETTINGS_BLUR_UNWATCHED_IMAGE'}>
                <Toggle
                    tabIndex={-1}
                    {...hideSpoilersToggle}
                />
            </Option>
            {
                !platform.isMobile &&
                    <div className={styles['shortcuts-link']}>
                        <Button className={styles['shortcuts-button']} href={'#/settings/shortcuts'}>
                            <span className={styles['shortcuts-label']}>⌨ Keyboard Shortcuts</span>
                            <span className={styles['shortcuts-arrow']}>→</span>
                        </Button>
                    </div>
            }
        </Section>
    );
});

export default Interface;

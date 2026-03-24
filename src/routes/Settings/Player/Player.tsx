import React, { forwardRef } from 'react';
import { ColorInput, MultiselectMenu, Toggle } from 'stremio/components';
import { Category, Option } from '../components';
import { useServices } from 'stremio/services';
import usePlayerOptions from './usePlayerOptions';
import useInterfaceOptions from '../Interface/useInterfaceOptions';
import styles from './Player.less';

type Props = {
    profile: Profile,
};

const Player = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { shell } = useServices();
    const {
        subtitlesLanguageSelect,
        subtitlesSizeSelect,
        subtitlesTextColorInput,
        subtitlesBackgroundColorInput,
        subtitlesOutlineColorInput,
        playInExternalPlayerSelect,
        nextVideoPopupDurationSelect,
        bingeWatchingToggle,
        hardwareDecodingToggle,
    } = usePlayerOptions(profile);

    const { 
        hideSpoilersToggle,
        quitOnCloseToggle,
        escExitFullscreenToggle,
    } = useInterfaceOptions(profile);

    return (
        <div ref={ref} className={styles['player-dashboard']}>
            <div className={styles['engine-grid']}>

                {/* Column 1 — Subtitles & Visuals */}
                <div className={styles['col']}>
                    <Category icon={'subtitles'} label={'SUBTITLES'}>
                        <Option label={'Language'}>
                            <MultiselectMenu className={styles['multiselect']} {...subtitlesLanguageSelect} />
                        </Option>
                        <Option label={'Size'}>
                            <MultiselectMenu className={styles['multiselect']} {...subtitlesSizeSelect} />
                        </Option>
                        <Option label={'Color'}>
                            <ColorInput className={styles['color-input']} {...subtitlesTextColorInput} />
                        </Option>
                        <Option label={'Background'}>
                            <ColorInput className={styles['color-input']} {...subtitlesBackgroundColorInput} />
                        </Option>
                        <Option label={'Outline'}>
                            <ColorInput className={styles['color-input']} {...subtitlesOutlineColorInput} />
                        </Option>
                    </Category>

                    {/* System re-grouped under Visuals in Col 1 */}
                    <Category icon={'eye'} label={'SYSTEM'}>
                        <Option label={'Blur unwatched episodes image'}>
                            <Toggle tabIndex={-1} {...hideSpoilersToggle} />
                        </Option>
                        {shell.active && (
                            <Option label={'Quit on close'}>
                                <Toggle tabIndex={-1} {...quitOnCloseToggle} />
                            </Option>
                        )}
                        {shell.active && (
                            <Option label={'Exit Fullscreen (ESC)'}>
                                <Toggle tabIndex={-1} {...escExitFullscreenToggle} />
                            </Option>
                        )}
                    </Category>
                </div>

                {/* Column 2 — Automation & Advanced Logic */}
                <div className={styles['col']}>
                    <Category icon={'play'} label={'AUTOMATION'}>
                        <Option label={'Auto-play next episode'}>
                            <Toggle tabIndex={-1} {...bingeWatchingToggle} />
                        </Option>
                        <Option label={'Popup duration'}>
                            <MultiselectMenu className={styles['multiselect']} {...nextVideoPopupDurationSelect} />
                        </Option>
                    </Category>

                    <Category icon={'glasses'} label={'ADVANCED'}>
                        <Option label={'Hardware Acceleration'}>
                            <Toggle tabIndex={-1} {...hardwareDecodingToggle} />
                        </Option>
                        <Option label={'External Player'}>
                            <MultiselectMenu className={styles['multiselect']} {...playInExternalPlayerSelect} />
                        </Option>
                    </Category>
                </div>

            </div>
        </div>
    );
});

export default Player;

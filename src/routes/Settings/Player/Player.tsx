import React, { forwardRef } from 'react';
import { ColorInput, MultiselectMenu, Toggle } from 'stremio/components';
import { Category, Option } from '../components';
import usePlayerOptions from './usePlayerOptions';
import useInterfaceOptions from '../Interface/useInterfaceOptions';
import styles from './Player.less';

type Props = {
    profile: Profile,
};

const Player = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
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

    const { hideSpoilersToggle } = useInterfaceOptions(profile);

    return (
        <div ref={ref} className={styles['player-dashboard']}>
            <div className={styles['engine-grid']}>

                {/* Column 1 — Subtitle Settings (VIP centre) */}
                <div className={styles['col']}>
                    <Category icon={'subtitles'} label={'SETTINGS_SECTION_SUBTITLES'}>
                        <Option label={'SETTINGS_SUBTITLES_LANGUAGE'}>
                            <MultiselectMenu className={styles['multiselect']} {...subtitlesLanguageSelect} />
                        </Option>
                        <Option label={'SETTINGS_SUBTITLES_SIZE'}>
                            <MultiselectMenu className={styles['multiselect']} {...subtitlesSizeSelect} />
                        </Option>
                        <Option label={'SETTINGS_SUBTITLES_COLOR'}>
                            <ColorInput className={styles['color-input']} {...subtitlesTextColorInput} />
                        </Option>
                        <Option label={'SETTINGS_SUBTITLES_COLOR_BACKGROUND'}>
                            <ColorInput className={styles['color-input']} {...subtitlesBackgroundColorInput} />
                        </Option>
                        <Option label={'SETTINGS_SUBTITLES_COLOR_OUTLINE'}>
                            <ColorInput className={styles['color-input']} {...subtitlesOutlineColorInput} />
                        </Option>
                    </Category>
                </div>

                {/* Column 2 — Automation, Advanced, System Integration */}
                <div className={styles['col']}>
                    <Category icon={'play'} label={'SETTINGS_SECTION_AUTO_PLAY'}>
                        <Option label={'AUTO_PLAY'}>
                            <Toggle tabIndex={-1} {...bingeWatchingToggle} />
                        </Option>
                        <Option label={'SETTINGS_NEXT_VIDEO_POPUP_DURATION'}>
                            <MultiselectMenu className={styles['multiselect']} {...nextVideoPopupDurationSelect} />
                        </Option>
                    </Category>

                    <Category icon={'glasses'} label={'SETTINGS_SECTION_ADVANCED'}>
                        <Option label={'Hardware Acceleration'}>
                            <Toggle tabIndex={-1} {...hardwareDecodingToggle} />
                        </Option>
                        <Option label={'SETTINGS_PLAY_IN_EXTERNAL_PLAYER'}>
                            <MultiselectMenu className={styles['multiselect']} {...playInExternalPlayerSelect} />
                        </Option>
                    </Category>

                    {/* System Integration — fills remaining space at the bottom */}
                    <div className={styles['system-integration']}>
                        <Category icon={'eye'} label={'System'}>
                            <Option label={'SETTINGS_BLUR_UNWATCHED_IMAGE'}>
                                <Toggle tabIndex={-1} {...hideSpoilersToggle} />
                            </Option>
                        </Category>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default Player;

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
        audioLanguageSelect,
        surroundSoundToggle,
        seekTimeDurationSelect,
        seekShortTimeDurationSelect,
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

                {/* Column 2 — Audio, Automation, Advanced, System Integration */}
                <div className={styles['col']}>
                    <Category icon={'volume-medium'} label={'SETTINGS_SECTION_AUDIO'}>
                        <Option label={'SETTINGS_DEFAULT_AUDIO_TRACK'}>
                            <MultiselectMenu className={styles['multiselect']} {...audioLanguageSelect} />
                        </Option>
                        <Option label={'SETTINGS_SURROUND_SOUND'}>
                            <Toggle tabIndex={-1} {...surroundSoundToggle} />
                        </Option>
                        <Option label={'Seek Time'}>
                            <MultiselectMenu className={styles['multiselect']} {...seekTimeDurationSelect} />
                        </Option>
                        <Option label={'Secondary Seek'}>
                            <MultiselectMenu className={styles['multiselect']} {...seekShortTimeDurationSelect} />
                        </Option>
                    </Category>

                    <Category icon={'play'} label={'SETTINGS_SECTION_AUTO_PLAY'}>
                        <Option label={'AUTO_PLAY'}>
                            <Toggle tabIndex={-1} {...bingeWatchingToggle} />
                        </Option>
                        <Option label={'SETTINGS_NEXT_VIDEO_POPUP_DURATION'}>
                            <MultiselectMenu className={styles['multiselect']} {...nextVideoPopupDurationSelect} />
                        </Option>
                    </Category>

                    <Category icon={'glasses'} label={'SETTINGS_SECTION_ADVANCED'}>
                        <Option label={'SETTINGS_HARDWARE_DECODING'}>
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

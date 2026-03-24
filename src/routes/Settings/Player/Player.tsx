import React, { forwardRef } from 'react';
import { ColorInput, MultiselectMenu, Toggle } from 'stremio/components';
import { useServices } from 'stremio/services';
import { Category, Option } from '../components';
import usePlayerOptions from './usePlayerOptions';
import { usePlatform } from 'stremio/common';
import styles from './Player.less';

type Props = {
    profile: Profile,
};

const Player = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const platform = usePlatform();

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
    } = usePlayerOptions(profile);

    return (
        <div ref={ref} className={styles['player-dashboard']}>
            <div className={styles['giant-widget-grid']}>
                {/* Column 1: Subtitles */}
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

                {/* Column 2: Audio & Playback */}
                <div className={styles['col']}>
                    <Category icon={'volume-medium'} label={'SETTINGS_SECTION_AUDIO'}>
                        <Option label={'SETTINGS_DEFAULT_AUDIO_TRACK'}>
                            <MultiselectMenu className={styles['multiselect']} {...audioLanguageSelect} />
                        </Option>
                        <Option label={'SETTINGS_SURROUND_SOUND'}>
                            <Toggle tabIndex={-1} {...surroundSoundToggle} />
                        </Option>
                    </Category>
                    <Category icon={'remote'} label={'Seek Controls'}>
                        <Option label={'Seek Time'}>
                            <MultiselectMenu className={styles['multiselect']} {...seekTimeDurationSelect} />
                        </Option>
                        <Option label={'Secondary Seek'}>
                            <MultiselectMenu className={styles['multiselect']} {...seekShortTimeDurationSelect} />
                        </Option>
                    </Category>
                </div>

                {/* Column 3: Advanced & Auto-play */}
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
                        <Option label={'SETTINGS_PLAY_IN_EXTERNAL_PLAYER'}>
                            <MultiselectMenu className={styles['multiselect']} {...playInExternalPlayerSelect} />
                        </Option>
                    </Category>
                </div>
            </div>
        </div>
    );
});

export default Player;


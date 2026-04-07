import React, { forwardRef } from 'react';
import { MultiselectMenu, Toggle } from 'stremio/components';
import { Option } from '../components';
import { useServices } from 'stremio/services';
import usePlayerOptions from './usePlayerOptions';
import useInterfaceOptions from '../Interface/useInterfaceOptions';
import styles from './Player.less';

const FONT_COLOR_OPTIONS = [
    { value: '#ffffff', label: 'White' },
    { value: '#ffff00', label: 'Yellow' },
    { value: '#00ff00', label: 'Green' },
    { value: '#00ffff', label: 'Cyan' },
];

const BG_OPACITY_OPTIONS = [
    { value: 'rgba(0,0,0,0.5)', label: 'Semi-black' },
    { value: 'transparent', label: 'Transparent' },
];

type Props = {
    profile: Profile,
};

type SectionCardProps = {
    kicker: string,
    title: string,
    copy: string,
    children: React.ReactNode,
};

const SectionCard = ({ kicker, title, copy, children }: SectionCardProps) => (
    <section className={styles['section-card']}>
        <div className={styles['section-meta']}>
            <div className={styles['section-kicker']}>{kicker}</div>
            <h3 className={styles['section-title']}>{title}</h3>
            <p className={styles['section-copy']}>{copy}</p>
        </div>

        <div className={styles['options-group']}>
            {children}
        </div>
    </section>
);

const Player = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { shell } = useServices();

    const {
        subtitlesLanguageSelect,
        subtitlesSizeSelect,
        subtitlesTextColorInput,
        subtitlesBackgroundColorInput,
        subtitlesOutlineColorInput,
        assSubtitlesStylingToggle,
        audioLanguageSelect,
        surroundSoundToggle,
        seekTimeDurationSelect,
        seekShortTimeDurationSelect,
        playInExternalPlayerSelect,
        nextVideoPopupDurationSelect,
        bingeWatchingToggle,
        playInBackgroundToggle,
        hardwareDecodingToggle,
        videoModeSelect,
        pauseOnMinimizeToggle,
    } = usePlayerOptions(profile);

    const {
        hideSpoilersToggle,
        quitOnCloseToggle,
        escExitFullscreenToggle,
    } = useInterfaceOptions(profile);

    return (
        <div ref={ref} className={styles['player-dashboard']}>
            <div className={styles['player-grid']}>
                <SectionCard
                    kicker={'Captions'}
                    title={'Readable in one glance'}
                    copy={'Dial in subtitle language, audio preference, and contrast before you press play.'}
                >
                    <Option label={'Subtitle language'}>
                        <MultiselectMenu className={styles['multiselect']} {...subtitlesLanguageSelect} />
                    </Option>
                    <Option label={'Preferred audio'}>
                        <MultiselectMenu className={styles['multiselect']} {...audioLanguageSelect} />
                    </Option>
                    <Option label={'Subtitle size'}>
                        <MultiselectMenu className={styles['multiselect']} {...subtitlesSizeSelect} />
                    </Option>
                    <Option label={'Caption color'}>
                        <MultiselectMenu
                            className={styles['multiselect']}
                            options={FONT_COLOR_OPTIONS}
                            value={subtitlesTextColorInput.value || '#ffffff'}
                            title={() => {
                                const value = subtitlesTextColorInput.value || '#ffffff';
                                return FONT_COLOR_OPTIONS.find((option) => option.value === value)?.label ?? 'White';
                            }}
                            onSelect={(value) => subtitlesTextColorInput.onChange(value)}
                        />
                    </Option>
                    <Option label={'Backdrop'}>
                        <MultiselectMenu
                            className={styles['multiselect']}
                            options={BG_OPACITY_OPTIONS}
                            value={subtitlesBackgroundColorInput.value || 'rgba(0,0,0,0.5)'}
                            title={() => {
                                const value = subtitlesBackgroundColorInput.value || 'rgba(0,0,0,0.5)';
                                return BG_OPACITY_OPTIONS.find((option) => option.value === value)?.label ?? 'Semi-black';
                            }}
                            onSelect={(value) => subtitlesBackgroundColorInput.onChange(value)}
                        />
                    </Option>
                    <Option label={'Edge style'}>
                        <MultiselectMenu
                            className={styles['multiselect']}
                            options={[
                                { value: 'outline', label: 'Outline' },
                                { value: 'shadow', label: 'Drop Shadow' },
                                { value: 'none', label: 'None' }
                            ]}
                            value={subtitlesOutlineColorInput.value ? 'outline' : 'none'}
                            onSelect={(value: string) => {
                                subtitlesOutlineColorInput.onChange(value === 'none' ? '' : '#000000');
                            }}
                        />
                    </Option>
                    <Option label={'Respect styled subtitles'}>
                        <Toggle tabIndex={-1} {...assSubtitlesStylingToggle} />
                    </Option>
                </SectionCard>

                <SectionCard
                    kicker={'Flow'}
                    title={'Make bingeing feel natural'}
                    copy={'Set autoplay timing, seek jumps, and background playback so controls feel predictable.'}
                >
                    <Option label={'Auto-play next episode'}>
                        <Toggle tabIndex={-1} {...bingeWatchingToggle} />
                    </Option>
                    <Option label={'Next-up countdown'}>
                        <MultiselectMenu className={styles['multiselect']} {...nextVideoPopupDurationSelect} />
                    </Option>
                    <Option label={'Main seek jump'}>
                        <MultiselectMenu className={styles['multiselect']} {...seekTimeDurationSelect} />
                    </Option>
                    <Option label={'Quick seek jump'}>
                        <MultiselectMenu className={styles['multiselect']} {...seekShortTimeDurationSelect} />
                    </Option>
                    <Option label={'Keep audio in background'}>
                        <Toggle tabIndex={-1} {...playInBackgroundToggle} />
                    </Option>
                    <Option label={'SETTINGS_BLUR_UNWATCHED_IMAGE'}>
                        <Toggle tabIndex={-1} {...hideSpoilersToggle} />
                    </Option>
                </SectionCard>

                <SectionCard
                    kicker={'Device'}
                    title={'Choose the right playback lane'}
                    copy={'Switch engines, hand off to another player, and decide how aggressively the app uses your hardware.'}
                >
                    <Option label={'Open in external player'}>
                        <MultiselectMenu className={styles['multiselect']} {...playInExternalPlayerSelect} />
                    </Option>
                    <Option label={'Video engine'}>
                        <MultiselectMenu className={styles['multiselect']} {...videoModeSelect} />
                    </Option>
                    <Option label={'Hardware acceleration'}>
                        <Toggle tabIndex={-1} {...hardwareDecodingToggle} />
                    </Option>
                    <Option label={'Surround sound'}>
                        <Toggle tabIndex={-1} {...surroundSoundToggle} />
                    </Option>
                    <Option label={'Pause when app loses focus'}>
                        <Toggle tabIndex={-1} {...pauseOnMinimizeToggle} />
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
                </SectionCard>
            </div>
        </div>
    );
});

export default Player;

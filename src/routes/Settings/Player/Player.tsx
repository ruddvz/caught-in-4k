import React, { forwardRef } from 'react';
import { MultiselectMenu, Toggle } from 'stremio/components';
import { Option } from '../components';
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

                {/* Internal Sub-Column 1 — Visuals & Subtitles */}
                <div className={styles['col']}>
                    <div className={styles['section-header']}>
                        <div className={styles['header-top']}>
                            <svg className={styles['header-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span className={styles['header-text']}>SUBTITLES</span>
                        </div>
                        <div className={styles['header-divider']} />
                    </div>

                    <div className={styles['options-group']}>
                        <Option label={'Language'}>
                            <MultiselectMenu className={styles['multiselect']} {...subtitlesLanguageSelect} />
                        </Option>
                        <Option label={'Font Size'}>
                            <MultiselectMenu className={styles['multiselect']} {...subtitlesSizeSelect} />
                        </Option>
                        <Option label={'Font Color'}>
                            <MultiselectMenu
                                className={styles['multiselect']}
                                options={[
                                    { value: '#ffffff', label: 'White' },
                                    { value: '#ffff00', label: 'Yellow' },
                                    { value: '#00ff00', label: 'Green' },
                                    { value: '#00ffff', label: 'Cyan' }
                                ]}
                                value={subtitlesTextColorInput.value || '#ffffff'}
                                onSelect={(v) => subtitlesTextColorInput.onChange(v)}
                            />
                        </Option>
                        <Option label={'Background Opacity'}>
                            <MultiselectMenu
                                className={styles['multiselect']}
                                options={[
                                    { value: 'rgba(0,0,0,0.5)', label: 'Semi-black' },
                                    { value: 'transparent', label: 'Transparent' }
                                ]}
                                value={subtitlesBackgroundColorInput.value || 'rgba(0,0,0,0.5)'}
                                onSelect={(v) => subtitlesBackgroundColorInput.onChange(v)}
                            />
                        </Option>
                        <Option label={'Edge Style'}>
                            <MultiselectMenu
                                className={styles['multiselect']}
                                options={[
                                    { value: 'outline', label: 'Outline' },
                                    { value: 'shadow', label: 'Drop Shadow' },
                                    { value: 'none', label: 'None' }
                                ]}
                                value={subtitlesOutlineColorInput.value ? 'outline' : 'none'}
                                onSelect={() => {}}
                            />
                        </Option>
                    </div>

                    {/* Visual Logic: Blur toggle at the bottom */}
                    <div className={styles['options-group']} style={{ marginTop: 'auto' }}>
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
                    </div>
                </div>

                {/* Internal Sub-Column 2 — Performance & Automation */}
                <div className={styles['col']}>
                    <div className={styles['section-header']}>
                        <div className={styles['header-top']}>
                            <svg className={styles['header-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                            <span className={styles['header-text']}>AUTOMATION</span>
                        </div>
                        <div className={styles['header-divider']} />
                    </div>
                    <div className={styles['options-group']}>
                        <Option label={'Auto-play next episode'}>
                            <Toggle tabIndex={-1} {...bingeWatchingToggle} />
                        </Option>
                        <Option label={'Next Video Popup Duration'}>
                            <MultiselectMenu className={styles['multiselect']} {...nextVideoPopupDurationSelect} />
                        </Option>
                    </div>

                    <div className={styles['section-header']} style={{ marginTop: '2.5rem' }}>
                        <div className={styles['header-top']}>
                            <svg className={styles['header-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            <span className={styles['header-text']}>ADVANCED ENGINE</span>
                        </div>
                        <div className={styles['header-divider']} />
                    </div>
                    <div className={styles['options-group']}>
                        <Option label={'Hardware Acceleration'}>
                            <Toggle tabIndex={-1} {...hardwareDecodingToggle} />
                        </Option>
                        <Option label={'Play in External Player'}>
                            <MultiselectMenu className={styles['multiselect']} {...playInExternalPlayerSelect} />
                        </Option>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default Player;

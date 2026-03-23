import React from 'react';
import classnames from 'classnames';
import Icon from '@stremio/stremio-icons/react';
import { Button, MainNavBars, ShortcutsGroup } from 'stremio/components';
import { useShortcuts } from 'stremio/common';
import styles from './SettingsShortcuts.less';

const SettingsShortcuts = () => {
    const { grouped } = useShortcuts();

    return (
        <MainNavBars className={styles['shortcuts-page']} route={'settings'}>
            <div className={classnames(styles['shortcuts-content'], 'animation-fade-in')}>
                <div className={styles['header']}>
                    <Button className={styles['back-button']} href={'#/settings'}>
                        <Icon name={'chevron-back'} className={styles['back-icon']} />
                        <span>Back to Settings</span>
                    </Button>
                    <h1 className={styles['title']}>Keyboard Shortcuts</h1>
                    <p className={styles['subtitle']}>Master the keys, master the stream</p>
                    <span className={styles['accent-bar']} />
                </div>

                <div className={styles['groups-grid']}>
                    {grouped.map(({ name, label, shortcuts }) => (
                        <div key={name} className={styles['group-card']}>
                            <ShortcutsGroup
                                className={styles['shortcuts-group']}
                                label={label}
                                shortcuts={shortcuts}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </MainNavBars>
    );
};

export default SettingsShortcuts;


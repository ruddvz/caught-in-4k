import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useShortcuts } from 'stremio/common';
import styles from './Shortcuts.less';

const Shortcuts = forwardRef<HTMLDivElement>((_, ref) => {
    const { t } = useTranslation();
    const { grouped } = useShortcuts();

    return (
        <div ref={ref} className={styles['shortcuts-tab']}>
            <div className={styles['shortcuts-grid']}>
                {
                    grouped.map(({ name, label, shortcuts }) => (
                        <div key={name} className={styles['group']}>
                            <div className={styles['group-title']}>
                                {t(label)}
                            </div>
                            <div className={styles['group-items']}>
                                {
                                    shortcuts.map(({ name: sName, label: sLabel, combos }) => (
                                        <div key={sName} className={styles['shortcut-row']}>
                                            <span className={styles['shortcut-label']}>
                                                {t(sLabel)}
                                            </span>
                                            <div className={styles['combos']}>
                                                {combos.map((combo, ci) => (
                                                    <div key={ci} className={styles['combo']}>
                                                        {combo.map((key, ki) => (
                                                            <span key={ki} className={styles['keycap']}>
                                                                {key}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
});

export default Shortcuts;

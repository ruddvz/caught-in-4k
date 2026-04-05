import React from 'react';
import { getDeviceLimit, useDeviceSession } from 'stremio/common/useDeviceSession';
import styles from './DevicesWidget.less';

interface DevicesWidgetProps {
    planId?: string | null;
    userId?: string | null;
}

function formatRelativeTime(iso: string): string {
    try {
        const diff = Date.now() - new Date(iso).getTime();
        const minutes = Math.floor(diff / 60_000);
        if (minutes < 2) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    } catch {
        return '';
    }
}

const DevicesWidget = ({ planId, userId }: DevicesWidgetProps) => {
    const { sessions } = useDeviceSession(userId);
    const limit = getDeviceLimit(planId);
    const tierLabel = limit > 2 ? 'Max' : 'Pro';
    const currentSession = sessions.find((session) => session.isCurrent) || null;

    return (
        <div className={styles['devices-widget']}>
            <div className={styles['devices-header']}>
                <span className={styles['devices-title']}>This device</span>
                <span className={styles['devices-count']}>
                    {tierLabel} · {limit} max
                </span>
            </div>

            <div className={styles['devices-list']}>
                {!currentSession ? (
                    <div className={styles['devices-empty']}>
                        Device preview unavailable.
                    </div>
                ) : (
                    <div
                        className={`${styles['device-row']} ${styles['device-current']}`}
                    >
                        <div className={styles['device-icon']}>
                            ◉
                        </div>
                        <div className={styles['device-info']}>
                            <span className={styles['device-label']}>
                                {currentSession.deviceLabel}
                                <span className={styles['device-badge']}>This device</span>
                            </span>
                            <span className={styles['device-meta']}>
                                Active {formatRelativeTime(currentSession.lastActiveAt)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles['devices-note']}>
                Current-browser preview only. Account-wide counts and device removal unlock after backend sync is connected.
            </div>
        </div>
    );
};

export default DevicesWidget;

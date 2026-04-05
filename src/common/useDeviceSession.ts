/**
 * Device Session Tracker
 *
 * Assigns a permanent device ID to each browser instance and tracks registered
 * devices in localStorage. This is the UI-layer foundation for Pro/Max device limits.
 *
 * When the backend is wired up, `syncWithBackend()` will replace the localStorage
 * store with the server-side device list — the rest of the API stays the same.
 */

import { useState, useEffect, useCallback } from 'react';

const { resolveSubscriptionPlanId } = require('./subscriptionPlans');

const DEVICE_ID_KEY = 'c4k_device_id';
const DEVICE_SESSIONS_KEY = 'c4k_device_sessions';

export interface DeviceSession {
    deviceId: string;
    deviceLabel: string;
    addedAt: string;
    lastActiveAt: string;
    isCurrent: boolean;
}

const PLAN_DEVICE_LIMITS: Record<string, number> = {
    '1mo': 2,
    '3mo': 2,
    '6mo': 2,
    '1mo-max': 4,
    '3mo-max': 4,
    '6mo-max': 4,
};

export function getDeviceLimit(planId: string | null | undefined): number {
    const resolvedPlanId = resolveSubscriptionPlanId(planId);
    if (!resolvedPlanId) return 2;
    return PLAN_DEVICE_LIMITS[resolvedPlanId] ?? 2;
}

function generateDeviceId(): string {
    return 'dev_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function buildDeviceLabel(): string {
    const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Android/i.test(ua)) return 'Android';
    if (/Windows/i.test(ua)) return 'Windows PC';
    if (/Macintosh/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Browser';
}

function normalizeUserScope(userScope?: string | null): string {
    return typeof userScope === 'string' && userScope.trim().length > 0 ? userScope.trim() : 'anonymous';
}

function getSessionsStorageKey(userScope?: string | null): string {
    return `${DEVICE_SESSIONS_KEY}:${normalizeUserScope(userScope)}`;
}

function readSessions(userScope?: string | null): DeviceSession[] {
    try {
        const raw = localStorage.getItem(getSessionsStorageKey(userScope));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeSessions(userScope: string | null | undefined, sessions: DeviceSession[]): void {
    try {
        localStorage.setItem(getSessionsStorageKey(userScope), JSON.stringify(sessions));
    } catch {
        // localStorage full or blocked
    }
}

function getOrCreateDeviceId(): string {
    try {
        const existing = localStorage.getItem(DEVICE_ID_KEY);
        if (existing) return existing;
        const id = generateDeviceId();
        localStorage.setItem(DEVICE_ID_KEY, id);
        return id;
    } catch {
        return generateDeviceId();
    }
}

function hydrateSessions(currentDeviceId: string, userScope?: string | null): DeviceSession[] {
    return readSessions(userScope).map((session) => ({
        ...session,
        isCurrent: session.deviceId === currentDeviceId,
    }));
}

function upsertCurrentDevice(deviceId: string, userScope?: string | null): void {
    const now = new Date().toISOString();
    const label = buildDeviceLabel();
    const sessions = readSessions(userScope);
    const nextSessions = sessions.some((session) => session.deviceId === deviceId)
        ? sessions.map((session) => (
            session.deviceId === deviceId
                ? { ...session, deviceLabel: label, lastActiveAt: now }
                : session
        ))
        : [
            ...sessions,
            { deviceId, deviceLabel: label, addedAt: now, lastActiveAt: now, isCurrent: false },
        ];

    writeSessions(userScope, nextSessions);
}

/** Register or refresh the current device in the session list. Call once on app start. */
export function registerCurrentDevice(userScope?: string | null): string {
    const deviceId = getOrCreateDeviceId();
    upsertCurrentDevice(deviceId, userScope);
    return deviceId;
}

export interface UseDeviceSessionResult {
    currentDeviceId: string;
    sessions: DeviceSession[];
    removeDevice: (deviceId: string) => void;
    isAtLimit: (planId: string | null | undefined) => boolean;
}

export function useDeviceSession(userScope?: string | null): UseDeviceSessionResult {
    const [currentDeviceId] = useState<string>(() => getOrCreateDeviceId());
    const [sessions, setSessions] = useState<DeviceSession[]>(() => {
        upsertCurrentDevice(currentDeviceId, userScope);
        return hydrateSessions(currentDeviceId, userScope);
    });

    useEffect(() => {
        upsertCurrentDevice(currentDeviceId, userScope);
        setSessions(hydrateSessions(currentDeviceId, userScope));
    }, [currentDeviceId, userScope]);

    useEffect(() => {
        // Keep lastActiveAt fresh while the app is open
        const interval = setInterval(() => {
            upsertCurrentDevice(currentDeviceId, userScope);
            setSessions(hydrateSessions(currentDeviceId, userScope));
        }, 60_000);
        return () => clearInterval(interval);
    }, [currentDeviceId, userScope]);

    const removeDevice = useCallback((deviceId: string) => {
        if (deviceId === currentDeviceId) return; // can't remove current device
        const updated = readSessions(userScope).filter((s) => s.deviceId !== deviceId);
        writeSessions(userScope, updated);
        setSessions(updated.map((s) => ({ ...s, isCurrent: s.deviceId === currentDeviceId })));
    }, [currentDeviceId, userScope]);

    const isAtLimit = useCallback((planId: string | null | undefined): boolean => {
        const limit = getDeviceLimit(planId);
        const activeSessions = readSessions(userScope);
        // Current device is always allowed — only block if it's NOT registered and we're at cap
        const isRegistered = activeSessions.some((s) => s.deviceId === currentDeviceId);
        if (isRegistered) return false;
        return activeSessions.length >= limit;
    }, [currentDeviceId, userScope]);

    return { currentDeviceId, sessions, removeDevice, isAtLimit };
}

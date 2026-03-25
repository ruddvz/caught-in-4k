// Copyright (C) 2024 Caught in 4K
const React = require('react');
const styles = require('./PinModal.less');

const MASTER_CODE = '0000';

function hashPin(pin) {
    return pin.split('').reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0).toString(36);
}

/**
 * PinModal — unified PIN entry / confirmation modal
 *
 * mode:
 *   'unlock' — accepts profile PIN or master code 0000
 *   'delete' — accepts master code 0000 ONLY (for deleting profiles)
 *   'set'    — two-step enter + confirm; calls onSuccess(pinHash)
 *   'remove' — accepts profile PIN or 0000; used to disable a profile PIN
 *
 * Props:
 *   mode         'unlock' | 'delete' | 'set' | 'remove'
 *   profileId?   string  — used in 'unlock'/'remove' to look up stored hash
 *   profileName? string  — shown in 'delete' mode subtitle
 *   title?       string  — override modal title
 *   subtitle?    string  — override modal subtitle
 *   onSuccess    fn()    — called on correct entry ('set' mode: fn(pinHash))
 *   onCancel     fn()    — called when user cancels
 */
const PinModal = ({ mode, profileId, profileName, title: titleOverride, subtitle: subtitleOverride, onSuccess, onCancel }) => {
    const [step, setStep] = React.useState(1);
    const [firstEntry, setFirstEntry] = React.useState('');
    const [digits, setDigits] = React.useState([]);
    const [error, setError] = React.useState('');
    const [shake, setShake] = React.useState(false);
    const [lastAdded, setLastAdded] = React.useState(-1);

    const derivedTitle = React.useMemo(() => {
        if (mode === 'delete') return 'Confirm Delete';
        if (mode === 'set') return step === 1 ? 'Set PIN' : 'Confirm PIN';
        if (mode === 'remove') return 'Disable PIN';
        return 'Enter PIN';
    }, [mode, step]);

    const derivedSubtitle = React.useMemo(() => {
        if (mode === 'delete') return `Enter master code to remove ${profileName || 'profile'}`;
        if (mode === 'set') return step === 1 ? 'Enter a new 4-digit PIN' : 'Re-enter to confirm';
        if (mode === 'remove') return 'Enter your PIN or master code to disable';
        return 'Enter your PIN or master code';
    }, [mode, profileName, step]);

    const displayTitle = titleOverride || derivedTitle;
    const displaySubtitle = subtitleOverride || derivedSubtitle;

    const triggerError = React.useCallback((msg) => {
        setShake(true);
        setError(msg);
        setTimeout(() => {
            setShake(false);
            setDigits([]);
            setLastAdded(-1);
            setTimeout(() => setError(''), 1500);
        }, 600);
    }, []);

    const checkPin = React.useCallback((entered) => {
        if (mode === 'delete') {
            if (entered === MASTER_CODE) { onSuccess(); return; }
            triggerError('Incorrect code');
            return;
        }

        if (mode === 'unlock' || mode === 'remove') {
            if (entered === MASTER_CODE) { onSuccess(); return; }
            if (profileId) {
                const storedHash = localStorage.getItem(`c4k_profile_pin_${profileId}`);
                if (storedHash && storedHash === hashPin(entered)) { onSuccess(); return; }
            }
            triggerError('Incorrect PIN');
            return;
        }

        if (mode === 'set') {
            if (step === 1) {
                setFirstEntry(entered);
                setDigits([]);
                setLastAdded(-1);
                setStep(2);
                return;
            }
            if (step === 2) {
                if (entered === firstEntry) {
                    onSuccess(hashPin(entered));
                } else {
                    setFirstEntry('');
                    setStep(1);
                    triggerError('PINs do not match');
                }
            }
        }
    }, [mode, profileId, step, firstEntry, onSuccess, triggerError]);

    const handleDigit = (d) => {
        if (digits.length >= 4) return;
        const next = [...digits, d];
        setLastAdded(next.length - 1);
        setError('');
        setDigits(next);
        if (next.length === 4) {
            setTimeout(() => checkPin(next.join('')), 200);
        }
    };

    // Number pad layout: rows of 1-9 then null/0/null (null = empty cell)
    const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', null, '0', null];

    return (
        <div className={styles['pin-modal-overlay']}>
            <div className={styles['pin-modal']}>
                <div className={styles['modal-title']}>{displayTitle}</div>
                <div className={styles['modal-subtitle']}>{displaySubtitle}</div>

                {/* 4-dot PIN indicator */}
                <div className={[styles['dots-row'], shake ? styles['shake'] : ''].filter(Boolean).join(' ')}>
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={[
                                styles['dot'],
                                digits.length > i ? styles['filled'] : '',
                                lastAdded === i ? styles['pop'] : '',
                            ].filter(Boolean).join(' ')}
                        />
                    ))}
                </div>

                {/* Error message — always takes space to prevent layout jump */}
                <div className={styles['error-text']}>{error}</div>

                {/* Number pad */}
                <div className={styles['numpad']}>
                    {KEYS.map((k, i) =>
                        k === null
                            ? <div key={i} className={styles['numpad-spacer']} />
                            : (
                                <button
                                    key={i}
                                    className={styles['numpad-btn']}
                                    onClick={() => handleDigit(k)}
                                >
                                    {k}
                                </button>
                            )
                    )}
                </div>

                <button className={styles['pin-cancel-btn']} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

module.exports = PinModal;
module.exports.hashPin = hashPin;

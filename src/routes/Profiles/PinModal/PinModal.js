// Copyright (C) 2024 Caught in 4K
const React = require('react');
const styles = require('./PinModal.less');

/**
 * PinModal — unified PIN entry / confirmation modal
 *
 * mode:
 *   'unlock'     — caller verifies a profile PIN
 *   'delete'     — caller verifies the account master code
 *   'set'        — two-step enter + confirm; calls onSuccess(pinCode)
 *   'set-master' — two-step enter + confirm; calls onSuccess(pinCode)
 *   'remove'     — caller verifies a profile PIN or master code
 *
 * Props:
 *   mode         'unlock' | 'delete' | 'set' | 'set-master' | 'remove'
 *   profileName? string  — shown in 'delete' mode subtitle
 *   title?       string  — override modal title
 *   subtitle?    string  — override modal subtitle
 *   onSuccess    fn()    — called on successful set flow ('set'/'set-master': fn(pinCode))
 *   onSubmitCode fn()    — called for unlock/delete/remove; should return true on success,
 *                          false for the default error, or a string with a custom error message
 *   onCancel     fn()    — called when user cancels
 */
const PinModal = ({ mode, profileName, title: titleOverride, subtitle: subtitleOverride, onSuccess, onSubmitCode, onCancel }) => {
    const [step, setStep] = React.useState(1);
    const [firstEntry, setFirstEntry] = React.useState('');
    const [digits, setDigits] = React.useState([]);
    const [error, setError] = React.useState('');
    const [isBusy, setIsBusy] = React.useState(false);
    const [shake, setShake] = React.useState(false);
    const [lastAdded, setLastAdded] = React.useState(-1);
    const dismissedRef = React.useRef(false);
    const submitTimeoutRef = React.useRef(null);

    React.useEffect(() => () => {
        dismissedRef.current = true;
        if (submitTimeoutRef.current) {
            clearTimeout(submitTimeoutRef.current);
        }
    }, []);

    const derivedTitle = React.useMemo(() => {
        if (mode === 'delete') return 'Confirm Delete';
        if (mode === 'set-master') return step === 1 ? 'Set Master Code' : 'Confirm Master Code';
        if (mode === 'set') return step === 1 ? 'Set PIN' : 'Confirm PIN';
        if (mode === 'remove') return 'Disable PIN';
        return 'Enter PIN';
    }, [mode, step]);

    const derivedSubtitle = React.useMemo(() => {
        if (mode === 'delete') return `Enter master code to remove ${profileName || 'profile'}`;
        if (mode === 'set-master') return step === 1 ? 'Create a 4-digit master code' : 'Re-enter to confirm';
        if (mode === 'set') return step === 1 ? 'Enter a new 4-digit PIN' : 'Re-enter to confirm';
        if (mode === 'remove') return 'Enter your PIN or master code to disable';
        return 'Enter this profile PIN';
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

    const getDefaultErrorMessage = React.useCallback(() => {
        if (mode === 'delete') return 'Incorrect master code';
        if (mode === 'remove') return 'Incorrect code';
        return 'Incorrect PIN';
    }, [mode]);

    const resolveSubmissionResult = React.useCallback((result) => {
        if (result === false) {
            return { ok: false, error: getDefaultErrorMessage() };
        }

        if (typeof result === 'string') {
            return { ok: false, error: result };
        }

        if (result && typeof result === 'object' && result.ok === false) {
            return { ok: false, error: result.error || getDefaultErrorMessage() };
        }

        return { ok: true };
    }, [getDefaultErrorMessage]);

    const submitVerifiedCode = React.useCallback(async (entered) => {
        if (typeof onSubmitCode !== 'function') {
            return true;
        }

        const result = await onSubmitCode(entered);
        return resolveSubmissionResult(result);
    }, [onSubmitCode, resolveSubmissionResult]);

    const submitSetCode = React.useCallback(async (entered) => {
        if (typeof onSuccess !== 'function') {
            return { ok: true };
        }

        const result = await onSuccess(entered);
        return resolveSubmissionResult(result);
    }, [onSuccess, resolveSubmissionResult]);

    const checkPin = React.useCallback(async (entered) => {
        if (mode === 'set' || mode === 'set-master') {
            if (step === 1) {
                setFirstEntry(entered);
                setDigits([]);
                setLastAdded(-1);
                setStep(2);
                return;
            }

            if (step === 2) {
                if (entered !== firstEntry) {
                    setFirstEntry('');
                    setStep(1);
                    triggerError('PINs do not match');
                    return;
                }

                setIsBusy(true);
                try {
                    const result = await submitSetCode(entered);
                    if (!result.ok) {
                        triggerError(result.error);
                    }
                } finally {
                    setIsBusy(false);
                }
            }
            return;
        }

        setIsBusy(true);
        try {
            const result = await submitVerifiedCode(entered);
            if (!result.ok) {
                triggerError(result.error);
            }
        } finally {
            setIsBusy(false);
        }
    }, [mode, step, firstEntry, submitSetCode, submitVerifiedCode, triggerError]);

    const handleDigit = (d) => {
        if (isBusy || digits.length >= 4) return;
        const next = [...digits, d];
        setLastAdded(next.length - 1);
        setError('');
        setDigits(next);
        if (next.length === 4) {
            submitTimeoutRef.current = setTimeout(() => {
                submitTimeoutRef.current = null;
                if (dismissedRef.current) {
                    return;
                }
                void checkPin(next.join(''));
            }, 200);
        }
    };

    const handleCancel = React.useCallback(() => {
        dismissedRef.current = true;
        if (submitTimeoutRef.current) {
            clearTimeout(submitTimeoutRef.current);
            submitTimeoutRef.current = null;
        }
        if (typeof onCancel === 'function') {
            onCancel();
        }
    }, [onCancel]);

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
                                    disabled={isBusy}
                                    onClick={() => handleDigit(k)}
                                >
                                    {k}
                                </button>
                            )
                    )}
                </div>

                <button className={styles['pin-cancel-btn']} onClick={handleCancel} disabled={isBusy}>Cancel</button>
            </div>
        </div>
    );
};

module.exports = PinModal;

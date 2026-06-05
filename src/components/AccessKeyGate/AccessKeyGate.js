// Copyright (C) 2026 Caught in 4K — invite-only access gate

const React = require('react');
const PropTypes = require('prop-types');
const { useTranslation } = require('react-i18next');
const { Button } = require('stremio/components');
const {
    isAccessKeyGateEnabled,
    isAccessKeyBrowserUnlocked,
    setAccessKeyBrowserUnlocked,
    normalizeAccessKey,
} = require('stremio/common/accessKey');
const { verifyAccessKeyWithApi } = require('stremio/common/accessKeyApi');

const styles = require('./styles.less');

const SEG_LEN = 4;
const NUM_SEG = 3;

const sanitizeSegment = (value) => normalizeAccessKey(value).slice(0, SEG_LEN);

const AccessKeyGate = ({ children }) => {
    const { t } = useTranslation();
    const [sessionUnlocked, setSessionUnlocked] = React.useState(false);
    const [segments, setSegments] = React.useState(() => Array(NUM_SEG).fill(''));
    const [error, setError] = React.useState('');
    const [verifying, setVerifying] = React.useState(false);
    const inputRefs = [
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
    ];

    const gateEnabled = isAccessKeyGateEnabled();
    const unlocked = !gateEnabled || isAccessKeyBrowserUnlocked() || sessionUnlocked;

    const submit = React.useCallback(async () => {
        const combined = segments.join('');
        if (normalizeAccessKey(combined).length !== SEG_LEN * NUM_SEG) {
            setError(t('ACCESS_KEY_INCOMPLETE'));
            return;
        }
        setVerifying(true);
        setError('');
        try {
            const valid = await verifyAccessKeyWithApi(combined);
            if (!valid) {
                setError(t('ACCESS_KEY_INVALID'));
                return;
            }
            setAccessKeyBrowserUnlocked();
            setSessionUnlocked(true);
        } finally {
            setVerifying(false);
        }
    }, [segments, t]);

    const onSegmentChange = React.useCallback((index, raw) => {
        const nextSeg = sanitizeSegment(raw);
        setError('');
        setSegments((prev) => {
            const next = [...prev];
            next[index] = nextSeg;
            return next;
        });
        if (nextSeg.length === SEG_LEN && index < NUM_SEG - 1) {
            requestAnimationFrame(() => {
                inputRefs[index + 1].current?.focus();
            });
        }
    }, [inputRefs]);

    const onSegmentKeyDown = React.useCallback((index, event) => {
        if (event.key === 'Backspace' && segments[index] === '' && index > 0) {
            event.preventDefault();
            inputRefs[index - 1].current?.focus();
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            submit();
        }
    }, [segments, submit, inputRefs]);

    const onPaste = React.useCallback((event) => {
        const text = event.clipboardData?.getData('text') || '';
        const normalized = normalizeAccessKey(text);
        if (normalized.length !== SEG_LEN * NUM_SEG) {
            return;
        }
        event.preventDefault();
        setError('');
        setSegments([
            normalized.slice(0, SEG_LEN),
            normalized.slice(SEG_LEN, SEG_LEN * 2),
            normalized.slice(SEG_LEN * 2, SEG_LEN * 3),
        ]);
        requestAnimationFrame(() => {
            inputRefs[NUM_SEG - 1].current?.focus();
        });
    }, [inputRefs]);

    React.useEffect(() => {
        if (!gateEnabled || unlocked) {
            return undefined;
        }
        const tId = setTimeout(() => inputRefs[0].current?.focus(), 100);
        return () => clearTimeout(tId);
    }, [gateEnabled, unlocked, inputRefs]);

    if (unlocked) {
        return children;
    }

    return (
        <div className={styles['access-key-overlay']} role="dialog" aria-modal="true" aria-labelledby="access-key-title">
            <div className={styles['access-key-card']}>
                <h1 id="access-key-title" className={styles['access-key-title']}>
                    {t('ACCESS_KEY_TITLE')}
                </h1>
                <p className={styles['access-key-subtitle']}>
                    {t('ACCESS_KEY_SUBTITLE')}
                </p>
                <div className={styles['access-key-row']} onPaste={onPaste}>
                    {inputRefs.map((ref, index) => (
                        <React.Fragment key={index}>
                            {index > 0 ? (
                                <span className={styles['access-key-sep']} aria-hidden="true">-</span>
                            ) : null}
                            <input
                                ref={ref}
                                type="text"
                                name={`access-key-${index}`}
                                className={styles['access-key-segment']}
                                maxLength={SEG_LEN}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="characters"
                                spellCheck={false}
                                inputMode="text"
                                aria-label={t('ACCESS_KEY_SEGMENT_ARIA', { index: index + 1 })}
                                value={segments[index]}
                                onChange={(e) => onSegmentChange(index, e.target.value)}
                                onKeyDown={(e) => onSegmentKeyDown(index, e)}
                            />
                        </React.Fragment>
                    ))}
                </div>
                <p className={styles['access-key-error']} role="alert">
                    {error || ''}
                </p>
                <div className={styles['access-key-actions']}>
                    <Button onClick={submit} disabled={verifying}>
                        {verifying ? t('ACCESS_KEY_VERIFYING', 'Verifying…') : t('ACCESS_KEY_CONTINUE')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

AccessKeyGate.propTypes = {
    children: PropTypes.node.isRequired,
};

module.exports = AccessKeyGate;

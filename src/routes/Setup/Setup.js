// Copyright (C) 2026 Caught in 4K
//
// Done-for-you account setup request ($120 one-time). The member chooses a
// streaming-server tier and submits a request; the operator provisions the
// account by hand (matching the existing admin/approval flow) and hands over a
// login. Submissions are written to Supabase when configured, with a graceful
// email fallback otherwise.

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { navigateToAppHref } = require('stremio/common/navigation');
const { useAuth } = require('stremio/common/AuthProvider');
const { supabase, isSupabaseConfigured } = require('stremio/common/supabaseClient');
const {
    SETUP_SERVICE,
    SERVER_TIERS,
    DEFAULT_SERVER_TIER_ID,
} = require('stremio/common/guideAccess');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

// Where fallback requests are sent if Supabase is not configured on this build.
const SUPPORT_EMAIL = 'support@c4k.live';

const Setup = () => {
    const auth = useAuth();
    const presetEmail = (auth && auth.user && auth.user.email) || '';

    const [serverTier, setServerTier] = React.useState(DEFAULT_SERVER_TIER_ID);
    const [email, setEmail] = React.useState(presetEmail);
    const [desiredUsername, setDesiredUsername] = React.useState('');
    const [desiredPassword, setDesiredPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [devices, setDevices] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (presetEmail) {
            setEmail((current) => current || presetEmail);
        }
    }, [presetEmail]);

    const handleSubmit = React.useCallback(async (event) => {
        event.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError('Please enter a contact email.');
            return;
        }

        if (!desiredUsername.trim()) {
            setError('Please choose the username / ID you want for the account.');
            return;
        }

        if (desiredPassword.length < 8) {
            setError('Please choose a password of at least 8 characters.');
            return;
        }

        const payload = {
            user_id: (auth && auth.user && auth.user.id) || null,
            email: email.trim(),
            server_tier: serverTier,
            desired_username: desiredUsername.trim(),
            desired_password: desiredPassword,
            devices: devices.trim(),
            notes: notes.trim(),
            status: 'new',
        };

        setSubmitting(true);
        try {
            if (isSupabaseConfigured() && supabase) {
                const { error: insertError } = await supabase.from('setup_requests').insert(payload);
                if (insertError) {
                    throw insertError;
                }
                setSubmitted(true);
            } else {
                // No backend on this build — fall back to an email draft so the
                // request is never silently lost.
                const subject = encodeURIComponent('C4K Account Setup Request');
                const body = encodeURIComponent(
                    `Server tier: ${serverTier}\nContact email: ${payload.email}\nDesired username: ${payload.desired_username}\nDesired password: ${payload.desired_password}\nDevices: ${payload.devices}\nNotes: ${payload.notes}`
                );
                window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
                setSubmitted(true);
            }
        } catch (submitError) {
            setError(submitError.message || 'Could not send your request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [auth, desiredPassword, desiredUsername, devices, email, notes, serverTier]);

    return (
        <div className={styles['setup-page']}>
            <div className={styles['ambient-orb-a']} />
            <div className={styles['ambient-orb-b']} />

            <div className={styles['brand-header']}>
                <img src={APP_LOGO} className={styles['brand-logo']} alt="Caught in 4K" />
            </div>

            <Button className={styles['back-btn']} onClick={() => navigateToAppHref('/guide')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Guide
            </Button>

            <div className={styles['setup-shell']}>
                <header className={styles['setup-hero']}>
                    <span className={styles['eyebrow']}>Done-for-You</span>
                    <h1 className={styles['hero-title']}>{SETUP_SERVICE.name}</h1>
                    <p className={styles['hero-copy']}>
                        {SETUP_SERVICE.tagline} For a one-time {SETUP_SERVICE.price}, we provision your streaming account,
                        configure everything, and hand you a login that works in the Stremio apps on every device.
                    </p>
                </header>

                {submitted ? (
                    <div className={styles['success-card']}>
                        <div className={styles['success-icon']}>✓</div>
                        <h2 className={styles['success-title']}>Request received</h2>
                        <p className={styles['success-copy']}>
                            We&apos;ll reach out at <strong>{email}</strong> to arrange payment and get your account
                            set up. Keep an eye on your inbox.
                        </p>
                        <Button className={styles['success-btn']} onClick={() => navigateToAppHref('/')}>
                            Go Home
                        </Button>
                    </div>
                ) : (
                    <form className={styles['setup-form']} onSubmit={handleSubmit}>
                        <fieldset className={styles['tier-fieldset']}>
                            <legend className={styles['field-legend']}>Choose your streaming server</legend>
                            <div className={styles['tier-grid']}>
                                {SERVER_TIERS.map((tier) => (
                                    <button
                                        key={tier.id}
                                        type="button"
                                        className={classnames(styles['tier-card'], { [styles['tier-selected']]: serverTier === tier.id })}
                                        onClick={() => setServerTier(tier.id)}
                                    >
                                        <div className={styles['tier-head']}>
                                            <span className={styles['tier-name']}>{tier.name}</span>
                                            <span className={styles['tier-monthly']}>{tier.monthly}</span>
                                        </div>
                                        <span className={styles['tier-devices']}>{tier.devicesLabel}</span>
                                        <span className={styles['tier-summary']}>{tier.summary}</span>
                                    </button>
                                ))}
                            </div>
                            <p className={styles['tier-note']}>
                                The {SETUP_SERVICE.price} setup fee is the same for both. The monthly figure is the
                                ongoing server cost you carry after the initial term.
                            </p>
                        </fieldset>

                        <label className={styles['field']}>
                            <span className={styles['field-label']}>Contact email</span>
                            <input
                                className={styles['field-input']}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </label>

                        <fieldset className={styles['cred-fieldset']}>
                            <legend className={styles['field-legend']}>Your account login</legend>
                            <p className={styles['cred-help']}>
                                Pick the username and password you want for your streaming account — we&apos;ll create it
                                with exactly these. You can change the password yourself any time after handover.
                            </p>

                            <label className={styles['field']}>
                                <span className={styles['field-label']}>Desired username / ID</span>
                                <input
                                    className={styles['field-input']}
                                    type="text"
                                    value={desiredUsername}
                                    onChange={(e) => setDesiredUsername(e.target.value)}
                                    placeholder="e.g. moviefan_42"
                                    autoComplete="off"
                                    required
                                />
                            </label>

                            <label className={styles['field']}>
                                <span className={styles['field-label']}>Desired password</span>
                                <div className={styles['password-wrap']}>
                                    <input
                                        className={styles['field-input']}
                                        type={showPassword ? 'text' : 'password'}
                                        value={desiredPassword}
                                        onChange={(e) => setDesiredPassword(e.target.value)}
                                        placeholder="At least 8 characters"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles['password-toggle']}
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </label>

                            <p className={styles['cred-warning']}>
                                Use a brand-new password you don&apos;t use anywhere else — you&apos;re sharing it so we can
                                set the account up for you.
                            </p>
                        </fieldset>

                        <label className={styles['field']}>
                            <span className={styles['field-label']}>Which devices will you use? (optional)</span>
                            <input
                                className={styles['field-input']}
                                type="text"
                                value={devices}
                                onChange={(e) => setDevices(e.target.value)}
                                placeholder="e.g. iPhone, Apple TV, laptop"
                            />
                        </label>

                        <label className={styles['field']}>
                            <span className={styles['field-label']}>Anything else? (optional)</span>
                            <textarea
                                className={styles['field-textarea']}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Questions or preferences"
                            />
                        </label>

                        {error ? <p className={styles['error-text']}>{error}</p> : null}

                        <Button className={styles['submit-btn']} type="submit" disabled={submitting}>
                            {submitting ? 'Sending…' : `Request setup — ${SETUP_SERVICE.price}`}
                        </Button>
                        <p className={styles['fineprint']}>
                            No charge yet. This sends a request; we confirm details and arrange payment before any setup.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

module.exports = Setup;

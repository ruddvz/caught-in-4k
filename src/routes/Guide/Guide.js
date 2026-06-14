// Copyright (C) 2026 Caught in 4K
//
// The Stremio Setup Guide hub. Sits behind the site-wide access-key gate and is
// additionally paywalled: members see the full guide + a wizard launcher once
// the $30 guide product is unlocked, otherwise a purchase panel.

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { navigateToAppHref } = require('stremio/common/navigation');
const { useAuth } = require('stremio/common/AuthProvider');
const { resolveApiBaseUrl } = require('stremio/common/apiBaseUrl');
const { trimTrailingSlash } = require('stremio/common/subscriptionCheckout');
const { GUIDE_PRODUCT, SETUP_SERVICE, getGuideAccessState } = require('stremio/common/guideAccess');
const { GUIDE_CONTENT } = require('stremio/common/guideContent');
const { consumeGuideSection, requestWizardStep } = require('stremio/common/guideWizardLink');
const styles = require('./styles.less');

const readGuideCheckoutSuccess = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return new URLSearchParams(window.location.search).get('success') === '1';
};

const APP_LOGO = require('/assets/images/logo1.png');

const GuideSection = ({ section, index, expanded, onToggle }) => {
    const hasDetail = (section.steps && section.steps.length > 0) ||
        (section.notes && section.notes.length > 0) ||
        (section.links && section.links.length > 0);

    return (
        <article id={`guide-section-${section.id}`} className={classnames(styles['section-card'], { [styles['section-open']]: expanded })}>
            <button
                type="button"
                className={styles['section-header']}
                onClick={() => onToggle(section.id)}
                aria-expanded={expanded}
                aria-controls={hasDetail ? `section-detail-${section.id}` : undefined}
            >
                <span className={styles['section-index']}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles['section-heading']}>
                    <span className={styles['section-title']}>{section.title}</span>
                    <span className={styles['section-summary']}>{section.intro}</span>
                </span>
                {hasDetail ? (
                    <svg
                        className={styles['section-chevron']}
                        width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                ) : null}
            </button>

            {expanded && hasDetail ? (
                <div className={styles['section-detail']} id={`section-detail-${section.id}`}>
                    {section.steps && section.steps.length > 0 ? (
                        <ol className={styles['step-list']}>
                            {section.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className={styles['step-item']}>{step}</li>
                            ))}
                        </ol>
                    ) : null}

                    {section.notes && section.notes.length > 0 ? (
                        <div className={styles['note-list']}>
                            {section.notes.map((note, noteIndex) => (
                                <p key={noteIndex} className={styles['note-item']}>{note}</p>
                            ))}
                        </div>
                    ) : null}

                    {section.links && section.links.length > 0 ? (
                        <div className={styles['link-list']}>
                            {section.links.map((link, linkIndex) => (
                                <a
                                    key={linkIndex}
                                    className={styles['link-item']}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    ) : null}

                    {section.wizardStep ? (
                        <button
                            type="button"
                            className={styles['section-wizard-link']}
                            onClick={() => {
                                requestWizardStep(section.wizardStep);
                                navigateToAppHref('/wizard');
                            }}
                        >
                            Do this in the wizard
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    ) : null}
                </div>
            ) : null}
        </article>
    );
};

const Guide = () => {
    const auth = useAuth();
    const isAdmin = Boolean(auth && auth.isAdmin);
    const profile = auth ? auth.profile : null;
    const isLoggedIn = Boolean(auth && auth.session);
    const accessToken = (auth && auth.session && auth.session.access_token) || '';
    const refreshProfile = auth ? auth.refreshProfile : null;
    const { guideUnlocked } = getGuideAccessState({ isAdmin, profile });

    const [expandedIds, setExpandedIds] = React.useState(() => new Set());
    const onToggle = React.useCallback((id) => {
        setExpandedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);
    const allExpanded = expandedIds.size === GUIDE_CONTENT.length;
    const toggleAll = React.useCallback(() => {
        setExpandedIds(allExpanded ? new Set() : new Set(GUIDE_CONTENT.map((section) => section.id)));
    }, [allExpanded]);

    // If we arrived here from a wizard "full details" link, expand + scroll to
    // the requested section.
    React.useEffect(() => {
        const focusId = consumeGuideSection();
        if (!focusId) return;
        setExpandedIds((current) => new Set(current).add(focusId));
        if (typeof document !== 'undefined') {
            window.setTimeout(() => {
                const el = document.getElementById(`guide-section-${focusId}`);
                if (el && el.scrollIntoView) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 80);
        }
    }, []);

    // Checkout + inline auth state (guide unlock is per Supabase account).
    const [checkoutLoading, setCheckoutLoading] = React.useState(false);
    const [checkoutError, setCheckoutError] = React.useState(null);
    const [authMode, setAuthMode] = React.useState('login');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [authLoading, setAuthLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [checkoutSuccess] = React.useState(readGuideCheckoutSuccess);
    const [unlockTimedOut, setUnlockTimedOut] = React.useState(false);

    // After returning from Stripe, poll the profile until the webhook flips the flag.
    React.useEffect(() => {
        if (!checkoutSuccess || !refreshProfile || !isLoggedIn || guideUnlocked) {
            return undefined;
        }
        let cancelled = false;
        let attempts = 0;
        let timerId = null;
        const poll = async () => {
            attempts += 1;
            try {
                await refreshProfile();
            } catch (_e) {
                // keep trying
            }
            if (!cancelled && attempts < 5) {
                timerId = setTimeout(poll, 1500);
            } else if (!cancelled) {
                // Webhook hasn't flipped the flag yet — stop spinning silently and
                // tell the buyer what to do next instead of an endless "unlocking…".
                setUnlockTimedOut(true);
            }
        };
        poll();
        return () => {
            cancelled = true;
            if (timerId) clearTimeout(timerId);
        };
    }, [checkoutSuccess, isLoggedIn, guideUnlocked, refreshProfile]);

    const handleAuth = React.useCallback(async (event) => {
        event.preventDefault();
        setCheckoutError(null);
        setAuthLoading(true);
        try {
            const fn = authMode === 'signup'
                ? auth.signUp(email, password, email.split('@')[0])
                : auth.signIn(email, password);
            const { error: authErr } = await fn;
            if (authErr) throw authErr;
        } catch (err) {
            setCheckoutError(err.message || 'Authentication failed');
        } finally {
            setAuthLoading(false);
        }
    }, [auth, authMode, email, password]);

    const startGuideCheckout = React.useCallback(async () => {
        setCheckoutError(null);
        const apiBaseUrl = resolveApiBaseUrl();
        if (!apiBaseUrl) {
            setCheckoutError('Checkout is not connected on this build yet.');
            return;
        }
        if (!accessToken) {
            setCheckoutError('Please sign in again before checkout.');
            return;
        }
        setCheckoutLoading(true);
        try {
            const response = await fetch(`${trimTrailingSlash(apiBaseUrl)}/api/stripe/create-guide-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({}),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.url) {
                throw new Error(data.error || 'Unable to start checkout.');
            }
            window.location.href = data.url;
        } catch (err) {
            setCheckoutError(err.message);
        } finally {
            setCheckoutLoading(false);
        }
    }, [accessToken]);

    return (
        <div className={styles['guide-page']}>
            <div className={styles['ambient-orb-a']} />
            <div className={styles['ambient-orb-b']} />

            <div className={styles['brand-header']}>
                <img src={APP_LOGO} className={styles['brand-logo']} alt="Caught in 4K" />
            </div>

            <Button className={styles['back-btn']} onClick={() => navigateToAppHref('/profiles')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
            </Button>

            <div className={styles['guide-shell']}>
                <header className={styles['guide-hero']}>
                    <span className={styles['eyebrow']}>The Guide</span>
                    <h1 className={styles['hero-title']}>Set up Stremio like a pro.</h1>
                    <p className={styles['hero-copy']}>
                        A single, plain-English walkthrough built from the best community guides — debrid, add-ons,
                        AIOStreams and player settings — plus an interactive wizard that does the thinking for you.
                    </p>
                </header>

                {guideUnlocked ? (
                    <React.Fragment>
                        <div className={styles['wizard-launch']}>
                            <div>
                                <h2 className={styles['wizard-launch-title']}>Prefer step-by-step?</h2>
                                <p className={styles['wizard-launch-copy']}>
                                    The wizard walks you through setup one step at a time — starting with your Stremio
                                    account — and links back here for the full detail on each step.
                                </p>
                            </div>
                            <Button className={styles['wizard-launch-btn']} onClick={() => navigateToAppHref('/wizard')}>
                                Launch the Wizard
                            </Button>
                        </div>

                        <div className={styles['section-toolbar']}>
                            <h2 className={styles['section-toolbar-title']}>The full guide</h2>
                            <button type="button" className={styles['expand-all-btn']} onClick={toggleAll}>
                                {allExpanded ? 'Collapse all' : 'Expand all'}
                            </button>
                        </div>

                        <div className={styles['section-grid']}>
                            {GUIDE_CONTENT.map((section, index) => (
                                <GuideSection
                                    key={section.id}
                                    section={section}
                                    index={index}
                                    expanded={expandedIds.has(section.id)}
                                    onToggle={onToggle}
                                />
                            ))}
                        </div>

                        <div className={styles['setup-banner']}>
                            <div>
                                <h2 className={styles['setup-banner-title']}>Want us to set it up for you?</h2>
                                <p className={styles['setup-banner-copy']}>
                                    Skip the steps — we provision the account and hand you a login. {SETUP_SERVICE.price} one-time.
                                </p>
                            </div>
                            <Button className={styles['setup-banner-btn']} onClick={() => navigateToAppHref('/setup')}>
                                Done-for-you setup
                            </Button>
                        </div>

                        <p className={styles['content-note']}>
                            Built from Viren070&apos;s Guides and the numb3rs Perfect Setup guide. Use the Wizard above for
                            the guided path.
                        </p>
                    </React.Fragment>
                ) : (
                    <div className={styles['paywall']}>
                        <div className={styles['paywall-card']}>
                            <span className={styles['paywall-price']}>{GUIDE_PRODUCT.price}</span>
                            <h2 className={styles['paywall-title']}>{GUIDE_PRODUCT.name}</h2>
                            <p className={styles['paywall-tagline']}>{GUIDE_PRODUCT.tagline}</p>
                            <p className={styles['paywall-price']}>
                                <span className={styles['paywall-price-amount']}>{GUIDE_PRODUCT.price}</span>
                                <span className={styles['paywall-price-unit']}>one-time · yours forever</span>
                            </p>
                            <ul className={styles['paywall-list']}>
                                <li>Every step, in order — no guesswork</li>
                                <li>Interactive setup wizard</li>
                                <li>Debrid, add-ons, AIOStreams & player settings</li>
                                <li>One-time payment, keep it forever</li>
                            </ul>

                            {checkoutSuccess && isLoggedIn ? (
                                <p className={styles['paywall-fineprint']} role="status">
                                    {unlockTimedOut
                                        ? 'Payment received, but unlocking is taking longer than usual. Refresh this page in a moment — if it still doesn’t unlock, contact us and we’ll sort it out.'
                                        : 'Payment received — unlocking your guide. This can take a few seconds.'}
                                </p>
                            ) : null}

                            {isLoggedIn ? (
                                <Button
                                    className={styles['paywall-btn']}
                                    onClick={startGuideCheckout}
                                    disabled={checkoutLoading}
                                >
                                    {checkoutLoading ? 'Redirecting to checkout…' : `Unlock for ${GUIDE_PRODUCT.price}`}
                                </Button>
                            ) : (
                                <form className={styles['paywall-auth']} onSubmit={handleAuth}>
                                    <input
                                        className={styles['paywall-input']}
                                        type="email"
                                        placeholder="Email"
                                        aria-label="Email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className={styles['paywall-password']}>
                                        <input
                                            className={styles['paywall-input']}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password"
                                            aria-label="Password"
                                            autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            className={styles['paywall-password-toggle']}
                                            onClick={() => setShowPassword((value) => !value)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <button className={styles['paywall-btn']} type="submit" disabled={authLoading}>
                                        {authLoading ? 'Please wait…' : authMode === 'signup' ? 'Create account to buy' : 'Sign in to buy'}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles['paywall-auth-toggle']}
                                        onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                                    >
                                        {authMode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                                    </button>
                                </form>
                            )}

                            {checkoutError ? <p className={styles['paywall-error']} role="alert">{checkoutError}</p> : null}

                            <p className={styles['paywall-fineprint']}>
                                Already paid? It unlocks automatically once your purchase is confirmed.
                            </p>
                        </div>

                        <button
                            type="button"
                            className={styles['setup-crosslink']}
                            onClick={() => navigateToAppHref('/setup')}
                        >
                            <span className={styles['setup-crosslink-label']}>Rather not do it yourself?</span>
                            <span className={styles['setup-crosslink-cta']}>
                                Get the done-for-you setup for {SETUP_SERVICE.price}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

GuideSection.propTypes = {
    section: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        intro: PropTypes.string,
        steps: PropTypes.arrayOf(PropTypes.string),
        notes: PropTypes.arrayOf(PropTypes.string),
        links: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            url: PropTypes.string,
        })),
        wizardStep: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    expanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

module.exports = Guide;

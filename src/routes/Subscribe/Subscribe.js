// Copyright (C) 2024 Caught In 4K

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { navigateToAppHref } = require('stremio/common/navigation');
const { useAuth } = require('stremio/common/AuthProvider');
const { resolveApiBaseUrl } = require('stremio/common/apiBaseUrl');
const {
    buildCheckoutSessionRequest,
    CHECKOUT_STATUS_REFRESH_INTERVAL_MS,
    MAX_CHECKOUT_STATUS_REFRESH_ATTEMPTS,
    shouldContinueCheckoutRefresh,
} = require('stremio/common/subscriptionCheckout');
const { isSupabaseConfigured } = require('stremio/common/supabaseClient');
const {
    DEFAULT_SUBSCRIPTION_PLAN_ID,
    SUBSCRIPTION_PLANS,
    getSubscriptionPlan,
    resolveSubscriptionPlanId,
} = require('stremio/common/subscriptionPlans');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

const readCheckoutState = () => {
    if (typeof window === 'undefined') {
        return { success: false, cancelled: false };
    }

    const searchParams = new URLSearchParams(window.location.search);
    return {
        success: searchParams.get('success') === '1',
        cancelled: searchParams.get('cancelled') === '1',
    };
};

const readSelectedPlan = () => {
    if (typeof window === 'undefined') {
        return DEFAULT_SUBSCRIPTION_PLAN_ID;
    }

    const searchParams = new URLSearchParams(window.location.search);
    return resolveSubscriptionPlanId(searchParams.get('plan')) || DEFAULT_SUBSCRIPTION_PLAN_ID;
};

const Subscribe = () => {
    const auth = useAuth();
    const [selectedPlan, setSelectedPlan] = React.useState(readSelectedPlan);
    const [loading, setLoading] = React.useState(false);
    const [authMode, setAuthMode] = React.useState('login');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [displayName, setDisplayName] = React.useState('');
    const [authError, setAuthError] = React.useState(null);
    const [authLoading, setAuthLoading] = React.useState(false);
    const [checkoutState] = React.useState(readCheckoutState);

    const isLoggedIn = auth && auth.session;
    const isAdmin = auth && auth.isAdmin;
    const isEntitled = auth && auth.isEntitled;
    const isSubscribed = auth && auth.isSubscribed;
    const isSuspended = auth && auth.isSuspended;
    const daysRemaining = auth ? auth.daysRemaining : 0;
    const isPending = auth && auth.profile && auth.profile.status === 'pending';
    const refreshProfile = auth ? auth.refreshProfile : null;
    const accessToken = auth && auth.session ? auth.session.access_token : '';
    const authConfigured = isSupabaseConfigured();
    const apiBaseUrl = React.useMemo(() => resolveApiBaseUrl(), []);
    const billingConfigured = typeof apiBaseUrl === 'string' && apiBaseUrl.length > 0;
    const subscriptionStateRef = React.useRef({ isSubscribed, isSuspended });
    const selectedPlanConfig = React.useMemo(() => {
        return getSubscriptionPlan(selectedPlan) || getSubscriptionPlan(DEFAULT_SUBSCRIPTION_PLAN_ID);
    }, [selectedPlan]);

    React.useEffect(() => {
        subscriptionStateRef.current = { isSubscribed, isSuspended };
    }, [isSubscribed, isSuspended]);

    React.useEffect(() => {
        if (!checkoutState.success || !refreshProfile || !isLoggedIn || isSubscribed || isSuspended) {
            return undefined;
        }

        let cancelled = false;
        let timerId = null;
        let attemptCount = 0;

        const refreshSubscriptionState = async () => {
            attemptCount += 1;

            try {
                await refreshProfile();
            } catch (error) {
                console.error('[Subscribe] Failed to refresh profile after checkout:', error);
            }

            const nextState = subscriptionStateRef.current;
            if (!cancelled && shouldContinueCheckoutRefresh({
                attemptCount,
                isSubscribed: nextState.isSubscribed,
                isSuspended: nextState.isSuspended,
                maxAttempts: MAX_CHECKOUT_STATUS_REFRESH_ATTEMPTS,
            })) {
                timerId = setTimeout(refreshSubscriptionState, CHECKOUT_STATUS_REFRESH_INTERVAL_MS);
            }
        };

        refreshSubscriptionState();

        return () => {
            cancelled = true;
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [checkoutState.success, isLoggedIn, isSubscribed, isSuspended, refreshProfile]);

    const handleAuth = React.useCallback(async (e) => {
        e.preventDefault();
        setAuthError(null);
        setAuthLoading(true);
        try {
            if (authMode === 'signup') {
                const { error } = await auth.signUp(email, password, displayName || email.split('@')[0]);
                if (error) throw error;
            } else {
                const { error } = await auth.signIn(email, password);
                if (error) throw error;
            }
        } catch (err) {
            setAuthError(err.message || 'Authentication failed');
        } finally {
            setAuthLoading(false);
        }
    }, [auth, authMode, email, password, displayName]);

    const handleCheckout = React.useCallback(async () => {
        if (!isLoggedIn || !selectedPlan) return;

        if (!billingConfigured) {
            setAuthError('Billing is not connected on this build yet.');
            return;
        }

        if (!accessToken) {
            setAuthError('Please sign in again before checkout.');
            return;
        }

        setLoading(true);
        try {
            const request = buildCheckoutSessionRequest({
                accessToken,
                apiBaseUrl,
                plan: selectedPlan,
            });
            const resp = await fetch(request.url, request.options);

            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || 'Unable to start checkout');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session');
            }
        } catch (err) {
            setAuthError(err.message);
        } finally {
            setLoading(false);
        }
    }, [accessToken, apiBaseUrl, billingConfigured, isLoggedIn, selectedPlan]);

    return (
        <div className={styles['subscribe-page']}>
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

            <div className={styles['subscribe-shell']}>
                <section className={styles['story-panel']}>
                    <span className={styles['eyebrow']}>Premium Access</span>
                    <h1 className={styles['hero-title']}>Keep C4K unlocked.</h1>
                    <p className={styles['hero-copy']}>
                        Fixed-term access, a visible countdown on your profile, and a cleaner handoff between approval and billing.
                    </p>

                    <div className={styles['hero-metrics']}>
                        <div className={styles['metric-card']}>
                            <span className={styles['metric-label']}>Current pick</span>
                            <strong className={styles['metric-value']}>{selectedPlanConfig.label}</strong>
                        </div>
                        <div className={styles['metric-card']}>
                            <span className={styles['metric-label']}>Duration</span>
                            <strong className={styles['metric-value']}>{selectedPlanConfig.durationLabel}</strong>
                        </div>
                        <div className={styles['metric-card']}>
                            <span className={styles['metric-label']}>Approval</span>
                            <strong className={styles['metric-value']}>Admin reviewed</strong>
                        </div>
                    </div>

                    <div className={styles['plan-spotlight']}>
                        <div className={styles['spotlight-head']}>
                            <span className={styles['spotlight-kicker']}>{selectedPlanConfig.badge || 'Flexible pick'}</span>
                            <strong className={styles['spotlight-price']}>{selectedPlanConfig.price}</strong>
                        </div>
                        <p className={styles['spotlight-copy']}>
                            Pick a fixed term, let approval clear, and the remaining days stay visible from the profile selector.
                        </p>
                    </div>

                    <ul className={styles['feature-list']}>
                        <li>Fixed-term access with no hidden pricing changes.</li>
                        <li>Profile countdown stays visible after payment clears.</li>
                        <li>Curated source access stays under admin control.</li>
                    </ul>
                </section>

                <section className={styles['action-panel']}>
                    {checkoutState.success ? (
                        <div className={classnames(styles['status-banner'], styles['status-success'])}>
                            Payment received. Access can take a few seconds to refresh.
                        </div>
                    ) : null}
                    {checkoutState.cancelled ? (
                        <div className={classnames(styles['status-banner'], styles['status-neutral'])}>
                            Checkout was cancelled. Your access has not changed.
                        </div>
                    ) : null}

                    {!authConfigured ? (
                        <div className={styles['config-section']}>
                            <h2 className={styles['heading']}>Live Preview Mode</h2>
                            <p className={styles['sub-text']}>
                                This build can show the pricing and layout, but auth is not connected yet.
                            </p>

                            <div className={styles['plans-grid']}>
                                {SUBSCRIPTION_PLANS.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={classnames(styles['plan-card'], {
                                            [styles['selected']]: selectedPlan === plan.id,
                                            [styles['popular']]: plan.badge === 'Popular',
                                        })}
                                        onClick={() => setSelectedPlan(plan.id)}
                                    >
                                        {plan.badge && <span className={styles['plan-badge']}>{plan.badge}</span>}
                                        <h3 className={styles['plan-label']}>{plan.label}</h3>
                                        <div className={styles['plan-price']}>
                                            <span className={styles['price-amount']}>{plan.price}</span>
                                            <span className={styles['price-period']}>{plan.period}</span>
                                        </div>
                                        {plan.savings && <span className={styles['plan-savings']}>{plan.savings}</span>}
                                    </div>
                                ))}
                            </div>

                            <div className={styles['config-note']}>
                                Add the Supabase and billing env values to the Pages build when you are ready to activate it.
                            </div>
                        </div>
                    ) : isSubscribed ? (
                        <div className={styles['subscribed-section']}>
                            <div className={styles['check-icon']}>&#10003;</div>
                            <h2 className={styles['heading']}>Access is live</h2>
                            <p className={styles['sub-text']}>{daysRemaining} days remaining on your current term.</p>
                            <Button className={styles['back-home-btn']} onClick={() => navigateToAppHref('/')}>
                                Go Home
                            </Button>
                        </div>
                    ) : isAdmin && isEntitled ? (
                        <div className={styles['subscribed-section']}>
                            <div className={styles['check-icon']}>&#10003;</div>
                            <h2 className={styles['heading']}>Admin access is live</h2>
                            <p className={styles['sub-text']}>
                                Your admin account stays entitled without a paid countdown. Use the dashboard to manage member access.
                            </p>
                            <Button className={styles['back-home-btn']} onClick={() => navigateToAppHref('/admin')}>
                                Open Admin
                            </Button>
                        </div>
                    ) : isSuspended ? (
                        <div className={styles['pending-section']}>
                            <div className={styles['pending-icon']}>&#9888;</div>
                            <h2 className={styles['heading']}>Access Paused</h2>
                            <p className={styles['sub-text']}>
                                Your account is currently suspended. Reach out to the admin before trying to start a new term.
                            </p>
                            <Button className={styles['back-home-btn']} onClick={() => navigateToAppHref('/')}>
                                Go Home
                            </Button>
                        </div>
                    ) : !isLoggedIn ? (
                        <div className={styles['auth-section']}>
                            <h2 className={styles['heading']}>
                                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                            </h2>
                            <p className={styles['sub-text']}>
                                {authMode === 'signup'
                                    ? 'Create your account first, then choose the fixed term that fits.'
                                        : 'Sign in to continue with approval and billing.'}
                            </p>

                            <form className={styles['auth-form']} onSubmit={handleAuth}>
                                {authMode === 'signup' ? (
                                    <input
                                        className={styles['auth-input']}
                                        type="text"
                                        placeholder="Display Name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        maxLength={30}
                                    />
                                ) : null}
                                <input
                                    className={styles['auth-input']}
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <input
                                    className={styles['auth-input']}
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                                {authError ? <p className={styles['error-text']}>{authError}</p> : null}
                                <button
                                    className={styles['auth-submit-btn']}
                                    type="submit"
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                                </button>
                            </form>

                            <p className={styles['auth-toggle']}>
                                {authMode === 'signup' ? 'Already have an account? ' : 'Need an account? '}
                                <span
                                    className={styles['auth-toggle-link']}
                                    onClick={() => {
                                        setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                                        setAuthError(null);
                                    }}
                                >
                                    {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
                                </span>
                            </p>
                        </div>
                    ) : isPending ? (
                        <div className={styles['pending-section']}>
                            <div className={styles['pending-icon']}>&#9203;</div>
                            <h2 className={styles['heading']}>Approval Pending</h2>
                            <p className={styles['sub-text']}>
                                Your account is waiting for admin review. Billing opens once approval is in place.
                            </p>
                            <Button className={styles['back-home-btn']} onClick={() => navigateToAppHref('/')}>
                                Go Home
                            </Button>
                        </div>
                    ) : (
                        <div className={styles['plans-section']}>
                            <h2 className={styles['heading']}>Choose Your Term</h2>
                            <p className={styles['sub-text']}>All plans are fixed-term and start counting down after payment clears.</p>

                            <div className={styles['plans-grid']}>
                                {SUBSCRIPTION_PLANS.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={classnames(styles['plan-card'], {
                                            [styles['selected']]: selectedPlan === plan.id,
                                            [styles['popular']]: plan.badge === 'Popular',
                                        })}
                                        onClick={() => setSelectedPlan(plan.id)}
                                    >
                                        {plan.badge && <span className={styles['plan-badge']}>{plan.badge}</span>}
                                        <h3 className={styles['plan-label']}>{plan.label}</h3>
                                        <div className={styles['plan-price']}>
                                            <span className={styles['price-amount']}>{plan.price}</span>
                                            <span className={styles['price-period']}>{plan.period}</span>
                                        </div>
                                        {plan.savings && <span className={styles['plan-savings']}>{plan.savings}</span>}
                                    </div>
                                ))}
                            </div>

                            {!billingConfigured ? (
                                <div className={styles['config-note']}>
                                    Billing needs an external API host on this build. The static Pages site can show the UI, but checkout stays disabled until that host is configured.
                                </div>
                            ) : null}
                            {authError ? <p className={styles['error-text']}>{authError}</p> : null}

                            <Button
                                className={styles['checkout-btn']}
                                onClick={handleCheckout}
                                disabled={loading || !billingConfigured}
                            >
                                {loading ? 'Redirecting to checkout...' : billingConfigured ? 'Continue to Checkout' : 'Billing Unavailable'}
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

module.exports = Subscribe;

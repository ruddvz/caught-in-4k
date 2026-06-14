// Copyright (C) 2026 Caught in 4K
//
// Interactive Stremio setup wizard. Same paywall as the Guide hub. This is the
// step framework — each step carries source-accurate, high-level guidance with
// room for detailed copy in a follow-up content pass.

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { navigateToAppHref } = require('stremio/common/navigation');
const { useAuth } = require('stremio/common/AuthProvider');
const {
    GUIDE_PRODUCT,
    getGuideAccessState,
} = require('stremio/common/guideAccess');
const { requestGuideSection, consumeWizardStep } = require('stremio/common/guideWizardLink');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

// "Full details in the Guide →" link rendered under a wizard step. Stashes the
// target section and navigates to the Guide, which expands + scrolls to it.
const GuideDetailLink = ({ sectionId }) => (
    <button
        type="button"
        className={styles['step-guide-link']}
        onClick={() => {
            requestGuideSection(sectionId);
            navigateToAppHref('/guide');
        }}
    >
        Full details in the Guide
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    </button>
);

// Debrid options surfaced in the wizard. Kept high-level; the wizard links out
// to each provider rather than asserting exact, version-specific steps.
const DEBRID_OPTIONS = [
    { id: 'real-debrid', name: 'Real-Debrid', note: 'Most popular. One concurrent connection.' },
    { id: 'torbox', name: 'TorBox', note: 'Great for households; safe parallel streaming.' },
    { id: 'alldebrid', name: 'AllDebrid', note: 'Solid alternative provider.' },
    { id: 'premiumize', name: 'Premiumize', note: 'Debrid plus usenet support.' },
];

const Wizard = () => {
    const auth = useAuth();
    const isAdmin = Boolean(auth && auth.isAdmin);
    const profile = auth ? auth.profile : null;
    const { guideUnlocked } = getGuideAccessState({ isAdmin, profile });

    const WIZARD_STATE_KEY = 'c4k_wizard_state_v2';
    const readSavedState = () => {
        if (typeof localStorage === 'undefined') {
            return { step: 0, debrid: null };
        }
        try {
            const raw = localStorage.getItem(WIZARD_STATE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === 'object'
                ? { step: Number(parsed.step) || 0, debrid: parsed.debrid || null }
                : { step: 0, debrid: null };
        } catch (_e) {
            return { step: 0, debrid: null };
        }
    };

    const [stepIndex, setStepIndex] = React.useState(() => readSavedState().step);
    const [debrid, setDebrid] = React.useState(() => readSavedState().debrid);

    React.useEffect(() => {
        if (typeof localStorage === 'undefined') {
            return;
        }
        try {
            localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify({ step: stepIndex, debrid }));
        } catch (_e) {
            // ignore persistence failures
        }
    }, [stepIndex, debrid]);

    // Steps are defined inside the component so they can read selection state.
    const steps = React.useMemo(() => [
        {
            id: 'account',
            title: 'Create your Stremio account',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        Everything syncs to a single Stremio account, so start by creating one with the email and
                        password you want to use.
                    </p>
                    <ol className={styles['ordered-list']}>
                        <li>Go to stremio.com and sign up with your email and a password.</li>
                        <li><strong>Verify your email</strong> — open the confirmation message Stremio sends and click the link.</li>
                        <li>Sign in with that account; you&apos;ll use the same one on every device.</li>
                    </ol>
                    <div className={styles['callout']}>
                        Verifying your email matters: unverified accounts can be limited or suspended by the provider,
                        which interrupts streaming. Do it once now and you&apos;re set.
                    </div>
                    <div className={styles['step-actions']}>
                        <a
                            className={styles['step-external-link']}
                            href="https://www.stremio.com/register"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Create a Stremio account ↗
                        </a>
                        <GuideDetailLink sectionId="install-stremio" />
                    </div>
                </div>
            ),
        },
        {
            id: 'install',
            title: 'Install the Stremio apps',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        Install Stremio on your devices and sign in with that same account everywhere so your add-ons
                        and library stay in sync.
                    </p>
                    <ul className={styles['check-list']}>
                        <li>iPhone &amp; iPad</li>
                        <li>Android phones, tablets &amp; TV</li>
                        <li>Apple TV</li>
                        <li>Windows, macOS &amp; Linux</li>
                        <li>Any browser via Stremio Web — no install needed</li>
                    </ul>
                    <p className={styles['step-hint']}>Tip: do the first-time setup on a laptop or desktop, then just sign in elsewhere.</p>
                    <div className={styles['step-actions']}>
                        <a
                            className={styles['step-external-link']}
                            href="https://www.stremio.com/downloads"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Stremio downloads ↗
                        </a>
                        <GuideDetailLink sectionId="install-stremio" />
                    </div>
                </div>
            ),
        },
        {
            id: 'debrid',
            title: 'Set up a debrid service',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        A debrid service is what gives you fast, high-quality cached streams. Pick one to continue,
                        then sign up, <strong>verify its email too</strong>, and copy your API key.
                    </p>
                    <div className={styles['option-grid']}>
                        {DEBRID_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className={classnames(styles['option-card'], { [styles['option-selected']]: debrid === option.id })}
                                onClick={() => setDebrid(option.id)}
                                aria-pressed={debrid === option.id}
                            >
                                <span className={styles['option-name']}>{option.name}</span>
                                <span className={styles['option-note']}>{option.note}</span>
                                {debrid === option.id ? (
                                    <span className={styles['option-check']} aria-hidden="true">✓</span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                    <p className={styles['step-hint']}>
                        Keep your API key handy — the next step pastes it into your add-ons.
                    </p>
                    <div className={styles['step-actions']}>
                        <GuideDetailLink sectionId="choose-debrid" />
                    </div>
                </div>
            ),
        },
        {
            id: 'addons',
            title: 'Install add-ons (AIOStreams)',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        Add-ons are the streaming sources. The simplest route is AIOStreams — one super-addon that
                        consolidates multiple sources and your debrid key in a single configurable place.
                    </p>
                    <ul className={styles['check-list']}>
                        <li>Configure AIOStreams with your debrid API key</li>
                        <li>Prefer cached, high-quality links</li>
                        <li>Install the generated add-on into Stremio (signed in at web.stremio.com)</li>
                    </ul>
                    {debrid ? (
                        <p className={styles['step-hint']}>You&apos;ll paste the API key from your selected provider here.</p>
                    ) : (
                        <p className={styles['step-hint']}>Go back a step to pick a debrid service first.</p>
                    )}
                    <div className={styles['step-actions']}>
                        <GuideDetailLink sectionId="install-addons" />
                    </div>
                </div>
            ),
        },
        {
            id: 'done',
            title: 'You\'re set',
            render: () => (
                <div className={styles['step-body']}>
                    <div className={styles['done-icon']} aria-hidden="true">✓</div>
                    <p className={styles['step-lead']}>
                        That&apos;s the core setup. Open Stremio, search a title, and pick a high-quality stream. Fine-tune
                        resolution and language in the player settings whenever you like.
                    </p>
                    <Button className={styles['done-btn']} onClick={() => navigateToAppHref('/guide')}>
                        Back to the Guide
                    </Button>
                </div>
            ),
        },
    ], [debrid]);

    // Honour a "jump to this step" request handed over from the Guide.
    React.useEffect(() => {
        const target = consumeWizardStep();
        if (!target) return;
        const targetIndex = steps.findIndex((step) => step.id === target);
        if (targetIndex >= 0) {
            setStepIndex(targetIndex);
        }
    }, []);

    const totalSteps = steps.length;
    // Clamp the (possibly stale/persisted) index so an out-of-range value from
    // localStorage can never render an undefined step and crash.
    const safeStepIndex = Math.max(0, Math.min(stepIndex, totalSteps - 1));
    const currentStep = steps[safeStepIndex];
    const progress = Math.round(((safeStepIndex + 1) / totalSteps) * 100);
    // The debrid step tells the user to "pick one to continue" — enforce it.
    const canProceed = currentStep.id !== 'debrid' || Boolean(debrid);

    if (!guideUnlocked) {
        return (
            <div className={styles['wizard-page']}>
                <div className={styles['locked-card']}>
                    <h1 className={styles['locked-title']}>The Wizard is part of the Guide</h1>
                    <p className={styles['locked-copy']}>
                        Unlock the {GUIDE_PRODUCT.name} for {GUIDE_PRODUCT.price} to use the interactive setup wizard.
                    </p>
                    <Button className={styles['locked-btn']} onClick={() => navigateToAppHref('/guide')}>
                        View the Guide
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['wizard-page']}>
            <div className={styles['brand-header']}>
                <img src={APP_LOGO} className={styles['brand-logo']} alt="Caught in 4K" />
            </div>

            <Button className={styles['back-btn']} onClick={() => navigateToAppHref('/guide')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Guide
            </Button>

            <div className={styles['wizard-shell']}>
                <div className={styles['progress-row']}>
                    <span className={styles['progress-label']}>Step {safeStepIndex + 1} of {totalSteps}</span>
                    <div className={styles['progress-track']}>
                        <div className={styles['progress-fill']} style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <h1 className={styles['wizard-title']}>{currentStep.title}</h1>
                {currentStep.render()}

                <div className={styles['nav-row']}>
                    <button
                        type="button"
                        className={styles['nav-back']}
                        disabled={safeStepIndex === 0}
                        onClick={() => setStepIndex(Math.max(0, safeStepIndex - 1))}
                    >
                        Back
                    </button>
                    {safeStepIndex < totalSteps - 1 ? (
                        <button
                            type="button"
                            className={styles['nav-next']}
                            disabled={!canProceed}
                            onClick={() => setStepIndex(Math.min(totalSteps - 1, safeStepIndex + 1))}
                        >
                            Next
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

module.exports = Wizard;

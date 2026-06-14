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
    SETUP_SERVICE,
    getGuideAccessState,
} = require('stremio/common/guideAccess');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

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

    const [stepIndex, setStepIndex] = React.useState(0);
    const [debrid, setDebrid] = React.useState(null);

    // Steps are defined inside the component so they can read selection state.
    const steps = React.useMemo(() => [
        {
            id: 'welcome',
            title: 'Welcome',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        In a few steps you&apos;ll have Stremio streaming in high quality on every device. First, how
                        do you want to do this?
                    </p>
                    <div className={styles['path-grid']}>
                        <div className={styles['path-card']}>
                            <h3 className={styles['path-title']}>Do it myself</h3>
                            <p className={styles['path-copy']}>Follow the wizard and set everything up on your own account.</p>
                            <span className={styles['path-price']}>Included with the {GUIDE_PRODUCT.price} guide</span>
                            <Button className={styles['path-btn']} onClick={() => setStepIndex(1)}>
                                Continue
                            </Button>
                        </div>
                        <div className={classnames(styles['path-card'], styles['path-card-alt'])}>
                            <h3 className={styles['path-title']}>Set it up for me</h3>
                            <p className={styles['path-copy']}>We provision the account and hand you a login. Just sign in and watch.</p>
                            <span className={styles['path-price']}>{SETUP_SERVICE.price} one-time</span>
                            <Button
                                className={classnames(styles['path-btn'], styles['path-btn-ghost'])}
                                onClick={() => navigateToAppHref('/setup')}
                            >
                                See setup service
                            </Button>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'install',
            title: 'Install Stremio',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        Install the Stremio app and sign in with one account so your add-ons and library sync everywhere.
                    </p>
                    <ul className={styles['check-list']}>
                        <li>iPhone &amp; iPad</li>
                        <li>Android phones, tablets &amp; TV</li>
                        <li>Apple TV</li>
                        <li>Windows, macOS &amp; Linux</li>
                        <li>Any browser via Stremio Web</li>
                    </ul>
                    <p className={styles['step-hint']}>Use the same email on every device — that&apos;s what keeps things in sync.</p>
                </div>
            ),
        },
        {
            id: 'debrid',
            title: 'Choose a Debrid Service',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        A debrid service is what gives you fast, high-quality cached streams. Pick one to continue.
                    </p>
                    <div className={styles['option-grid']}>
                        {DEBRID_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className={classnames(styles['option-card'], { [styles['option-selected']]: debrid === option.id })}
                                onClick={() => setDebrid(option.id)}
                            >
                                <span className={styles['option-name']}>{option.name}</span>
                                <span className={styles['option-note']}>{option.note}</span>
                            </button>
                        ))}
                    </div>
                    <p className={styles['step-hint']}>
                        After signing up, you&apos;ll copy your provider&apos;s API key — the next step uses it.
                    </p>
                </div>
            ),
        },
        {
            id: 'addons',
            title: 'Install Add-ons',
            render: () => (
                <div className={styles['step-body']}>
                    <p className={styles['step-lead']}>
                        Add-ons are the streaming sources. The simplest route is AIOStreams — one super-addon that
                        consolidates multiple sources and your debrid key in a single configurable place.
                    </p>
                    <ul className={styles['check-list']}>
                        <li>Configure AIOStreams with your debrid API key</li>
                        <li>Prefer cached, high-quality links</li>
                        <li>Install the generated add-on into Stremio</li>
                    </ul>
                    {debrid ? (
                        <p className={styles['step-hint']}>You&apos;ll paste the API key from your selected provider here.</p>
                    ) : (
                        <p className={styles['step-hint']}>Go back a step to pick a debrid service first.</p>
                    )}
                </div>
            ),
        },
        {
            id: 'done',
            title: 'You\'re set',
            render: () => (
                <div className={styles['step-body']}>
                    <div className={styles['done-icon']}>✓</div>
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

    const totalSteps = steps.length;
    const currentStep = steps[stepIndex];
    const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

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
                    <span className={styles['progress-label']}>Step {stepIndex + 1} of {totalSteps}</span>
                    <div className={styles['progress-track']}>
                        <div className={styles['progress-fill']} style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <h1 className={styles['wizard-title']}>{currentStep.title}</h1>
                {currentStep.render()}

                <div className={styles['nav-row']}>
                    <Button
                        className={styles['nav-back']}
                        disabled={stepIndex === 0}
                        onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                    >
                        Back
                    </Button>
                    {stepIndex < totalSteps - 1 ? (
                        <Button
                            className={styles['nav-next']}
                            onClick={() => setStepIndex((index) => Math.min(totalSteps - 1, index + 1))}
                        >
                            Next
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

module.exports = Wizard;

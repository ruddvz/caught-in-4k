// Copyright (C) 2026 Caught in 4K
//
// The Stremio Setup Guide hub. Sits behind the site-wide access-key gate and is
// additionally paywalled: members see the full guide + a wizard launcher once
// the $30 guide product is unlocked, otherwise a purchase panel.

const React = require('react');
const { Button } = require('stremio/components');
const { navigateToAppHref } = require('stremio/common/navigation');
const { useAuth } = require('stremio/common/AuthProvider');
const { GUIDE_PRODUCT, SETUP_SERVICE, getGuideAccessState } = require('stremio/common/guideAccess');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

// High-level, source-accurate section outline aggregated from the four guides.
// Detailed step-by-step copy is delivered through the Wizard and a follow-up
// content pass — these summaries stay deliberately high-level so nothing is
// stated incorrectly.
const GUIDE_SECTIONS = [
    {
        id: 'beginner-concepts',
        title: 'Beginner Concepts',
        summary: 'What Stremio is, what a debrid service does, and how add-ons turn it into an on-demand streaming experience.',
    },
    {
        id: 'install-stremio',
        title: 'Install Stremio',
        summary: 'Get the app on every device — iPhone, Android, Apple TV, web and desktop — and sign in to one account.',
    },
    {
        id: 'choose-debrid',
        title: 'Choose a Debrid Service',
        summary: 'Compare the common providers (Real-Debrid, TorBox, AllDebrid, Premiumize) and grab your API key.',
    },
    {
        id: 'install-addons',
        title: 'Install Add-ons',
        summary: 'Add the streaming sources and wire your debrid key in so you get fast, high-quality cached links.',
    },
    {
        id: 'aiostreams',
        title: 'AIOStreams — All-in-One',
        summary: 'Consolidate multiple add-ons and debrid services into a single, highly customisable super-addon.',
    },
    {
        id: 'player-quality',
        title: 'Player & Quality',
        summary: 'Tune resolution, preferred languages and playback so you reliably get the best stream available.',
    },
    {
        id: 'troubleshooting',
        title: 'Configuration Q&A',
        summary: 'The most common setup questions and fixes, so a stuck step never ends your setup.',
    },
];

const Guide = () => {
    const auth = useAuth();
    const isAdmin = Boolean(auth && auth.isAdmin);
    const profile = auth ? auth.profile : null;
    const { guideUnlocked } = getGuideAccessState({ isAdmin, profile });

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
                                <h2 className={styles['wizard-launch-title']}>Not sure where to start?</h2>
                                <p className={styles['wizard-launch-copy']}>
                                    Answer a few questions and the wizard builds your setup path step by step.
                                </p>
                            </div>
                            <Button className={styles['wizard-launch-btn']} onClick={() => navigateToAppHref('/wizard')}>
                                Launch the Wizard
                            </Button>
                        </div>

                        <div className={styles['section-grid']}>
                            {GUIDE_SECTIONS.map((section, index) => (
                                <article key={section.id} className={styles['section-card']}>
                                    <span className={styles['section-index']}>{String(index + 1).padStart(2, '0')}</span>
                                    <h3 className={styles['section-title']}>{section.title}</h3>
                                    <p className={styles['section-summary']}>{section.summary}</p>
                                </article>
                            ))}
                        </div>

                        <p className={styles['content-note']}>
                            Full step-by-step instructions for each section are being added. Use the Wizard above for the
                            guided path in the meantime.
                        </p>
                    </React.Fragment>
                ) : (
                    <div className={styles['paywall']}>
                        <div className={styles['paywall-card']}>
                            <span className={styles['paywall-price']}>{GUIDE_PRODUCT.price}</span>
                            <h2 className={styles['paywall-title']}>{GUIDE_PRODUCT.name}</h2>
                            <p className={styles['paywall-tagline']}>{GUIDE_PRODUCT.tagline}</p>
                            <ul className={styles['paywall-list']}>
                                <li>Every step, in order — no guesswork</li>
                                <li>Interactive setup wizard</li>
                                <li>Debrid, add-ons, AIOStreams & player settings</li>
                                <li>One-time payment, keep it forever</li>
                            </ul>
                            <Button
                                className={styles['paywall-btn']}
                                onClick={() => navigateToAppHref('/subscribe?product=guide')}
                            >
                                Unlock for {GUIDE_PRODUCT.price}
                            </Button>
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

module.exports = Guide;

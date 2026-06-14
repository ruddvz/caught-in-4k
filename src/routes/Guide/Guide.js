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
const { GUIDE_PRODUCT, SETUP_SERVICE, getGuideAccessState } = require('stremio/common/guideAccess');
const { GUIDE_CONTENT } = require('stremio/common/guideContent');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

const GuideSection = ({ section, index, expanded, onToggle }) => {
    const hasDetail = (section.steps && section.steps.length > 0) ||
        (section.notes && section.notes.length > 0) ||
        (section.links && section.links.length > 0);

    return (
        <article className={classnames(styles['section-card'], { [styles['section-open']]: expanded })}>
            <button
                type="button"
                className={styles['section-header']}
                onClick={() => onToggle(section.id)}
                aria-expanded={expanded}
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
                <div className={styles['section-detail']}>
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
                </div>
            ) : null}
        </article>
    );
};

const Guide = () => {
    const auth = useAuth();
    const isAdmin = Boolean(auth && auth.isAdmin);
    const profile = auth ? auth.profile : null;
    const { guideUnlocked } = getGuideAccessState({ isAdmin, profile });

    const [expandedId, setExpandedId] = React.useState(null);
    const onToggle = React.useCallback((id) => {
        setExpandedId((current) => (current === id ? null : id));
    }, []);

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
                            {GUIDE_CONTENT.map((section, index) => (
                                <GuideSection
                                    key={section.id}
                                    section={section}
                                    index={index}
                                    expanded={expandedId === section.id}
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
    }).isRequired,
    index: PropTypes.number.isRequired,
    expanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

module.exports = Guide;

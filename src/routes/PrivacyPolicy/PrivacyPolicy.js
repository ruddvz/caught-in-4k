// Copyright (C) Caught in 4K

const React = require('react');
const { HorizontalNavBar } = require('stremio/components');
const styles = require('./styles');

const PrivacyPolicy = () => {
    return (
        <div className={styles['legal-container']}>
            <HorizontalNavBar
                className={styles['nav-bar']}
                backButton={true}
            />
            <div className={styles['legal-content']}>
                <h1 className={styles['legal-title']}>Privacy Policy (We Actually Care)</h1>
                <p className={styles['legal-effective']}>Effective as of 30 August 2020 — and we mean it</p>

                <h2 className={styles['section-title']}>1. The Intro (Please Read This Part fr)</h2>
                <p>
                    At <strong>Caught in 4K</strong>, your privacy isn't just a legal checkbox — it's actually important to us, no cap.
                    This Privacy Policy ("Policy") covers everything we do with your data across the Caught in 4K platform ("Platform"),
                    including our web app and all Services. By using any of our Services, you're agreeing to this Policy. That's the deal.
                </p>
                <p>
                    Questions? Concerns? Existential dread about data? Hit us up through the Settings page.
                </p>

                <h2 className={styles['section-title']}>2. The Terms (GDPR Did the Naming for Us)</h2>
                <p>
                    For the purposes of this Policy, personal data terms carry the meanings defined in the General Data Protection
                    Regulation (EC) 2016/679. Any other definitions follow our General Terms & Conditions. We didn't make this stuff up — it's EU law.
                </p>

                <h2 className={styles['section-title']}>3. What Data We Actually Collect (Be Real With You)</h2>
                <div className={styles['important-notice']}>
                    <strong>Real talk:</strong> We do NOT collect any history or logs of what addons or sources you use for streaming.
                    If you log in as a Guest User, we collect literally zero personal data. Ghost mode is valid here.
                </div>

                <p><strong>What you give us:</strong></p>
                <p>
                    When you make an account, we collect your email and password. Your email is for account recovery and support.
                    Your password is never stored in plain text — it's cryptographically hashed. We're not about that data breach life.
                </p>

                <p><strong>Log data (automatic stuff):</strong></p>
                <p>
                    When you use our Services, we automatically collect basic technical info — like your IP address, OS, device type,
                    and timestamps. This is to keep the platform running smoothly and securely. It's standard internet stuff, not surveillance.
                </p>

                <p><strong>Support convos:</strong></p>
                <p>
                    If you reach out to us for help, you might share your name, email, or other info. We use that to actually help you.
                    Not to sell to anyone. Not for ads. Just support.
                </p>

                <p><strong>Analytics:</strong></p>
                <p>
                    We collect anonymized, aggregated analytics to make the platform better. We can't personally identify you from this data —
                    it's just vibes and stats, not surveillance.
                </p>

                <p><strong>Third-party data (if applicable):</strong></p>
                <p>
                    We might get info from third-party sources (like if you used a social login) — but only with your authorization
                    and in line with applicable data protection laws. We're not out here behind your back.
                </p>

                <h2 className={styles['section-title']}>4. Your Data — Where It Lives & When We Delete It</h2>
                <p>
                    Your personal data is collected and stored within the European Economic Area (EEA). Once we no longer need it
                    (or once your retention period is up), we delete it — including backups — unless EU or Member State law says
                    we have to keep it longer. Keeping your data when we don't need it? Not the vibe.
                </p>
                <p>
                    We use proper technical and organizational measures for secure deletion. When it's gone, it's gone.
                </p>

                <h2 className={styles['section-title']}>5. Cookies (The Digital Kind)</h2>
                <p>
                    We use cookies — specifically Google Analytics and (historically) Facebook Pixel — to collect aggregated stats
                    like where users come from and how long they stick around. This is purely for making the platform better,
                    not for creeping on individual users. You're not a product. Promise.
                </p>

                <h2 className={styles['section-title']}>6. Your Rights (You Have More Power Than You Think)</h2>
                <p>Legally speaking, you have the right to:</p>
                <ul className={styles['legal-list']}>
                    <li>Access your personal data in a portable format (data portability era)</li>
                    <li>Withdraw your consent whenever consent was the basis for collection</li>
                    <li>Correct any inaccurate data we hold about you</li>
                    <li>Get a copy of your data in electronic format</li>
                    <li>Request full deletion of your personal data (the "right to be forgotten" — legally enforceable, not just vibes)</li>
                    <li>Know exactly how your data is being used</li>
                    <li>Delete your account at any time, no questions asked</li>
                    <li>Transfer your data to another service controller</li>
                    <li>File a complaint with a supervisory authority if you think we messed up</li>
                </ul>
                <p>
                    To use any of these rights, go to Settings or just delete your account from your profile page. We make it easy on purpose.
                </p>

                <h2 className={styles['section-title']}>7. Do We Share Your Data? (Short Answer: Basically No)</h2>
                <div className={styles['important-notice']}>
                    <strong>Let's be clear:</strong> We do NOT sell your data. We do NOT share your streaming history.
                    If you're a Guest, we collect nothing. That's not marketing speak — it's actually how we operate.
                </div>
                <p>
                    We don't share your personal info with third parties for their marketing purposes. Full stop.
                </p>
                <p>
                    We do work with certain trusted service providers to run the platform. They include:
                </p>
                <ul className={styles['legal-list']}>
                    <li>Google Analytics (usage stats)</li>
                    <li>BigQuery (data processing)</li>
                    <li>Sentry (error tracking so we can fix bugs)</li>
                    <li>YouTube (for content previews)</li>
                </ul>
                <p>
                    We may also share data with third parties when legally required — like to comply with a court order,
                    investigate a crime, protect safety, or during a merger/acquisition. These are the "we have to" situations,
                    not the "we want to" ones.
                </p>

                <h2 className={styles['section-title']}>8. Kids & Privacy (Not for Kids Under Legal Age)</h2>
                <p>
                    Our Services are not aimed at children under the age of legal capacity. We don't knowingly collect data from minors.
                    If you think we accidentally have data on a minor, contact us immediately and we'll delete it on the spot.
                    No questions, no delays.
                </p>

                <h2 className={styles['section-title']}>9. Security (We Take This Seriously)</h2>
                <p>
                    We use industry-standard security measures to protect your data: pseudonymization, encryption, hashed passwords,
                    SSL certificates, and strict access controls. Your data is handled by a minimal number of authorized personnel only.
                    We don't play around with security.
                </p>
                <p>
                    If there's ever a data breach (knock on wood), we will notify affected users and the relevant authorities
                    immediately and take every possible action to minimize harm. Transparency is non-negotiable.
                </p>

                <h2 className={styles['section-title']}>10. Delete Your Account (You Can Always Leave)</h2>
                <p>
                    Go to your profile settings and hit "Delete Account." It's permanent, irreversible, and we won't guilt-trip you
                    with a countdown timer or passive-aggressive "are you sure?" screens. If you're out, you're out. Respect.
                </p>

                <h2 className={styles['section-title']}>11. Contact (We're Real People)</h2>
                <p>
                    Got questions about this Policy? Reach out through the Settings page in the app. We actually read those messages.
                    Not a bot. Promise.
                </p>

                <div className={styles['legal-footer']}>
                    <p>Caught in 4K — your privacy is the main character here. 🔒✨</p>
                </div>
            </div>
        </div>
    );
};

module.exports = PrivacyPolicy;

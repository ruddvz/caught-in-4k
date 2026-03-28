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
                <h1 className={styles['legal-title']}>Privacy Policy</h1>
                <p className={styles['legal-effective']}>Effective date: August 30, 2020 — last reviewed March 2026</p>

                <p className={styles['legal-intro']}>
                    At <strong>Caught in 4K</strong>, your privacy is not a legal afterthought or a box we check reluctantly before shipping.
                    It is a genuine part of how we build and operate this platform. This Privacy Policy ("Policy") describes what data we
                    collect, why we collect it, how we protect it, and what rights you have over it — across the Caught in 4K web
                    application and all associated Services. By using the Services, you agree to this Policy. If you have questions,
                    reach out through the Settings page. We actually read those.
                </p>

                <h2 className={styles['section-title']}>1. Definitions</h2>

                <p>
                    Personal data terms used in this Policy carry the meanings defined under the General Data Protection Regulation
                    (EU) 2016/679 ("GDPR"). All other terms follow the definitions in our{' '}
                    <a href="#/tos" className={styles['inline-link']}>Terms of Service</a>.
                    We did not invent this terminology — it is EU law, and it applies here.
                </p>

                <h2 className={styles['section-title']}>2. Who This Policy Covers</h2>

                <p>
                    This Policy applies to all Users of the Caught in 4K platform — whether you are a Guest browsing without an account
                    or a Registered User with a full profile. The scope of data we collect differs by account type, as described below.
                </p>

                <h2 className={styles['section-title']}>3. What Data We Collect</h2>

                <div className={styles['important-notice']}>
                    <strong>Important:</strong> We do not collect or log any history of which Add-ons or content sources you use for streaming.
                    If you use the platform as a Guest, we collect no personal data whatsoever. Ghost mode is fully supported and respected.
                </div>

                <p><strong>Account data (Registered Users only):</strong></p>
                <p>
                    When you create an account, we collect your email address and password. Your email is used for account recovery and
                    support communications. Your password is never stored in plain text — it is cryptographically hashed. We have no
                    interest in knowing your password, and we have made it technically impossible for ourselves to do so.
                </p>

                <p><strong>Technical log data:</strong></p>
                <p>
                    When you interact with our Services, we automatically collect basic technical information such as your IP address,
                    operating system, device type, and session timestamps. This data is used to maintain platform stability and security.
                    It is standard infrastructure logging, not surveillance.
                </p>

                <p><strong>Support communications:</strong></p>
                <p>
                    If you contact us for support, you may share your name, email, or a description of your issue. We use this information
                    solely to respond to and resolve your request. It is not shared with third parties, sold, or used for advertising.
                </p>

                <p><strong>Analytics data:</strong></p>
                <p>
                    We collect anonymized, aggregated usage analytics to understand how the platform is used and where it can be improved.
                    This data cannot be traced back to you as an individual. It is about trends, not people.
                </p>

                <p><strong>Third-party authentication data (if applicable):</strong></p>
                <p>
                    If you authenticate through a third-party service, we may receive certain profile information from that provider —
                    but only with your explicit authorization and in compliance with applicable data protection law.
                </p>

                <h2 className={styles['section-title']}>4. Data Storage and Retention</h2>

                <p>
                    Your personal data is collected and stored within the European Economic Area (EEA). We retain data only for as long
                    as it is necessary to provide the Services or as required by applicable EU or Member State law. Once the retention
                    period expires, your data — including backups — is deleted using secure, industry-standard deletion procedures.
                    When it is gone, it is gone.
                </p>

                <h2 className={styles['section-title']}>5. Cookies</h2>

                <p>
                    We use cookies to collect aggregated, anonymized analytics — such as general traffic sources and session duration.
                    Current cookie providers include Google Analytics. This data is used strictly for platform improvement purposes.
                    You are not a product here. You are a user, and we intend to keep it that way.
                </p>

                <h2 className={styles['section-title']}>6. Your Rights Under GDPR</h2>

                <p>As a data subject under GDPR, you have the following rights:</p>
                <ul className={styles['legal-list']}>
                    <li>The right to access your personal data in a portable, machine-readable format</li>
                    <li>The right to withdraw consent at any time, where consent was the legal basis for processing</li>
                    <li>The right to rectify inaccurate or incomplete personal data we hold about you</li>
                    <li>The right to receive a copy of your data in a structured electronic format</li>
                    <li>The right to erasure — your data deleted, permanently, upon request (the "right to be forgotten")</li>
                    <li>The right to know exactly how your data is being used, and by whom</li>
                    <li>The right to delete your account at any time, without justification</li>
                    <li>The right to data portability — transferring your data to another controller</li>
                    <li>The right to lodge a complaint with a supervisory authority if you believe we have mishandled your data</li>
                </ul>
                <p>
                    To exercise any of these rights, go to your account settings or delete your account directly from your profile page.
                    We have made these actions straightforward on purpose.
                </p>

                <h2 className={styles['section-title']}>7. Data Sharing</h2>

                <div className={styles['important-notice']}>
                    <strong>To be direct:</strong> We do not sell your data. We do not share your streaming history with anyone.
                    If you use the platform as a Guest, we collect nothing. This is not marketing language — it is how we actually operate.
                </div>

                <p>
                    We do not share your personal information with third parties for their own marketing or commercial purposes. Full stop.
                </p>
                <p>
                    We work with a limited set of trusted service providers to operate the platform. These include:
                </p>
                <ul className={styles['legal-list']}>
                    <li>Google Analytics — aggregated usage statistics</li>
                    <li>BigQuery — data processing and analytics infrastructure</li>
                    <li>Sentry — error tracking to help us identify and fix bugs</li>
                    <li>YouTube — embedded content previews where applicable</li>
                </ul>
                <p>
                    We may also disclose data when legally required to do so — for example, to comply with a court order, cooperate
                    with a law enforcement investigation, protect the safety of users, or in connection with a corporate merger or
                    acquisition. These are obligations, not choices.
                </p>

                <h2 className={styles['section-title']}>8. Minors</h2>

                <p>
                    Our Services are not directed at children under the age of legal capacity. We do not knowingly collect personal
                    data from minors. If you believe we have inadvertently collected such data, please contact us immediately and
                    we will delete it without delay and without question.
                </p>

                <h2 className={styles['section-title']}>9. Security</h2>

                <p>
                    We implement industry-standard technical and organizational security measures to protect your data — including
                    pseudonymization, encryption at rest and in transit, cryptographically hashed passwords, SSL/TLS certificates,
                    and strict access controls. Your data is accessible only to a minimal number of authorized personnel.
                </p>
                <p>
                    In the unlikely event of a data breach, we will notify affected users and the relevant supervisory authority
                    promptly and transparently, and take all available steps to contain the damage. We do not bury incidents.
                    We address them.
                </p>

                <h2 className={styles['section-title']}>10. Account Deletion</h2>

                <p>
                    You may delete your account at any time by navigating to your profile settings and selecting "Delete Account."
                    Deletion is permanent and irreversible. We will not guilt-trip you with passive-aggressive confirmation dialogs
                    or countdown timers. If you are done, we respect that.
                </p>

                <h2 className={styles['section-title']}>11. Contact</h2>

                <p>
                    For questions, requests, or concerns about this Policy or how your data is handled, please reach out via the
                    Settings page in the application. You will be speaking with a real person, not an automated response system.
                </p>

                <div className={styles['legal-footer']}>
                    <p>Caught in 4K — your data is handled with the same care we give to a good film recommendation.</p>
                    <p>Also see our <a href="#/tos" className={styles['footer-legal-link']}>Terms of Service</a>.</p>
                </div>
            </div>
        </div>
    );
};

module.exports = PrivacyPolicy;

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
                <p className={styles['legal-effective']}>Effective as of 30 August 2020</p>

                <h2 className={styles['section-title']}>1. Introduction</h2>
                <p>
                    At <strong>Caught in 4K</strong> we take your privacy and the security of your information very seriously.
                    This Privacy Policy ("Policy") covers the Caught in 4K platform ("Platform"), including our web application
                    and any services offered (collectively, the "Services"). By using any of the Services, you agree to be bound by this Policy.
                </p>
                <p>
                    If you have any questions regarding this Policy, please contact us through the Settings page.
                </p>

                <h2 className={styles['section-title']}>2. Terms</h2>
                <p>
                    For the purposes of this Privacy Policy, the terms related to personal data have the meanings defined in the
                    General Data Protection Regulation (EC) 2016/679. Any other relevant definitions are coordinated with the
                    General Terms and Conditions applicable to our Services.
                </p>

                <h2 className={styles['section-title']}>3. Types of Data We Collect</h2>
                <div className={styles['important-notice']}>
                    <strong>IMPORTANT:</strong> We do not collect any history or logs of what addons/sources you use for streaming.
                    Furthermore, if you log in as a Guest User, no personal data is collected whatsoever.
                </div>

                <p><strong>Data provided by you:</strong></p>
                <p>
                    We collect your email address and password to create an account and provide access to our Services.
                    Your email is used for account recovery and support purposes. Your password is stored in a secure,
                    cryptographically hashed state.
                </p>

                <p><strong>Log information:</strong></p>
                <p>
                    When you use our Services, some data is automatically collected — such as your IP address, operating system,
                    device type, and the time and date of your use — to ensure the performance, security, and reliability of our Services.
                </p>

                <p><strong>Customer support data:</strong></p>
                <p>
                    Users who contact us for support may provide their name, email address, and other additional information
                    they choose to disclose.
                </p>

                <p><strong>Analytics data:</strong></p>
                <p>
                    Analytical data is collected in an anonymized and aggregated manner in order to improve the performance
                    and quality of our services.
                </p>

                <p><strong>Data collected by third parties:</strong></p>
                <p>
                    We may obtain information from third-party sources (e.g. social logins) in accordance with their
                    authorization procedures and applicable data protection laws.
                </p>

                <h2 className={styles['section-title']}>4. Storage and Deletion of Personal Data</h2>
                <p>
                    We collect and store your personal data within the European Economic Area (EEA). Once the retention period
                    lapses, we delete all personal data together with any existing copies, unless Union or Member State laws
                    require extended storage.
                </p>
                <p>
                    We take all necessary technical and organizational measures for the proper deletion of your personal data
                    from all production and backup information systems.
                </p>

                <h2 className={styles['section-title']}>5. Cookies</h2>
                <p>
                    Cookies are small pieces of data stored on your device. The only cookies we use are Google Analytics and
                    Facebook Pixel, which collect statistical information such as country of access and time spent on the Services.
                    These are collected for statistical purposes to improve the performance and quality of our services.
                </p>

                <h2 className={styles['section-title']}>6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className={styles['legal-list']}>
                    <li>Request access to your personal data in a portable format</li>
                    <li>Withdraw your consent when it is the legal basis for data collection</li>
                    <li>Request correction of any collected personal data</li>
                    <li>Receive a copy of your personal data in electronic format</li>
                    <li>Request deletion of your personal data at any time ("right to be forgotten")</li>
                    <li>Receive information about how your personal data is used</li>
                    <li>Delete your account at any time</li>
                    <li>Transfer your data to another controller</li>
                    <li>Lodge a complaint with a supervisory authority</li>
                </ul>
                <p>
                    To exercise your rights, contact us through the Settings page or delete your account from your user profile settings.
                </p>

                <h2 className={styles['section-title']}>7. Sharing of Personal Information with Third Parties</h2>
                <div className={styles['important-notice']}>
                    <strong>IMPORTANT:</strong> We do not collect any history or logs of what addons/sources you use for streaming.
                    If you log in as a Guest User, no personal data will be collected whatsoever.
                </div>
                <p>
                    We do not sell, trade, or otherwise share personal information with third parties for their marketing purposes.
                </p>
                <p>
                    We may transfer personal information to third-party service providers for the purpose of providing the Services.
                    These providers include:
                </p>
                <ul className={styles['legal-list']}>
                    <li>Google Analytics</li>
                    <li>BigQuery</li>
                    <li>Sentry</li>
                    <li>YouTube</li>
                </ul>
                <p>
                    We may transfer personal information to third parties to: (i) comply with legal requirements; (ii) investigate
                    a possible crime; (iii) in connection with the merger or dissolution of the company; (iv) when necessary to
                    protect the rights, property, or safety of others; or (v) as otherwise required by law.
                </p>

                <h2 className={styles['section-title']}>8. Children and Privacy</h2>
                <p>
                    Our services are not directed towards children. We do not knowingly collect data from persons who have not
                    reached the age of full legal capacity. If you believe we have data from such a person, please contact us
                    and we will delete it immediately.
                </p>

                <h2 className={styles['section-title']}>9. Security</h2>
                <p>
                    We undertake all necessary technological and organizational measures to protect your personal data.
                    We implement pseudonymisation and encryption of personal data. Your password is stored in a secure,
                    cryptographically hashed state. Our services have SSL certificates for secure communication.
                    Access to personal data is strictly controlled and limited to a minimal number of authorized personnel.
                </p>
                <p>
                    In case of a personal data breach, we will undertake every possible action to avoid any material or
                    non-material damage. Users and competent authorities will be notified immediately.
                </p>

                <h2 className={styles['section-title']}>10. Account Deletion</h2>
                <p>
                    To delete your account, go to your profile settings and use the "Delete Account" option. This action is
                    permanent and cannot be undone.
                </p>

                <h2 className={styles['section-title']}>11. Contact</h2>
                <p>
                    If you have any questions regarding this Policy, please contact us through the Settings page in the application.
                </p>

                <div className={styles['legal-footer']}>
                    <p>Caught in 4K — committed to your privacy.</p>
                </div>
            </div>
        </div>
    );
};

module.exports = PrivacyPolicy;

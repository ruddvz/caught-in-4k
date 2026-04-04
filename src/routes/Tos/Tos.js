// Copyright (C) Caught in 4K

const React = require('react');
const { buildAppHref } = require('stremio/common/navigation');
const { HorizontalNavBar } = require('stremio/components');
const styles = require('./styles');

const Tos = () => {
    return (
        <div className={styles['legal-container']}>
            <HorizontalNavBar
                className={styles['nav-bar']}
                backButton={true}
            />
            <div className={styles['legal-content']}>
                <h1 className={styles['legal-title']}>Terms of Service</h1>
                <p className={styles['legal-effective']}>Effective date: August 30, 2020 — last reviewed March 2026</p>

                <p className={styles['legal-intro']}>
                    Welcome to <strong>Caught in 4K</strong> — a streaming catalogue platform built for people who take their watch history seriously.
                    These Terms of Service ("Terms") govern your access to and use of our platform, web application, and all associated services
                    (collectively, the "Services"). By using any part of the Services, you agree to be bound by these Terms.
                    If you do not agree, please discontinue use. We are genuinely sorry to see you go, but rules are rules.
                </p>

                <h2 className={styles['section-title']}>1. Definitions</h2>

                <p><strong>1.1.</strong> <em>"Provider"</em> — Caught in 4K and its operators. The people behind the curtain keeping everything running.</p>

                <p><strong>1.2.</strong> <em>"Platform"</em> — The Caught in 4K web application, its features, and all associated Services. Your one-stop destination for what to watch next.</p>

                <p><strong>1.3.</strong> <em>"Add-on"</em> — Software extensions that connect additional content sources to the Platform. Official Add-ons are pre-installed. Community Add-ons are third-party built and must be installed manually by the User.</p>

                <p><strong>1.4.</strong> <em>"Library"</em> — Your personal watchlist. Organized, curated, entirely yours.</p>

                <p><strong>1.5.</strong> <em>"User Content"</em> — Content metadata selected and arranged by you within your Library. Your taste, your organization.</p>

                <p><strong>1.6.</strong> <em>"Streamable Content"</em> — Audio and video content accessible through the Platform via installed Add-ons.</p>

                <p><strong>1.7.</strong> <em>"Content Information"</em> — Metadata describing movies, television series, episodes, and other media available on the Platform.</p>

                <p><strong>1.8.</strong> <em>"Database"</em> — Our aggregated, curated collection of Content Information. We built it, we maintain it, and we take reasonable pride in it.</p>

                <p><strong>1.9.</strong> <em>"User"</em> — Any individual of legal age and legal capacity who accesses the Services, whether as a Guest or a Registered User.</p>

                <p><strong>1.10.</strong> <em>"Registered User"</em> or <em>"You"</em> — A User who has completed registration and holds an active account on the Platform.</p>

                <h2 className={styles['section-title']}>2. Acceptance of Terms</h2>

                <p><strong>2.1.</strong> By accessing or using the Services in any capacity, you confirm that you have read, understood, and agreed to these Terms. If you disagree, your remedy is to stop using the Services. We have made peace with this possibility.</p>

                <p><strong>2.2.</strong> We reserve the right to amend these Terms at any time. Updated Terms take effect immediately upon publication unless we specify otherwise. Continued use of the Services following any update constitutes your acceptance of the revised Terms. We recommend checking this page periodically — not obsessively, just occasionally.</p>

                <h2 className={styles['section-title']}>3. Account Registration</h2>

                <p><strong>3.1.</strong> Registered Users have access to features not available to Guests. The scope of those additional features is determined by us and may change over time.</p>

                <p><strong>3.2.</strong> To register, you must provide a valid email address, a secure password, and confirm your acceptance of these Terms. Standard stuff, we know.</p>

                <p><strong>3.3.</strong> The information you provide during registration must be accurate, current, and complete. Providing false information is a violation of these Terms and will not end well for your account.</p>

                <p><strong>3.4.</strong> You are solely responsible for maintaining the confidentiality of your login credentials. Do not share your password with anyone. Account security breaches resulting from credential sharing are your responsibility, not ours.</p>

                <h2 className={styles['section-title']}>4. Community Add-on Developers</h2>

                <p><strong>4.1.</strong> If you develop a Community Add-on, you must not use it to stream, reproduce, distribute, broadcast, sell, or commercially exploit any Streamable Content without the explicit written authorization of the relevant rights holder. This is a firm boundary, not a suggestion.</p>

                <p><strong>4.2.</strong> You bear full responsibility for all content made accessible through your Add-on — its legality, accuracy, and any consequences arising from its use. We are not your legal backstop.</p>

                <h2 className={styles['section-title']}>5. User Obligations and Restrictions</h2>

                <p><strong>5.1.</strong> You may use the Platform to browse, organize, and access content, provided you do so in compliance with applicable intellectual property law and these Terms.</p>

                <p><strong>5.2.</strong> We may update, modify, or remove Content Information at any time without prior notice or liability. If your favorite film's metadata disappears overnight, we sympathize, but we are not liable.</p>

                <p><strong>5.3.</strong> You may not use automated tools, bots, scrapers, crawlers, or any non-human means to extract data from the Platform. This is prohibited, often illegal, and frankly bad manners on the internet.</p>

                <p><strong>5.4.</strong> You may delete your account and cease using the Services at any time. No exit interviews, no guilt, no countdown timers.</p>

                <h2 className={styles['section-title']}>6. Service Availability and Warranties</h2>

                <p><strong>6.1.</strong> We will make reasonable efforts to maintain the availability and quality of the Services. We want this to work well for you.</p>

                <p><strong>6.2.</strong> We do not guarantee uninterrupted access, error-free Content Information, or the perpetual availability of any particular feature. The internet is inherently unpredictable. We are doing our best.</p>

                <p><strong>6.3.</strong> We may suspend or terminate your access to the Services immediately and without notice if you are found to be in violation of these Terms or applicable law. This is not a step we take lightly, but one we will take when necessary.</p>

                <h2 className={styles['section-title']}>7. Intellectual Property</h2>

                <p><strong>7.1.</strong> By adding Content Information through a Community Add-on, you represent and warrant that you own or have obtained all necessary rights, licenses, and permissions for that content. The legal responsibility is yours entirely.</p>

                <p><strong>7.2.</strong> When Content Information and Streamable Content are made accessible through the Platform, you grant other Users a non-exclusive, non-commercial right to access that content through the Services.</p>

                <p><strong>7.3.</strong> All Platform assets — including the Database, logos, trademarks, trade names, and domain names — are owned by the Provider and protected by applicable intellectual property law. Unauthorized use is not permitted.</p>

                <h2 className={styles['section-title']}>8. Limitation of Liability</h2>

                <p><strong>8.1.</strong> We are not responsible for Content Information supplied by Community Add-on Developers, the legality of Streamable Content accessed through third-party Add-ons, or the actions of other users on the Platform. We built the infrastructure. What happens on it is a shared responsibility.</p>

                <p><strong>8.2.</strong> We are not liable for service interruptions, data loss, or damages resulting from circumstances outside our reasonable control — including but not limited to infrastructure failures, natural events, or bad actors on the internet. Force majeure is a real legal concept and we are invoking it here.</p>

                <h2 className={styles['section-title']}>9. Indemnification</h2>

                <p><strong>9.1.</strong> If we are required to modify or suspend the Services to comply with applicable law or these Terms, we are not liable for any resulting damages or losses to you.</p>

                <p><strong>9.2.</strong> If your content, Add-on, or conduct gives rise to a third-party legal claim against us, you agree to indemnify and hold us harmless from any resulting damages, costs, or liabilities. Keep your corner of the Platform clean and this section will never apply to you.</p>

                <h2 className={styles['section-title']}>10. General Provisions</h2>

                <p><strong>10.1.</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions continue in full force and effect. One bad clause does not sink the whole document.</p>

                <p><strong>10.2.</strong> Matters not expressly covered by these Terms are governed by applicable legislation. We operate within the law and expect the same from you.</p>

                <p><strong>10.3.</strong> Before escalating any dispute to formal legal proceedings, both parties agree to attempt resolution through good-faith negotiation within thirty (30) days of the dispute arising. We prefer conversations to courtrooms.</p>

                <div className={styles['legal-footer']}>
                    <p>Questions about these Terms? Contact us through the Settings page.</p>
                    <p>Also see our <a href={buildAppHref('/privacy')} className={styles['footer-legal-link']}>Privacy Policy</a>.</p>
                </div>
            </div>
        </div>
    );
};

module.exports = Tos;

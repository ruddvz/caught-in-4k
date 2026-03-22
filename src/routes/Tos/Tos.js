// Copyright (C) Caught in 4K

const React = require('react');
const { HorizontalNavBar } = require('stremio/components');
const styles = require('./styles');

const Tos = () => {
    const backButtonOnClick = React.useCallback(() => {
        window.history.back();
    }, []);

    return (
        <div className={styles['legal-container']}>
            <HorizontalNavBar
                className={styles['nav-bar']}
                backButton={true}
            />
            <div className={styles['legal-content']}>
                <h1 className={styles['legal-title']}>General Terms and Conditions</h1>
                <p className={styles['legal-effective']}>Effective from 30 August 2020</p>

                <p className={styles['legal-intro']}>
                    These General Terms and Conditions cover the <strong>Caught in 4K</strong> platform ("Platform"),
                    including our web application and any services offered (collectively, the "Services").
                </p>

                <h2 className={styles['section-title']}>1. Basic Concepts</h2>

                <p><strong>1.1.</strong> <em>"Provider"</em> — the operator of the Services, the Caught in 4K organization.</p>

                <p><strong>1.2.</strong> <em>"Caught in 4K"</em> is the Provider's software product, accessible through the web. It is a metadata catalogue and platform for streaming of official audio and video content, available to the public.</p>

                <p><strong>1.3.</strong> <em>"Addon"</em> is a software product which allows content to be accessed through the Platform. Official Addons are developed by the Provider and automatically accessible, whereas Community Addons are developed by independent third-party developers and must be manually installed.</p>

                <p><strong>1.4.</strong> <em>"Library"</em> is a functionality allowing Users to store and keep Content Information selected by them.</p>

                <p><strong>1.5.</strong> <em>"User Content"</em> is the Content Information which is selected, arranged and/or organized in the Library by each Registered User.</p>

                <p><strong>1.6.</strong> <em>"Streamable Content"</em> is audio and visual content, available for streaming using the Platform.</p>

                <p><strong>1.7.</strong> <em>"Content Information"</em> is metadata relating to audio-visual content (film, TV series, TV shows, etc.) available through the Platform.</p>

                <p><strong>1.8.</strong> <em>"Database"</em> is the compilation and arrangement of metadata compiled by the Provider.</p>

                <p><strong>1.9.</strong> <em>"User"</em> means any natural person who acts in full legal capacity and accesses the Services, either in Guest mode or as a Registered User.</p>

                <p><strong>1.10.</strong> <em>"Registered User"</em> or <em>"You"</em> means any User who has successfully completed the registration procedure.</p>

                <h2 className={styles['section-title']}>2. General Provisions</h2>

                <p><strong>2.1.</strong> These GTC are binding for each User who accesses, uses or downloads the Platform. If the User disagrees with any conditions mentioned here, they shall not use the Services.</p>

                <p><strong>2.2.</strong> The Provider reserves the right to amend these GTC at any time. The new version becomes effective from the day it is publicly announced unless stated otherwise.</p>

                <h2 className={styles['section-title']}>3. Registration</h2>

                <p><strong>3.1.</strong> The scope of Services available to Registered Users and Guest Users varies at the Provider's sole discretion. Through your profile you can store, arrange and manage your Library, update personal data, or cancel your registration.</p>

                <p><strong>3.2.</strong> To complete registration, the User must fill in the electronic registration form with their username, password and confirm agreement to these Terms and Conditions.</p>

                <p><strong>3.3.</strong> You assure that the data provided in the registration process is true, complete, accurate and not misleading.</p>

                <p><strong>3.4.</strong> You agree not to disclose your login credentials to any third parties. You are solely responsible for protecting the confidentiality of your credentials.</p>

                <h2 className={styles['section-title']}>4. Rights and Obligations of Community Addon Developers (CAD)</h2>

                <p><strong>4.1.</strong> Without the respective right holder's prior explicit written consent, CAD may not stream, copy, reproduce, distribute, transmit, broadcast, display, sell, license or otherwise commercially use Streamable Content.</p>

                <p><strong>4.2.</strong> CAD are solely responsible for content made available through their Addons, for its legality, and the consequences of its publication and use.</p>

                <h2 className={styles['section-title']}>5. Rights and Obligations of Users</h2>

                <p><strong>5.1.</strong> Users may access Streamable Content and Content Information available through the Platform provided they comply with the Intellectual Property section of these GTC.</p>

                <p><strong>5.2.</strong> Users agree that the Provider reserves the right to update and/or delete Content Information in its sole discretion.</p>

                <p><strong>5.3.</strong> Users undertake not to use the Platform for monitoring, copying or extracting any information from the Platform in automated means, or for any purpose non-compliant with applicable local legislation.</p>

                <p><strong>5.4.</strong> Users may, at any time and in their sole discretion, terminate the use of the Services by canceling their registration.</p>

                <h2 className={styles['section-title']}>6. Rights and Obligations of the Provider</h2>

                <p><strong>6.1.</strong> The Provider shall take due care to enable normal use of the Services.</p>

                <p><strong>6.2.</strong> The Provider does not guarantee that access to the Services will always be uninterrupted, or that any data or content is complete, accurate, and without error.</p>

                <p><strong>6.3.</strong> The Provider may, in its sole discretion and without notice, suspend Users' access to the Services where the latter is or might be in conflict with these GTC and/or any applicable law.</p>

                <h2 className={styles['section-title']}>7. Intellectual Property</h2>

                <p><strong>7.1.</strong> CAD represent and warrant that they own all intellectual property rights or the rights to use the Streamable Content they make available, and have obtained all necessary licenses and consents.</p>

                <p><strong>7.2.</strong> By adding Content Information and making Streamable Content accessible, CAD grant all other Users a non-exclusive right to use and access the content for non-commercial use.</p>

                <p><strong>7.3.</strong> The websites and applications belong to and are operated by the Provider. Each component — including the Database, logos, trademarks, and domain names — is protected by intellectual property laws and belongs strictly to the Provider.</p>

                <h2 className={styles['section-title']}>8. Limitation of Provider's Liability</h2>

                <p><strong>8.1.</strong> The Provider is not responsible for the Content Information, the Streamable Content, or the activities of Users and/or CAD in connection with the Services.</p>

                <p><strong>8.2.</strong> The Provider is not liable for failure to provide the Services due to circumstances beyond its control, including force majeure, network problems, or unauthorized third party interference.</p>

                <h2 className={styles['section-title']}>9. Indemnification</h2>

                <p><strong>9.1.</strong> The Provider shall not be liable for any direct or indirect damages sustained by Users as a consequence of the suspension or modification of the Services when such results from compliance with applicable laws and/or these GTC.</p>

                <p><strong>9.2.</strong> Users, including CAD, agree to fully indemnify the Provider for any direct or indirect damage sustained as a result of claims by third parties in connection with content that Users have made available in violation of applicable laws or these GTC.</p>

                <h2 className={styles['section-title']}>10. Other Conditions</h2>

                <p><strong>10.1.</strong> If any provision of these GTC is declared void or unenforceable, the other provisions shall remain in full force and effect.</p>

                <p><strong>10.2.</strong> Any disputes not addressed in these GTC shall be resolved under the provisions of applicable legislation.</p>

                <p><strong>10.3.</strong> In case of disputes, the parties will make all reasonable efforts to resolve them amicably through negotiations within one month of the occurrence of the dispute.</p>

                <div className={styles['legal-footer']}>
                    <p>For questions about these Terms, contact us through the Settings page.</p>
                </div>
            </div>
        </div>
    );
};

module.exports = Tos;

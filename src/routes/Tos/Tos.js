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
                <h1 className={styles['legal-title']}>Terms & Conditions (No Cap)</h1>
                <p className={styles['legal-effective']}>In effect since 30 August 2020 — still valid, still very much a thing</p>

                <p className={styles['legal-intro']}>
                    Okay bestie, before you go full stream mode on <strong>Caught in 4K</strong> — our platform, our app, our whole vibe
                    (collectively, the "Services") — you gotta read this. It's legally binding (yes, for real), but we promise
                    it's less painful than a spoiler in the comments.
                </p>

                <h2 className={styles['section-title']}>1. The Glossary (a.k.a. What Are We Even Talking About)</h2>

                <p><strong>1.1.</strong> <em>"Provider"</em> — That's us. The Caught in 4K crew running this whole operation.</p>

                <p><strong>1.2.</strong> <em>"Caught in 4K"</em> — Our platform. It's a metadata catalogue and streaming hub for official audio/video content. Think of it as your cinematic bestie available on the web, no download required.</p>

                <p><strong>1.3.</strong> <em>"Addon"</em> — Software plug-ins that unlock extra content. Official ones come pre-loaded. Community Addons? Built by third-party devs — you gotta install those yourself, fam.</p>

                <p><strong>1.4.</strong> <em>"Library"</em> — Your personal watchlist vibe. Save stuff, organize it, make it yours.</p>

                <p><strong>1.5.</strong> <em>"User Content"</em> — The content info <em>you</em> pick, arrange, and curate in your Library. Your taste, your curation era.</p>

                <p><strong>1.6.</strong> <em>"Streamable Content"</em> — The actual audio and video you can stream through the platform. The good stuff.</p>

                <p><strong>1.7.</strong> <em>"Content Information"</em> — Metadata about movies, TV shows, series, etc. available on the platform. The who, what, when, where of content.</p>

                <p><strong>1.8.</strong> <em>"Database"</em> — Our big compiled collection of metadata. We built it, we maintain it, it slaps.</p>

                <p><strong>1.9.</strong> <em>"User"</em> — Anyone (human, legal age, legally capable) who uses the Services — whether as a Guest or as a Registered User. That means you.</p>

                <p><strong>1.10.</strong> <em>"Registered User"</em> or <em>"You"</em> — Someone who fully signed up with an account. Welcome to the inner circle.</p>

                <h2 className={styles['section-title']}>2. The Ground Rules (Read: Don't Be Messy)</h2>

                <p><strong>2.1.</strong> By using this platform, you're agreeing to these Terms. If you're not feeling them — no hard feelings, but you gotta bounce. Using the Services = accepting the Terms. It's giving contract energy.</p>

                <p><strong>2.2.</strong> We can update these Terms whenever we feel like it (legally speaking). When we do, the new version goes live immediately unless we say otherwise. We'd recommend checking back occasionally — just sayin'.</p>

                <h2 className={styles['section-title']}>3. Signing Up (Your Account Era)</h2>

                <p><strong>3.1.</strong> Registered Users get more features than Guests — how much more is entirely up to us. Through your profile you can manage your Library, update your info, or just delete everything and disappear. Your call.</p>

                <p><strong>3.2.</strong> To sign up, fill out the registration form with your email, password, and confirm you've read these Terms. (We know you skimmed. We get it.)</p>

                <p><strong>3.3.</strong> The info you provide must be real, accurate, and not a whole entire lie. We trust you. Don't make it weird.</p>

                <p><strong>3.4.</strong> Keep your login credentials to yourself. Don't share them. Not with your bestie, not with your situationship. You're responsible if your account gets compromised because you shared your password.</p>

                <h2 className={styles['section-title']}>4. Community Addon Devs — Here's Your Part</h2>

                <p><strong>4.1.</strong> If you're building a Community Addon, DO NOT stream, copy, reproduce, distribute, broadcast, sell, or commercially use Streamable Content without explicit written permission from the actual rights holder. That's a big no-cap no.</p>

                <p><strong>4.2.</strong> Whatever content flows through your Addon is fully on you — its legality, consequences, all of it. We're not your legal backup.</p>

                <h2 className={styles['section-title']}>5. What You Can (and Can't) Do as a User</h2>

                <p><strong>5.1.</strong> You can watch, browse, and vibe with content on the Platform — as long as you respect the Intellectual Property rules in these Terms. That's the deal.</p>

                <p><strong>5.2.</strong> We can update or delete Content Information at any time. If your favorite show's metadata disappears, that's a us problem, not a you problem — but we're not liable for it.</p>

                <p><strong>5.3.</strong> Don't scrape, bot, crawl, or use automated tools to extract data from the Platform. That's not the move. It's also illegal in most places. Don't do it.</p>

                <p><strong>5.4.</strong> Want out? You can delete your account and dip at any time. No drama from us.</p>

                <h2 className={styles['section-title']}>6. What We Promise (and What We Don't)</h2>

                <p><strong>6.1.</strong> We'll do our best to keep the Services running smoothly. We genuinely want this to work for you.</p>

                <p><strong>6.2.</strong> That said, we can't guarantee 100% uptime or that every piece of content info is perfect. The internet is chaotic — we're doing our best out here.</p>

                <p><strong>6.3.</strong> If you're violating these Terms or any applicable law, we can suspend your access — immediately and without warning. Not personal, just necessary.</p>

                <h2 className={styles['section-title']}>7. Intellectual Property (Don't Steal the Drip)</h2>

                <p><strong>7.1.</strong> If you're a Community Addon Dev adding content, you swear (legally) that you own the rights or have permission to use it. All licenses, consents — you got 'em.</p>

                <p><strong>7.2.</strong> When you add Content Info and make Streamable Content accessible, you're giving other users a non-exclusive, non-commercial right to access it. That's the community spirit.</p>

                <p><strong>7.3.</strong> Everything you see on this site — the Database, logos, trademarks, domain names — belongs to us. It's protected by IP law. Please don't bite our style without permission.</p>

                <h2 className={styles['section-title']}>8. Our Liability (a.k.a. We're Not That Guy)</h2>

                <p><strong>8.1.</strong> We're not responsible for Content Information, Streamable Content, or what other users or CADs do on the platform. We built the stage, not the show.</p>

                <p><strong>8.2.</strong> If the Services go down due to things outside our control — internet outages, natural disasters, hackers, the universe deciding to not cooperate — we're not liable. Force majeure is real.</p>

                <h2 className={styles['section-title']}>9. Indemnification (Legal Speak for: Cover Us)</h2>

                <p><strong>9.1.</strong> If we have to suspend or change the Services to comply with the law or these Terms, we're not on the hook for any damages that causes. It is what it is.</p>

                <p><strong>9.2.</strong> If your content or actions cause a third party to come at us legally, you agree to fully cover any damages we face. That's on you, not us.</p>

                <h2 className={styles['section-title']}>10. The Fine Print (Also Important Though)</h2>

                <p><strong>10.1.</strong> If any part of these Terms gets declared unenforceable, the rest of it stays valid. We don't throw the whole document out over one bad clause.</p>

                <p><strong>10.2.</strong> Anything not covered here? Applicable legislation handles it. We're not above the law.</p>

                <p><strong>10.3.</strong> Got beef? Before it becomes a legal thing, both sides agree to try to sort it out through good-faith negotiations within one month. One month. Dialogue first, lawyers second.</p>

                <div className={styles['legal-footer']}>
                    <p>Still have questions? Hit us up through the Settings page. We actually read those. No cap. 🫶</p>
                </div>
            </div>
        </div>
    );
};

module.exports = Tos;

// Copyright (C) 2017-2023 Smart code 203358507

if (typeof process.env.SENTRY_DSN === 'string') {
    const Sentry = require('@sentry/browser');
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const Bowser = require('bowser');
const browser = Bowser.parse(window.navigator?.userAgent || '');
const isMobileLike =
    browser?.platform?.type === 'mobile' ||
    /iPhone|iPad|iPod|Android/i.test(window.navigator?.userAgent || '');
if (browser?.platform?.type === 'desktop' && !isMobileLike) {
    document.querySelector('meta[name="viewport"]')?.setAttribute('content', '');
}

const React = require('react');
const ReactDOM = require('react-dom/client');
const i18n = require('i18next');
const { initReactI18next, I18nextProvider } = require('react-i18next');
const stremioTranslations = require('stremio-translations');
const caughtIn4KTranslations = require('./common/caught-in-4k-translations');
require('./styles/tokens.css');
require('./styles/tailwind.css');
const App = require('./App');

if (typeof process.env.REACT_APP_PLAUSIBLE_DOMAIN === 'string' && process.env.REACT_APP_PLAUSIBLE_DOMAIN.length > 0) {
    const plausibleScript = document.createElement('script');
    plausibleScript.defer = true;
    plausibleScript.dataset.domain = process.env.REACT_APP_PLAUSIBLE_DOMAIN;
    plausibleScript.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(plausibleScript);
}

const allTranslations = stremioTranslations();
const baseTranslation = allTranslations['en-US'] || {};
// Merge Caught in 4K overrides on top of default translations
const mergedTranslation = Object.assign({}, baseTranslation, caughtIn4KTranslations);
const translations = { 'en-US': { translation: mergedTranslation } };

i18n
    .use(initReactI18next)
    .init({
        resources: translations,
        lng: 'en-US',
        fallbackLng: 'en-US',
        interpolation: {
            escapeValue: false
        }
    });

const root = ReactDOM.createRoot(document.getElementById('app'));

class RootErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    render() {
        if (this.state.error) {
            return React.createElement('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    color: '#fff',
                    fontFamily: 'sans-serif',
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#1a1a2e',
                }
            },
            React.createElement('h2', null, 'Something went wrong'),
            React.createElement('p', { style: { color: '#aaa', maxWidth: '600px', wordBreak: 'break-all' } }, String(this.state.error))
            );
        }
        return this.props.children;
    }
}

RootErrorBoundary.propTypes = {
    children: require('prop-types').node
};

root.render(
    React.createElement(I18nextProvider, { i18n },
        React.createElement(RootErrorBoundary, null, React.createElement(App))
    )
);

// Register service worker for PWA install + update prompts
if ('serviceWorker' in navigator && !process.env.SERVICE_WORKER_DISABLED) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                registration.addEventListener('updatefound', () => {
                    const installing = registration.installing;
                    if (!installing) {
                        return;
                    }
                    installing.addEventListener('statechange', () => {
                        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                            window.dispatchEvent(new CustomEvent('c4k-sw-update-ready'));
                        }
                    });
                });
            })
            .catch(() => {
                // SW registration failed — app still works without it
            });
    });
}

window.addEventListener('offline', () => {
    document.body.classList.add('c4k-offline');
});

window.addEventListener('online', () => {
    document.body.classList.remove('c4k-offline');
});

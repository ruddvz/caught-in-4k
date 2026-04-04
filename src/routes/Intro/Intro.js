// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Modal, useRouteFocused } = require('stremio-router');
const { useServices } = require('stremio/services');
const { useBinaryState } = require('stremio/common');
const { navigateToAppHref } = require('stremio/common/navigation');
const { Button, Checkbox } = require('stremio/components');
const CredentialsTextInput = require('./CredentialsTextInput');
const PasswordResetModal = require('./PasswordResetModal');
const useFacebookLogin = require('./useFacebookLogin');
const { default: useAppleLogin } = require('./useAppleLogin');

const styles = require('./styles');

// Logo image — the C4k. asset with transparent background
const logoSrc = require('/assets/images/logo1.png');

const SIGNUP_FORM = 'signup';
const LOGIN_FORM = 'login';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
);

const Intro = ({ queryParams }) => {
    const { core } = useServices();
    const { t } = useTranslation();
    const routeFocused = useRouteFocused();
    const [startFacebookLogin, stopFacebookLogin] = useFacebookLogin();
    const [startAppleLogin, stopAppleLogin] = useAppleLogin();

    const emailRef = React.useRef(null);
    const passwordRef = React.useRef(null);
    const confirmPasswordRef = React.useRef(null);
    const termsRef = React.useRef(null);
    const privacyPolicyRef = React.useRef(null);
    const errorRef = React.useRef(null);

    const [passwordRestModalOpen, , closePasswordResetModal] = useBinaryState(false);
    const [loaderModalOpen, openLoaderModal, closeLoaderModal] = useBinaryState(false);

    const [state, dispatch] = React.useReducer(
        (state, action) => {
            switch (action.type) {
                case 'set-form':
                    if (state.form !== action.form) {
                        return {
                            form: action.form,
                            email: '',
                            password: '',
                            confirmPassword: '',
                            termsAccepted: false,
                            privacyPolicyAccepted: false,
                            marketingAccepted: false,
                            error: ''
                        };
                    }
                    return state;
                case 'change-credentials':
                    return { ...state, error: '', [action.name]: action.value };
                case 'toggle-checkbox':
                    return { ...state, error: '', [action.name]: !state[action.name] };
                case 'error':
                    return { ...state, error: action.error };
                default:
                    return state;
            }
        },
        {
            form: [LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form')) ? queryParams.get('form') : SIGNUP_FORM,
            email: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false,
            privacyPolicyAccepted: false,
            marketingAccepted: false,
            error: ''
        }
    );

    const loginWithEmail = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: t('INVALID_EMAIL') });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: t('INVALID_PASSWORD') });
            return;
        }
        openLoaderModal();
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: { type: 'Login', email: state.email, password: state.password }
            }
        });
    }, [state.email, state.password, core, t, openLoaderModal]);

    const loginAsGuest = React.useCallback(() => {
        navigateToAppHref('/');
    }, []);

    const signup = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: t('INVALID_EMAIL') });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: t('INVALID_PASSWORD') });
            return;
        }
        if (state.password !== state.confirmPassword) {
            dispatch({ type: 'error', error: t('PASSWORDS_NOMATCH') });
            return;
        }
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_TERMS') });
            return;
        }
        if (!state.privacyPolicyAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_PRIVACY_POLICY') });
            return;
        }
        openLoaderModal();
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: {
                    type: 'Register',
                    email: state.email,
                    password: state.password,
                    gdpr_consent: {
                        tos: state.termsAccepted,
                        privacy: state.privacyPolicyAccepted,
                        marketing: state.marketingAccepted,
                        from: 'web'
                    }
                }
            }
        });
    }, [state.email, state.password, state.confirmPassword, state.termsAccepted, state.privacyPolicyAccepted, state.marketingAccepted, core, t, openLoaderModal]);

    const handleGoogleLogin = React.useCallback(() => {
        console.warn('Google auth not yet configured');
        alert('Google sign-in coming soon.');
    }, []);

    // Form field handlers
    const emailOnChange = React.useCallback((event) => {
        dispatch({ type: 'change-credentials', name: 'email', value: event.currentTarget.value });
    }, []);
    const emailOnSubmit = React.useCallback(() => { passwordRef.current.focus(); }, []);

    const passwordOnChange = React.useCallback((event) => {
        dispatch({ type: 'change-credentials', name: 'password', value: event.currentTarget.value });
    }, []);
    const passwordOnSubmit = React.useCallback(() => {
        confirmPasswordRef.current.focus();
    }, []);

    const confirmPasswordOnChange = React.useCallback((event) => {
        dispatch({ type: 'change-credentials', name: 'confirmPassword', value: event.currentTarget.value });
    }, []);
    const confirmPasswordOnSubmit = React.useCallback(() => { termsRef.current.focus(); }, []);

    const toggleTermsAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'termsAccepted' });
    }, []);
    const togglePrivacyPolicyAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'privacyPolicyAccepted' });
    }, []);

    const cancelLoginWithFacebook = React.useCallback(() => {
        stopFacebookLogin();
        closeLoaderModal();
    }, [stopFacebookLogin, closeLoaderModal]);

    const cancelLoginWithApple = React.useCallback(() => {
        stopAppleLogin();
        closeLoaderModal();
    }, [stopAppleLogin, closeLoaderModal]);

    React.useEffect(() => {
        if ([LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form'))) {
            dispatch({ type: 'set-form', form: queryParams.get('form') });
        }
    }, [queryParams]);

    React.useEffect(() => {
        if (routeFocused && typeof state.error === 'string' && state.error.length > 0) {
            errorRef.current?.scrollIntoView();
        }
    }, [state.error, routeFocused]);

    React.useEffect(() => {
        if (routeFocused) { emailRef.current?.focus(); }
    }, [state.form, routeFocused]);

    React.useEffect(() => {
        const onCoreEvent = ({ event, args }) => {
            switch (event) {
                case 'UserAuthenticated': {
                    closeLoaderModal();
                    if (routeFocused) { navigateToAppHref('/'); }
                    break;
                }
                case 'Error': {
                    if (args.source.event === 'UserAuthenticated') { closeLoaderModal(); }
                    break;
                }
            }
        };
        core.transport.on('CoreEvent', onCoreEvent);
        return () => { core.transport.off('CoreEvent', onCoreEvent); };
    }, [routeFocused, core, closeLoaderModal]);

    // Keep hooks alive — buttons removed from UI but hooks must be called unconditionally
    void startFacebookLogin;
    void startAppleLogin;

    return (
        <div className={styles['intro-container']}>
            <div className={styles['background-container']} />

            {/* BRANDING — Logo + tagline */}
            <div className={styles['branding-header']}>
                <img
                    src={logoSrc}
                    className={styles['logo-image']}
                    alt="Caught in 4K"
                />
                <p className={styles['tagline']}>Raw. Real. Rated.</p>
            </div>

            {/* TWO-COLUMN LAYOUT */}
            <div className={styles['main-dashboard-wrap']}>

                {/* LEFT COLUMN — Form inputs + legal + sign up */}
                <div className={styles['form-side']}>
                    <div className={styles['glow-buffer-container']}>
                        <CredentialsTextInput
                            ref={emailRef}
                            className={styles['credentials-text-input']}
                            type={'email'}
                            placeholder={'E-mail'}
                            value={state.email}
                            onChange={emailOnChange}
                            onSubmit={emailOnSubmit}
                        />
                        <CredentialsTextInput
                            ref={passwordRef}
                            className={styles['credentials-text-input']}
                            type={'password'}
                            placeholder={'Password'}
                            value={state.password}
                            onChange={passwordOnChange}
                            onSubmit={passwordOnSubmit}
                        />
                        <CredentialsTextInput
                            ref={confirmPasswordRef}
                            className={styles['credentials-text-input']}
                            type={'password'}
                            placeholder={'Confirm password'}
                            value={state.confirmPassword}
                            onChange={confirmPasswordOnChange}
                            onSubmit={confirmPasswordOnSubmit}
                        />
                    </div>

                    <div className={styles['legal-checkboxes']}>
                        <Checkbox
                            ref={termsRef}
                            label={t('READ_AND_AGREE')}
                            link={t('TOS')}
                            href={'#/tos'}
                            checked={state.termsAccepted}
                            onChange={toggleTermsAccepted}
                            className={styles['legal-checkbox']}
                        />
                        <Checkbox
                            ref={privacyPolicyRef}
                            label={t('READ_AND_AGREE')}
                            link={t('PRIVACY_POLICY')}
                            href={'#/privacy'}
                            checked={state.privacyPolicyAccepted}
                            onChange={togglePrivacyPolicyAccepted}
                            className={styles['legal-checkbox']}
                        />
                    </div>

                    {state.error && (
                        <div ref={errorRef} className={styles['error-message']}>{state.error}</div>
                    )}

                    <Button
                        className={classnames(styles['intro-btn'], styles['btn-signup'])}
                        onClick={signup}
                    >
                        <div className={styles['label']}>Sign up</div>
                    </Button>
                </div>

                {/* RIGHT COLUMN — Google Sign In, Log in, Guest login */}
                <div className={styles['actions-side']}>
                    <Button
                        className={classnames(styles['intro-btn'], styles['btn-google'])}
                        onClick={handleGoogleLogin}
                    >
                        <GoogleIcon />
                        <div className={styles['label']}>Continue with Google</div>
                    </Button>
                    <Button
                        className={classnames(styles['intro-btn'], styles['btn-login'])}
                        onClick={loginWithEmail}
                    >
                        <div className={styles['label']}>Log in</div>
                    </Button>
                    <Button
                        className={classnames(styles['intro-btn'], styles['btn-guest'])}
                        onClick={loginAsGuest}
                    >
                        <div className={styles['label']}>Guest login</div>
                    </Button>
                </div>
            </div>

            {/* Modals & Loaders */}
            {loaderModalOpen && (
                <Modal className={styles['loading-modal-container']}>
                    <div className={styles['loader-container']}>
                        <Icon className={styles['icon']} name={'person'} />
                        <div className={styles['label']}>{t('AUTHENTICATING')}</div>
                        <Button className={styles['button']} onClick={cancelLoginWithFacebook && cancelLoginWithApple}>
                            {t('BUTTON_CANCEL')}
                        </Button>
                    </div>
                </Modal>
            )}
            {passwordRestModalOpen && (
                <PasswordResetModal email={state.email} onCloseRequest={closePasswordResetModal} />
            )}
        </div>
    );
};

Intro.propTypes = {
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

module.exports = Intro;

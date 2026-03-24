// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Modal, useRouteFocused } = require('stremio-router');
const { useServices } = require('stremio/services');
const { useBinaryState } = require('stremio/common');
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

    const [passwordRestModalOpen, openPasswordRestModal, closePasswordResetModal] = useBinaryState(false);
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
        window.location = '#/';
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

    // Form field handlers
    const emailOnChange = React.useCallback((event) => {
        dispatch({ type: 'change-credentials', name: 'email', value: event.currentTarget.value });
    }, []);
    const emailOnSubmit = React.useCallback(() => { passwordRef.current.focus(); }, []);

    const passwordOnChange = React.useCallback((event) => {
        dispatch({ type: 'change-credentials', name: 'password', value: event.currentTarget.value });
    }, []);
    const passwordOnSubmit = React.useCallback(() => {
        if (state.form === SIGNUP_FORM) { confirmPasswordRef.current.focus(); }
        else { loginWithEmail(); }
    }, [state.form, loginWithEmail]);

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

    const switchFormOnClick = React.useCallback(() => {
        const qp = new URLSearchParams([['form', state.form === SIGNUP_FORM ? LOGIN_FORM : SIGNUP_FORM]]);
        window.location = `#/intro?${qp.toString()}`;
    }, [state.form]);

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
                    if (routeFocused) { window.location = '#/'; }
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

    return (
        <div className={styles['intro-container']}>
            <div className={styles['background-container']} />

            {/* 1. LOGO IMAGE + HEADLINE */}
            <div className={styles['branding-header']}>
                <img
                    src={logoSrc}
                    className={styles['logo-image']}
                    alt="Caught in 4K"
                />
                <div className={styles['headline']}>Freedom to Stream</div>
                <div className={styles['sub-headline']}>All the video content you enjoy in one place</div>
            </div>

            {/* 2. TWO-COLUMN LAYOUT */}
            <div className={styles['main-dashboard-wrap']}>

                {/* LEFT COLUMN — Form inputs + legal */}
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
                        {state.form === SIGNUP_FORM && (
                            <CredentialsTextInput
                                ref={confirmPasswordRef}
                                className={styles['credentials-text-input']}
                                type={'password'}
                                placeholder={'Confirm password'}
                                value={state.confirmPassword}
                                onChange={confirmPasswordOnChange}
                                onSubmit={confirmPasswordOnSubmit}
                            />
                        )}
                    </div>

                    <div className={styles['legal-checkboxes']}>
                        <Checkbox
                            ref={termsRef}
                            label={t('READ_AND_AGREE')}
                            link={t('TOS')}
                            href={'https://www.stremio.com/tos'}
                            checked={state.termsAccepted}
                            onChange={toggleTermsAccepted}
                            className={styles['legal-checkbox']}
                        />
                        <Checkbox
                            ref={privacyPolicyRef}
                            label={t('READ_AND_AGREE')}
                            link={t('PRIVACY_POLICY')}
                            href={'https://www.stremio.com/privacy'}
                            checked={state.privacyPolicyAccepted}
                            onChange={togglePrivacyPolicyAccepted}
                            className={styles['legal-checkbox']}
                        />
                    </div>

                    {state.error && (
                        <div ref={errorRef} className={styles['error-message']}>{state.error}</div>
                    )}
                </div>

                {/* RIGHT COLUMN — Log in + Guest login (NO Google button) */}
                <div className={styles['actions-side']}>
                    <Button
                        className={classnames(styles['intro-btn'], styles['btn-login'])}
                        onClick={state.form === SIGNUP_FORM ? signup : loginWithEmail}
                    >
                        <div className={styles['label']}>
                            {state.form === SIGNUP_FORM ? 'Sign up' : 'Log in'}
                        </div>
                    </Button>
                    <Button
                        className={classnames(styles['intro-btn'], styles['btn-guest'])}
                        onClick={loginAsGuest}
                    >
                        <div className={styles['label']}>Guest login</div>
                    </Button>
                </div>
            </div>

            {/* 4. FOOTER — Wide "Sign up" / "Log in" switcher button */}
            <div className={styles['footer-action']}>
                <button className={styles['sign-up-footer-btn']} onClick={switchFormOnClick}>
                    {state.form === SIGNUP_FORM ? 'Already have an account? Log in' : 'Sign up'}
                </button>
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

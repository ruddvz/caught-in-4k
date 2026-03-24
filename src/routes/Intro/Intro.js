// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Modal, useRouteFocused } = require('stremio-router');
const { useServices } = require('stremio/services');
const { useBinaryState } = require('stremio/common');
const { Button, Checkbox, AppLogo } = require('stremio/components');
const CredentialsTextInput = require('./CredentialsTextInput');
const PasswordResetModal = require('./PasswordResetModal');
const useFacebookLogin = require('./useFacebookLogin');
const { default: useAppleLogin } = require('./useAppleLogin');

const styles = require('./styles');

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
    const marketingRef = React.useRef(null);
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
                    return {
                        ...state,
                        error: '',
                        [action.name]: action.value
                    };
                case 'toggle-checkbox':
                    return {
                        ...state,
                        error: '',
                        [action.name]: !state[action.name]
                    };
                case 'error':
                    return {
                        ...state,
                        error: action.error
                    };
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
    const loginWithFacebook = React.useCallback(() => {
        openLoaderModal();
        startFacebookLogin()
            .then(({ email, password }) => {
                core.transport.dispatch({
                    action: 'Ctx',
                    args: {
                        action: 'Authenticate',
                        args: {
                            type: 'Login',
                            email,
                            password,
                            facebook: true
                        }
                    }
                });
            })
            .catch((error) => {
                closeLoaderModal();
                dispatch({ type: 'error', error: error.message });
            });
    }, []);
    const cancelLoginWithFacebook = React.useCallback(() => {
        stopFacebookLogin();
        closeLoaderModal();
    }, []);
    const loginWithApple = React.useCallback(() => {
        openLoaderModal();
        startAppleLogin()
            .then(({ token, sub, email, name }) => {
                core.transport.dispatch({
                    action: 'Ctx',
                    args: {
                        action: 'Authenticate',
                        args: {
                            type: 'Apple',
                            token,
                            sub,
                            email,
                            name
                        }
                    }
                });
            })
            .catch((error) => {
                closeLoaderModal();
                dispatch({ type: 'error', error: error.message });
            });
    }, []);
    const cancelLoginWithApple = React.useCallback(() => {
        stopAppleLogin();
        closeLoaderModal();
    }, []);
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
                args: {
                    type: 'Login',
                    email: state.email,
                    password: state.password
                }
            }
        });
    }, [state.email, state.password]);
    const loginAsGuest = React.useCallback(() => {
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_TERMS') });
            return;
        }
        window.location = '#/';
    }, [state.termsAccepted]);
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
    }, [state.email, state.password, state.confirmPassword, state.termsAccepted, state.privacyPolicyAccepted, state.marketingAccepted]);
    const emailOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'email',
            value: event.currentTarget.value
        });
    }, []);
    const emailOnSubmit = React.useCallback(() => {
        passwordRef.current.focus();
    }, []);
    const passwordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'password',
            value: event.currentTarget.value
        });
    }, []);
    const passwordOnSubmit = React.useCallback(() => {
        if (state.form === SIGNUP_FORM) {
            confirmPasswordRef.current.focus();
        } else {
            loginWithEmail();
        }
    }, [state.form, loginWithEmail]);
    const confirmPasswordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'confirmPassword',
            value: event.currentTarget.value
        });
    }, []);
    const confirmPasswordOnSubmit = React.useCallback(() => {
        termsRef.current.focus();
    }, []);
    const toggleTermsAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'termsAccepted' });
    }, []);
    const togglePrivacyPolicyAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'privacyPolicyAccepted' });
    }, []);
    const toggleMarketingAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'marketingAccepted' });
    }, []);
    const switchFormOnClick = React.useCallback(() => {
        const queryParams = new URLSearchParams([['form', state.form === SIGNUP_FORM ? LOGIN_FORM : SIGNUP_FORM]]);
        window.location = `#/intro?${queryParams.toString()}`;
    }, [state.form]);
    React.useEffect(() => {
        if ([LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form'))) {
            dispatch({ type: 'set-form', form: queryParams.get('form') });
        }
    }, [queryParams]);
    React.useEffect(() => {
        if (routeFocused && typeof state.error === 'string' && state.error.length > 0) {
            errorRef.current.scrollIntoView();
        }
    }, [state.error]);
    React.useEffect(() => {
        if (routeFocused) {
            emailRef.current.focus();
        }
    }, [state.form, routeFocused]);
    React.useEffect(() => {
        const onCoreEvent = ({ event, args }) => {
            switch (event) {
                case 'UserAuthenticated': {
                    closeLoaderModal();
                    if (routeFocused) {
                        window.location = '#/';
                    }
                    break;
                }
                case 'Error': {
                    if (args.source.event === 'UserAuthenticated') {
                        closeLoaderModal();
                    }

                    break;
                }
            }
        };
        core.transport.on('CoreEvent', onCoreEvent);
        return () => {
            core.transport.off('CoreEvent', onCoreEvent);
        };
    }, [routeFocused]);
    const onFormSubmit = React.useCallback((e) => {
        e.preventDefault();
        loginWithEmail();
    }, [loginWithEmail]);

    return (
        <div className={styles['intro-container']}>
            {/* 1. Branding & Header */}
            <div className={styles['branding-header']}>
                <div className={styles['c4k-logo']}>
                    C4k<span className={styles['red-dot']}>.</span>
                </div>
                <div className={styles['slogan']}>Freedom to Stream</div>
                <div className={styles['sub-header']}>All the video content you enjoy in one place</div>
            </div>

            {/* Main Content Area: Form (Left) | Actions (Right) */}
            <div className={styles['main-dashboard-wrap']}>
                
                {/* 2. Form Field Styling (The Glow Fix) */}
                <div className={styles['form-side']}>
                    <div className={styles['glow-buffer-container']}>
                        <form className={styles['credentials-form']} onSubmit={onFormSubmit}>
                            <CredentialsTextInput
                                ref={emailRef}
                                className={styles['input-field']}
                                type={'email'}
                                placeholder={'E-mail'}
                                value={state.email}
                                onChange={emailOnChange}
                                onSubmit={emailOnSubmit}
                            />
                            {/* Focus state simulated on Password field as requested */}
                            <CredentialsTextInput
                                ref={passwordRef}
                                className={classnames(styles['input-field'], styles['password-field-glow'])}
                                type={'password'}
                                placeholder={'Password'}
                                value={state.password}
                                onChange={passwordOnChange}
                                onSubmit={passwordOnSubmit}
                                autoFocus
                            />
                            <CredentialsTextInput
                                ref={confirmPasswordRef}
                                className={styles['input-field']}
                                type={'password'}
                                placeholder={'Confirm password'}
                                value={state.confirmPassword}
                                onChange={confirmPasswordOnChange}
                                onSubmit={confirmPasswordOnSubmit}
                            />
                            
                            <div className={styles['legal-checkboxes']}>
                                <div className={styles['check-row']}>
                                    <Checkbox
                                        ref={termsRef}
                                        checked={state.termsAccepted}
                                        onChange={toggleTermsAccepted}
                                    />
                                    <span className={styles['legal-label']}>I agree to the Terms of Service</span>
                                </div>
                                <div className={styles['check-row']}>
                                    <Checkbox
                                        ref={privacyPolicyRef}
                                        checked={state.privacyPolicyAccepted}
                                        onChange={togglePrivacyPolicyAccepted}
                                    />
                                    <span className={styles['legal-label']}>I agree to the Privacy Policy</span>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 3. Action Buttons (Strict Vertical Stack) */}
                <div className={styles['actions-side']}>
                    <div className={styles['actions-stack']}>
                        <Button className={classnames(styles['intro-btn'], styles['btn-google'])} onClick={loginWithEmail}>
                            <div className={styles['google-icon']}>G</div>
                            Login with Google
                        </Button>
                        <Button className={classnames(styles['intro-btn'], styles['btn-charcoal'])} onClick={loginWithEmail}>
                            Log in
                        </Button>
                        <Button className={classnames(styles['intro-btn'], styles['btn-charcoal'])} onClick={loginAsGuest}>
                            Guest login
                        </Button>
                    </div>
                </div>

            </div>

            {/* 4. Footer Action */}
            <div className={styles['footer-action']}>
                <Button className={styles['sign-up-footer-btn']} onClick={signup}>
                    Sign up
                </Button>
            </div>

            {/* Modals & Loaders */}
            {passwordRestModalOpen && <PasswordResetModal email={state.email} onCloseRequest={closePasswordResetModal} />}
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
        </div>
    );
};

Intro.propTypes = {
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

module.exports = Intro;

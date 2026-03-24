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
    return (
        <div className={styles['intro-container']}>
            <div className={styles['background-container']} />
            
            {/* 1. Branding & Header */}
            <div className={styles['heading-container']}>
                <div className={styles['logo-text']}>
                    C4k<span className={styles['dot']}>.</span>
                </div>
                <div className={styles['title-container']}>
                    Freedom to Stream
                </div>
                <div className={styles['slogan-container']}>
                    All the video content you enjoy in one place
                </div>
            </div>

            <div className={styles['main-layout']}>
                {/* 2. Form Field Column (Left) */}
                <div className={styles['form-column']}>
                    <div className={styles['input-wrapper']}>
                        <CredentialsTextInput
                            ref={emailRef}
                            className={styles['credentials-text-input']}
                            type={'email'}
                            placeholder={'E-mail'}
                            value={state.email}
                            onChange={emailOnChange}
                            onSubmit={emailOnSubmit}
                        />
                    </div>
                    <div className={classnames(styles['input-wrapper'], styles['glow-field'])}>
                        <CredentialsTextInput
                            ref={passwordRef}
                            className={styles['credentials-text-input']}
                            type={'password'}
                            placeholder={'Password'}
                            value={state.password}
                            onChange={passwordOnChange}
                            onSubmit={passwordOnSubmit}
                        />
                    </div>
                    {state.form === SIGNUP_FORM && (
                        <div className={styles['input-wrapper']}>
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
                    )}

                    <div className={styles['legal-container']}>
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

                    {state.error && <div className={styles['error-message']}>{state.error}</div>}
                </div>

                {/* 3. Action Buttons Column (Right) */}
                <div className={styles['buttons-column']}>
                    <Button className={classnames(styles['stack-button'], styles['google-button'])} onClick={() => {}}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className={styles['google-icon']} alt="G" />
                        <div className={styles['label']}>Login with Google</div>
                    </Button>
                    <Button className={classnames(styles['stack-button'], styles['charcoal-button'])} onClick={loginWithEmail}>
                        <div className={styles['label']}>Log in</div>
                    </Button>
                    <Button className={classnames(styles['stack-button'], styles['charcoal-button'])} onClick={loginAsGuest}>
                        <div className={styles['label']}>Guest login</div>
                    </Button>
                </div>
            </div>

            {/* 4. Sign Up Action (Bottom) */}
            <div className={styles['bottom-signup-container']}>
                <Button className={styles['signup-large-button']} onClick={switchFormOnClick}>
                    {state.form === SIGNUP_FORM ? 'Already have an account? Log in' : 'Sign up'}
                </Button>
            </div>

            {passwordRestModalOpen && <PasswordResetModal email={state.email} onCloseRequest={closePasswordResetModal} />}
        </div>
    );
};

Intro.propTypes = {
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

module.exports = Intro;

// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { useServices } = require('stremio/services');
const { default: Button } = require('stremio/components/Button/Button');
const useProfile = require('stremio/common/useProfile');
const { withCoreSuspender } = require('stremio/common/CoreSuspender');
const styles = require('./styles');

// --- Static mock profiles for Netflix-style picker ---
const PROFILES = [
    { id: 'user', name: 'You', color: '#e50914', emoji: '🎬' },
    { id: 'profile2', name: 'Add Profile', color: '#333', emoji: '+', isAdd: true },
];

const NavMenuContent = ({ onClick }) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const profile = useProfile();

    const logoutButtonOnClick = React.useCallback(() => {
        core.transport.dispatch({
            action: 'Ctx',
            args: { action: 'Logout' }
        });
    }, []);

    const displayName = profile.auth === null ? 'Guest' : (profile.auth.user.email?.split('@')[0] || 'User');
    const avatarUrl = profile.auth === null
        ? require('/assets/images/anonymous.png')
        : profile.auth.user.avatar || require('/assets/images/default_avatar.png');

    return (
        <div className={classnames(styles['nav-menu-container'], 'animation-fade-in')} onClick={onClick}>

            {/* Header / Account info */}
            <div className={styles['menu-header']}>
                <div
                    className={styles['header-avatar']}
                    style={{ backgroundImage: `url('${avatarUrl}')` }}
                />
                <div className={styles['header-info']}>
                    <div className={styles['header-name']}>{displayName}</div>
                    <div className={styles['header-email']}>{profile.auth === null ? 'Guest Mode' : profile.auth.user.email}</div>
                </div>
            </div>

            {/* Netflix-style Profile Picker */}
            <div className={styles['profiles-section']}>
                <div className={styles['profiles-label']}>Switch Profile</div>
                <div className={styles['profiles-row']}>
                    {PROFILES.map((p) => (
                        <div key={p.id} className={classnames(styles['profile-card'], { [styles['add-card']]: p.isAdd })}>
                            <div className={styles['profile-avatar']} style={{ background: p.isAdd ? 'rgba(255,255,255,0.06)' : p.color }}>
                                <span className={styles['profile-emoji']}>{p.emoji}</span>
                            </div>
                            <div className={styles['profile-name']}>{p.isAdd ? 'Add' : p.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles['quick-actions']}>
                <Button className={styles['quick-action-btn']} href={'#/settings'}>
                    <Icon className={styles['qa-icon']} name={'settings'} />
                    <span>{t('SETTINGS')}</span>
                </Button>
                <Button className={styles['quick-action-btn']} href={'#/addons'}>
                    <Icon className={styles['qa-icon']} name={'addons-outline'} />
                    <span>Add-ons</span>
                </Button>
                <Button className={styles['quick-action-btn']} href={'https://stremio.zendesk.com/'} target={'_blank'}>
                    <Icon className={styles['qa-icon']} name={'help'} />
                    <span>Help</span>
                </Button>
            </div>

            {/* Sign in / out */}
            <div className={styles['auth-section']}>
                <Button
                    className={styles['auth-btn']}
                    href={profile.auth === null ? '#/intro' : null}
                    onClick={profile.auth !== null ? logoutButtonOnClick : null}
                >
                    <Icon className={styles['qa-icon']} name={profile.auth === null ? 'user' : 'exit'} />
                    <span>{profile.auth === null ? `${t('LOG_IN')} / ${t('SIGN_UP')}` : t('LOG_OUT')}</span>
                </Button>
            </div>
        </div>
    );
};

NavMenuContent.propTypes = {
    onClick: PropTypes.func
};

const NavMenuContentFallback = () => (
    <div className={styles['nav-menu-container']} />
);

module.exports = withCoreSuspender(NavMenuContent, NavMenuContentFallback);

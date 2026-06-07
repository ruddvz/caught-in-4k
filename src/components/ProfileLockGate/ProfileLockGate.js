// Copyright (C) 2026 Caught in 4K — profile PIN lock gate

const React = require('react');
const PropTypes = require('prop-types');
const { useAuth } = require('stremio/common/AuthProvider');
const {
    PROFILE_CHANGE_EVENT,
    createProfileStore,
    getSelectedProfileId,
} = require('stremio/common/profileStore');
const { isProfileUnlocked, markProfileUnlocked } = require('stremio/common/profileUnlock');
const { addLocationChangeListener, getCurrentAppLocation, navigateToAppHref } = require('stremio/common/navigation');
const PinModal = require('stremio/routes/Profiles/PinModal/PinModal');
const styles = require('./styles.less');

const EXEMPT_PATH_PREFIXES = ['/profiles', '/intro', '/subscribe'];

function isExemptPath(pathname) {
    if (typeof pathname !== 'string' || pathname.length === 0) {
        return false;
    }

    return EXEMPT_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const ProfileLockGate = ({ children }) => {
    const auth = useAuth();
    const profileStore = React.useMemo(() => createProfileStore(), []);
    const [pathname, setPathname] = React.useState(() => getCurrentAppLocation().pathname);
    const [profiles, setProfiles] = React.useState([]);
    const [loadingProfiles, setLoadingProfiles] = React.useState(true);
    const [sessionUnlocked, setSessionUnlocked] = React.useState(false);

    const selectedProfileId = typeof localStorage !== 'undefined'
        ? getSelectedProfileId(localStorage, auth)
        : null;

    const activeProfile = React.useMemo(
        () => profiles.find((profile) => profile.id === selectedProfileId) || null,
        [profiles, selectedProfileId]
    );

    const refreshProfiles = React.useCallback(async () => {
        setLoadingProfiles(true);
        try {
            const nextProfiles = await profileStore.loadProfiles({ auth });
            setProfiles(nextProfiles);
        } catch (error) {
            console.error('ProfileLockGate: failed to load profiles', error);
            setProfiles([]);
        } finally {
            setLoadingProfiles(false);
        }
    }, [auth, profileStore]);

    React.useEffect(() => {
        void refreshProfiles();
    }, [refreshProfiles]);

    React.useEffect(() => {
        const handleProfileChange = () => {
            void refreshProfiles();
        };

        window.addEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
        return () => window.removeEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
    }, [refreshProfiles]);

    React.useEffect(() => {
        return addLocationChangeListener((location) => {
            setPathname(location.pathname);
        });
    }, []);

    React.useEffect(() => {
        if (!selectedProfileId) {
            setSessionUnlocked(false);
            return;
        }

        setSessionUnlocked(isProfileUnlocked(selectedProfileId));
    }, [selectedProfileId]);

    const exempt = isExemptPath(pathname);
    const needsPin = Boolean(
        !exempt &&
        activeProfile &&
        activeProfile.hasPin &&
        !sessionUnlocked
    );

    if (needsPin && loadingProfiles) {
        return <div className={styles['profile-lock-loader']} aria-busy="true" aria-live="polite" />;
    }

    if (!needsPin) {
        return children;
    }

    return (
        <div className={styles['profile-lock-shell']}>
            <PinModal
                mode="unlock"
                title={`Unlock ${activeProfile.name}`}
                subtitle={`Enter ${activeProfile.name}'s 4-digit PIN to continue`}
                onSubmitCode={async (code) => {
                    try {
                        const isValid = await profileStore.verifyProfilePin({
                            auth,
                            profileId: activeProfile.id,
                            code,
                        });

                        if (!isValid) {
                            return false;
                        }

                        markProfileUnlocked(activeProfile.id);
                        setSessionUnlocked(true);
                        return true;
                    } catch (error) {
                        return error instanceof Error ? error.message : 'Failed to verify the profile PIN.';
                    }
                }}
                onCancel={() => navigateToAppHref('/profiles')}
            />
        </div>
    );
};

ProfileLockGate.propTypes = {
    children: PropTypes.node.isRequired,
};

module.exports = ProfileLockGate;

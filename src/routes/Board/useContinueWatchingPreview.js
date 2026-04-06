// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useModelState } = require('stremio/common');
const { useAuth } = require('stremio/common/AuthProvider');
const { PROFILE_CHANGE_EVENT, getSelectedProfileId } = require('stremio/common/profileStore');
const { PROFILE_CONTINUE_WATCHING_EVENT, createProfileContinueWatchingStore } = require('../../common/profileContinueWatching');

const useContinueWatchingPreview = () => {
    const auth = useAuth();
    const corePreview = useModelState({ model: 'continue_watching_preview' });
    const historyStore = React.useMemo(() => createProfileContinueWatchingStore(), []);
    const [selectedProfileId, setSelectedProfileId] = React.useState(() => (
        typeof localStorage !== 'undefined' ? getSelectedProfileId(localStorage, auth) : null
    ));

    React.useEffect(() => {
        const refreshSelectedProfile = () => {
            setSelectedProfileId(typeof localStorage !== 'undefined' ? getSelectedProfileId(localStorage, auth) : null);
        };

        refreshSelectedProfile();
        if (typeof window !== 'undefined') {
            window.addEventListener(PROFILE_CHANGE_EVENT, refreshSelectedProfile);
            return () => {
                window.removeEventListener(PROFILE_CHANGE_EVENT, refreshSelectedProfile);
            };
        }

        return undefined;
    }, [auth]);

    const [preview, setPreview] = React.useState(() => (
        selectedProfileId ? historyStore.getPreview({ auth, profileId: selectedProfileId }) : corePreview
    ));

    React.useEffect(() => {
        setPreview(selectedProfileId ? historyStore.getPreview({ auth, profileId: selectedProfileId }) : corePreview);
    }, [auth, corePreview, historyStore, selectedProfileId]);

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const refreshPreview = () => {
            setPreview(selectedProfileId ? historyStore.getPreview({ auth, profileId: selectedProfileId }) : corePreview);
        };

        window.addEventListener(PROFILE_CONTINUE_WATCHING_EVENT, refreshPreview);
        window.addEventListener(PROFILE_CHANGE_EVENT, refreshPreview);

        return () => {
            window.removeEventListener(PROFILE_CONTINUE_WATCHING_EVENT, refreshPreview);
            window.removeEventListener(PROFILE_CHANGE_EVENT, refreshPreview);
        };
    }, [auth, corePreview, historyStore, selectedProfileId]);

    return preview;
};

module.exports = useContinueWatchingPreview;

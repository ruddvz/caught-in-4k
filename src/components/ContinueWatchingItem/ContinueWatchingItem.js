// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { useServices } = require('stremio/services');
const { useAuth } = require('stremio/common/AuthProvider');
const { PROFILE_CHANGE_EVENT, getSelectedProfileId } = require('stremio/common/profileStore');
const { createProfileContinueWatchingStore } = require('../../common/profileContinueWatching');
const LibItem = require('stremio/components/LibItem');

const ContinueWatchingItem = ({ _id, notifications, c4kProfileHistory = false, type, id, ...props }) => {
    const { core } = useServices();
    const auth = useAuth();
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

    const dismissProfileHistory = React.useCallback(() => {
        if (c4kProfileHistory && typeof type === 'string' && typeof id === 'string') {
            historyStore.dismissEntry({ auth, profileId: selectedProfileId, metaId: id, type });
            return true;
        }

        return false;
    }, [auth, c4kProfileHistory, historyStore, id, selectedProfileId, type]);

    const onDismissClick = React.useCallback((event) => {
        event.preventDefault();
        if (dismissProfileHistory()) {
            return;
        }

        if (typeof _id === 'string') {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'RewindLibraryItem',
                    args: _id
                }
            });
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'DismissNotificationItem',
                    args: _id
                }
            });
        }
    }, [_id, core.transport, dismissProfileHistory]);

    const optionOnSelect = React.useCallback((event) => {
        if (event?.value === 'dismiss' && dismissProfileHistory()) {
            event.nativeEvent.optionSelectPrevented = true;
        }
    }, [dismissProfileHistory]);

    return (
        <LibItem
            {...props}
            _id={_id}
            posterChangeCursor={true}
            notifications={notifications}
            onDismissClick={onDismissClick}
            optionOnSelect={optionOnSelect}
        />
    );
};

ContinueWatchingItem.propTypes = {
    _id: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
    c4kProfileHistory: PropTypes.bool,
    notifications: PropTypes.object,
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
};

module.exports = ContinueWatchingItem;

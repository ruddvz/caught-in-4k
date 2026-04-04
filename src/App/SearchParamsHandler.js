// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { deepEqual } = require('fast-equals');
const { addLocationChangeListener, getCurrentAppLocation } = require('stremio/common/navigation');
const { withCoreSuspender, useProfile, useToast } = require('stremio/common');
const { useServices } = require('stremio/services');

const SearchParamsHandler = () => {
    const { core } = useServices();
    const profile = useProfile();
    const toast = useToast();

    const [searchParams, setSearchParams] = React.useState({});

    const onLocationChange = React.useCallback(() => {
        const { queryString } = getCurrentAppLocation();
        const currentSearchParams = Object.fromEntries(new URLSearchParams(queryString).entries());

        setSearchParams((previousSearchParams) => {
            return deepEqual(previousSearchParams, currentSearchParams) ? previousSearchParams : currentSearchParams;
        });
    }, []);

    React.useEffect(() => {
        const { streamingServerUrl } = searchParams;

        if (streamingServerUrl) {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        streamingServerUrl,
                    },
                },
            });
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'AddServerUrl',
                    args: streamingServerUrl,
                },
            });
            toast.show({
                type: 'success',
                title: `Using streaming server at ${streamingServerUrl}`,
                timeout: 4000,
            });
        }
    }, [searchParams]);

    React.useEffect(() => {
        onLocationChange();
        return addLocationChangeListener(onLocationChange);
    }, [onLocationChange]);

    return null;
};

module.exports = withCoreSuspender(SearchParamsHandler);

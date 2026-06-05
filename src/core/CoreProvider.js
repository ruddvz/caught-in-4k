// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { Core } = require('stremio/services');
const CoreContext = require('./CoreContext');

const CoreProvider = ({ appVersion, children }) => {
    const core = React.useMemo(() => new Core({
        appVersion,
        shellVersion: null,
    }), [appVersion]);

    React.useEffect(() => {
        core.start();
        return () => {
            core.stop();
        };
    }, [core]);

    return (
        <CoreContext.Provider value={core}>
            {children}
        </CoreContext.Provider>
    );
};

CoreProvider.propTypes = {
    appVersion: PropTypes.string,
    children: PropTypes.node,
};

module.exports = CoreProvider;

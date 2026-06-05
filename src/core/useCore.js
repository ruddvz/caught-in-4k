// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const CoreContext = require('./CoreContext');

const useCore = () => {
    const core = React.useContext(CoreContext);
    if (!core) {
        throw new Error('useCore must be used within CoreProvider');
    }
    return core;
};

module.exports = useCore;

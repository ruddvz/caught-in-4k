// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const GamepadContext = require('./GamepadContext');

const useGamepad = () => {
    const ctx = React.useContext(GamepadContext);
    if (!ctx) {
        throw new Error('useGamepad must be used within GamepadProvider');
    }
    return ctx;
};

module.exports = useGamepad;

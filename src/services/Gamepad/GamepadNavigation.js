// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const useGamepad = require('./useGamepad');

const DIRECTION_MAP = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
};

const dismissOpenOverlay = () => {
    const closeButton = document.querySelector(
        '[data-gamepad-dismiss], .modal-dialog-container button[aria-label], [role="dialog"] button'
    );
    if (closeButton instanceof HTMLElement) {
        closeButton.click();
        return true;
    }
    return false;
};

/**
 * Maps gamepad D-pad / left-stick analog events to spatial-navigation `window.navigate`.
 */
const GamepadNavigation = () => {
    const gamepad = useGamepad();

    React.useEffect(() => {
        const onAnalog = (direction) => {
            const mapped = DIRECTION_MAP[direction];
            if (mapped && typeof window.navigate === 'function') {
                window.navigate(mapped);
            }
        };

        const onButtonA = () => {
            const active = document.activeElement;
            if (active instanceof HTMLElement && typeof active.click === 'function') {
                active.click();
            }
        };

        const onButtonB = () => {
            if (dismissOpenOverlay()) {
                return;
            }
            if (typeof window.history !== 'undefined' && window.history.length > 1) {
                window.history.back();
            }
        };

        gamepad.on('analog', 'spatial-nav', onAnalog);
        gamepad.on('buttonA', 'spatial-nav', onButtonA);
        gamepad.on('buttonB', 'spatial-nav', onButtonB);

        return () => {
            gamepad.off('analog', 'spatial-nav');
            gamepad.off('buttonA', 'spatial-nav');
            gamepad.off('buttonB', 'spatial-nav');
        };
    }, [gamepad]);

    return null;
};

module.exports = GamepadNavigation;

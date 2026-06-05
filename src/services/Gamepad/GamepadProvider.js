// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { useTranslation } = require('react-i18next');
const { useToast } = require('stremio/common');
const GamepadContext = require('./GamepadContext');

const detectControllerType = (gamepad) => {
    const id = (gamepad.id || '').toLowerCase();
    if (/sony|playstation|dualsense|dualshock|054c/.test(id)) {
        return 'playstation';
    }
    if (/xbox|microsoft|xinput|045e/.test(id)) {
        return 'xbox';
    }
    if (gamepad.mapping === 'standard') {
        return 'xbox';
    }
    return 'generic';
};

const GamepadProvider = ({ enabled, onGuide, children }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const eventHandlers = React.useRef(new Map());
    const lockPrefix = React.useRef(null);
    const lastButtonState = React.useRef([]);
    const lastButtonPressedTime = React.useRef(0);
    const axisTimer = React.useRef(0);
    const axisTimerRight = React.useRef(0);
    const [controllerType, setControllerType] = React.useState('generic');

    const on = React.useCallback((event, id, callback) => {
        if (!eventHandlers.current.has(event)) {
            eventHandlers.current.set(event, new Map());
        }
        eventHandlers.current.get(event).set(id, callback);
    }, []);

    const off = React.useCallback((event, id) => {
        const handlersMap = eventHandlers.current.get(event);
        if (handlersMap) {
            handlersMap.delete(id);
            if (handlersMap.size === 0) {
                eventHandlers.current.delete(event);
            }
        }
    }, []);

    const lock = React.useCallback((prefix) => {
        lockPrefix.current = prefix;
    }, []);

    const unlock = React.useCallback(() => {
        lockPrefix.current = null;
    }, []);

    const emit = React.useCallback((event, data) => {
        const handlersMap = eventHandlers.current.get(event);
        if (!handlersMap || handlersMap.size === 0) {
            return;
        }

        if (lockPrefix.current) {
            const matching = Array.from(handlersMap.entries())
                .filter(([handlerId]) => handlerId.startsWith(lockPrefix.current));
            if (matching.length > 0) {
                matching[matching.length - 1][1](data);
            }
            return;
        }

        const latestHandler = Array.from(handlersMap.values()).slice(-1)[0];
        if (latestHandler) {
            latestHandler(data);
        }
    }, []);

    const onGamepadConnected = React.useCallback((e) => {
        setControllerType(detectControllerType(e.gamepad));
        toast.show({
            type: 'info',
            title: t('GAMEPAD_CONNECTED', 'Controller connected'),
            timeout: 4000,
        });
    }, [toast, t]);

    const onGamepadDisconnected = React.useCallback(() => {
        const remaining = Array.from(navigator.getGamepads()).filter((gp) => gp !== null);
        setControllerType(remaining.length > 0 ? detectControllerType(remaining[0]) : 'generic');
        toast.show({
            type: 'info',
            title: t('GAMEPAD_DISCONNECTED', 'Controller disconnected'),
            timeout: 4000,
        });
    }, [toast, t]);

    React.useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        if (typeof navigator.getGamepads === 'function') {
            const existing = Array.from(navigator.getGamepads()).filter((gp) => gp !== null);
            if (existing.length > 0) {
                setControllerType(detectControllerType(existing[0]));
            }
        }

        window.addEventListener('gamepadconnected', onGamepadConnected);
        window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

        return () => {
            window.removeEventListener('gamepadconnected', onGamepadConnected);
            window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
        };
    }, [enabled, onGamepadConnected, onGamepadDisconnected]);

    React.useEffect(() => {
        if (!onGuide) {
            return undefined;
        }
        on('buttonX', 'guide', onGuide);
        return () => off('buttonX', 'guide');
    }, [onGuide, on, off]);

    React.useEffect(() => {
        if (!enabled || typeof navigator.getGamepads !== 'function') {
            return undefined;
        }

        let animationFrameId;

        const updateStatus = () => {
            if (!document.hasFocus()) {
                animationFrameId = requestAnimationFrame(updateStatus);
                return;
            }

            const currentTime = Date.now();
            const controllers = Array.from(navigator.getGamepads()).filter((gp) => gp !== null);

            controllers.forEach((controller, index) => {
                const buttonsState = controller.buttons.reduce(
                    (buttons, button, i) => buttons | (button.pressed ? 1 << i : 0),
                    0
                );

                const processButton = currentTime - lastButtonPressedTime.current > 250;
                if (lastButtonState.current[index] !== buttonsState || processButton) {
                    lastButtonPressedTime.current = currentTime;
                    lastButtonState.current[index] = buttonsState;

                    if (buttonsState & (1 << 0)) emit('buttonA');
                    if (buttonsState & (1 << 1)) emit('buttonB');
                    if (buttonsState & (1 << 2)) emit('buttonX');
                    if (buttonsState & (1 << 3)) emit('buttonY');
                    if (buttonsState & (1 << 4)) emit('buttonLT');
                    if (buttonsState & (1 << 5)) emit('buttonRT');
                }

                const deadZone = 0.05;
                const maxSpeed = 100;
                let axisHandled = false;

                if (controller.axes[0] < -deadZone) {
                    if (currentTime - axisTimer.current > maxSpeed + (2000 - Math.abs(controller.axes[0]) * 2000)) {
                        emit('analog', 'left');
                        axisHandled = true;
                    }
                }
                if (controller.axes[0] > deadZone) {
                    if (currentTime - axisTimer.current > maxSpeed + (2000 - Math.abs(controller.axes[0]) * 2000)) {
                        emit('analog', 'right');
                        axisHandled = true;
                    }
                }
                if (controller.axes[1] < -deadZone) {
                    if (currentTime - axisTimer.current > maxSpeed + (2000 - Math.abs(controller.axes[1]) * 2000)) {
                        emit('analog', 'up');
                        axisHandled = true;
                    }
                }
                if (controller.axes[1] > deadZone) {
                    if (currentTime - axisTimer.current > maxSpeed + (2000 - Math.abs(controller.axes[1]) * 2000)) {
                        emit('analog', 'down');
                        axisHandled = true;
                    }
                }

                if (axisHandled) {
                    axisTimer.current = currentTime;
                }

                let rightAxisHandled = false;
                if (controller.axes.length > 2) {
                    if (controller.axes[2] < -deadZone && currentTime - axisTimerRight.current > maxSpeed) {
                        emit('analogRight', 'left');
                        rightAxisHandled = true;
                    }
                    if (controller.axes[2] > deadZone && currentTime - axisTimerRight.current > maxSpeed) {
                        emit('analogRight', 'right');
                        rightAxisHandled = true;
                    }
                    if (controller.axes[3] < -deadZone && currentTime - axisTimerRight.current > maxSpeed) {
                        emit('analogRight', 'up');
                        rightAxisHandled = true;
                    }
                    if (controller.axes[3] > deadZone && currentTime - axisTimerRight.current > maxSpeed) {
                        emit('analogRight', 'down');
                        rightAxisHandled = true;
                    }
                }

                if (rightAxisHandled) {
                    axisTimerRight.current = currentTime;
                }
            });

            animationFrameId = requestAnimationFrame(updateStatus);
        };

        animationFrameId = requestAnimationFrame(updateStatus);

        return () => cancelAnimationFrame(animationFrameId);
    }, [enabled, emit]);

    const value = React.useMemo(() => ({
        controllerType,
        on,
        off,
        lock,
        unlock,
    }), [controllerType, on, off, lock, unlock]);

    return (
        <GamepadContext.Provider value={value}>
            {children}
        </GamepadContext.Provider>
    );
};

GamepadProvider.propTypes = {
    enabled: PropTypes.bool,
    onGuide: PropTypes.func,
    children: PropTypes.node,
};

module.exports = GamepadProvider;

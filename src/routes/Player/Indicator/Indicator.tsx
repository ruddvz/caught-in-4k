import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { t } from 'i18next';
import { Transition } from 'stremio/components';
import { useBinaryState } from 'stremio/common';
import styles from './Indicator.less';

type Property = {
    label: string,
    format: (value: number) => string,
};

const PROPERTIES: Record<string, Property> = {
    'extraSubtitlesDelay': {
        label: 'SUBTITLES_DELAY',
        format: (value) => `${(value / 1000).toFixed(2)}s`,
    },
};

type VideoState = Record<string, number>;

type Props = {
    className: string,
    videoState: VideoState,
    disabled: boolean,
};

const Indicator = ({ className, videoState, disabled }: Props) => {
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const prevVideoState = useRef<VideoState>(videoState);
    // Tracks which properties we've already seen at least once. The first value
    // a property reports is its initial state on player open — not a user change
    // — so we record it without flashing the on-screen indicator. Only genuine
    // subsequent changes (e.g. the user nudging subtitle delay) surface the HUD.
    const initialized = useRef<Set<string>>(new Set());

    const [shown, show, hide] = useBinaryState(false);
    const [current, setCurrent] = useState<string | null>(null);

    const label = useMemo(() => {
        const property = current && PROPERTIES[current];
        return property && t(property.label);
    }, [current]);

    const value = useMemo(() => {
        const property = current && PROPERTIES[current];
        const value = current && videoState[current];
        return property && value && property.format(value);
    }, [current, videoState]);

    useEffect(() => {
        for (const property of Object.keys(PROPERTIES)) {
            const prev = prevVideoState.current[property];
            const next = videoState[property];

            if (next && next !== prev) {
                if (!initialized.current.has(property)) {
                    initialized.current.add(property);
                } else {
                    setCurrent(property);
                    show();

                    timeout.current && clearTimeout(timeout.current);
                    timeout.current = setTimeout(hide, 1000);
                }
            }
        }

        prevVideoState.current = videoState;
    }, [videoState]);

    return (
        <Transition when={shown && !disabled} name={'fade'}>
            <div className={classNames(className, styles['indicator-container'])}>
                <div className={styles['indicator']}>
                    <div>{label} {value}</div>
                </div>
            </div>
        </Transition>
    );
};

export default Indicator;

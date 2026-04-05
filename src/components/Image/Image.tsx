// Copyright (C) 2017-2023 Smart code 203358507

import React, { useCallback, useLayoutEffect, useState } from 'react';
// @ts-expect-error less modules are resolved by webpack
import styles from './styles.less';

type Props = {
    className: string,
    src: string,
    alt: string,
    fallbackSrc: string,
    renderFallback: () => React.ReactNode,
    onError: (event: React.SyntheticEvent<HTMLImageElement>) => void,
};

// Default fallback: dark grey rectangle with a subtle photo outline icon
// Shown when an image fails to load and no custom fallback is provided
const DefaultImageFallback = ({ className }: { className?: string }) => (
    <div className={`${styles['image-fallback']}${className ? ` ${className}` : ''}`}>
        <svg
            width="40%"
            height="40%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    </div>
);

const Image = ({ className, src, alt, fallbackSrc, renderFallback, ...props }: Props) => {
    const [broken, setBroken] = useState(false);
    const onError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        if (typeof props.onError === 'function') {
            props.onError(event);
        }

        setBroken(true);
    }, [props.onError]);

    useLayoutEffect(() => {
        setBroken(false);
    }, [src]);

    if (broken || typeof src !== 'string' || src.length === 0) {
        if (typeof renderFallback === 'function') return renderFallback();
        if (typeof fallbackSrc === 'string') return <img {...props} className={className} src={fallbackSrc} alt={alt} loading='lazy' />;
        return <DefaultImageFallback className={className} />; // merges with image-fallback class
    }

    return <img {...props} className={className} src={src} alt={alt} loading='lazy' onError={onError} />;
};

export default Image;

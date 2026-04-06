// Inline Tabler icon paths — identical to @tabler/icons-react but zero bundle cost.
// Use these instead of importing from @tabler/icons-react to avoid bundling 5000+ icons.
// Paths sourced from @tabler/icons v3.40.0 (MIT).

import React from 'react';

type IconProps = {
    className?: string;
    strokeWidth?: number;
    'aria-hidden'?: boolean | 'true' | 'false';
};

const defaults = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

export const IconSearch = ({ className, strokeWidth = 1.5, ...rest }: IconProps) => (
    <svg {...defaults} strokeWidth={strokeWidth} className={className} {...rest}>
        <circle cx="10" cy="10" r="7" />
        <line x1="21" y1="21" x2="15" y2="15" />
    </svg>
);

// Enter fullscreen — outward arrows (Feather Maximize2)
export const IconMaximize = ({ className, strokeWidth = 1.5, ...rest }: IconProps) => (
    <svg {...defaults} strokeWidth={strokeWidth} className={className} {...rest}>
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

// Exit fullscreen — inward arrows (Feather Minimize2)
export const IconMinimize = ({ className, strokeWidth = 1.5, ...rest }: IconProps) => (
    <svg {...defaults} strokeWidth={strokeWidth} className={className} {...rest}>
        <polyline points="4 14 10 14 10 20" />
        <polyline points="20 10 14 10 14 4" />
        <line x1="3" y1="21" x2="10" y2="14" />
        <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
);

export const IconUser = ({ className, strokeWidth = 1.5, ...rest }: IconProps) => (
    <svg {...defaults} strokeWidth={strokeWidth} className={className} {...rest}>
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    </svg>
);

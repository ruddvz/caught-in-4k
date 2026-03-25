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

export const IconMaximize = ({ className, strokeWidth = 1.5, ...rest }: IconProps) => (
    <svg {...defaults} strokeWidth={strokeWidth} className={className} {...rest}>
        <path d="M4 8V6a2 2 0 0 1 2 -2h2" />
        <path d="M4 16v2a2 2 0 0 0 2 2h2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v2" />
        <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
    </svg>
);

export const IconMinimize = ({ className, strokeWidth = 1.5, ...rest }: IconProps) => (
    <svg {...defaults} strokeWidth={strokeWidth} className={className} {...rest}>
        <path d="M5 9l4 0l0 -4" />
        <path d="M3 7l6 6" />
        <path d="M19 9l-4 0l0 -4" />
        <path d="M21 7l-6 6" />
        <path d="M5 15l4 0l0 4" />
        <path d="M3 17l6 -6" />
        <path d="M19 15l-4 0l0 4" />
        <path d="M21 17l-6 -6" />
    </svg>
);

export const IconUser = ({ className, strokeWidth = 1.5, ...rest }: IconProps) => (
    <svg {...defaults} strokeWidth={strokeWidth} className={className} {...rest}>
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    </svg>
);

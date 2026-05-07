import * as React from 'react';

/** Props mirror MetaPreview.js propTypes — JS component, typed for TS consumers (e.g. SideDrawer). */
export interface MetaPreviewProps {
    className?: string;
    compact?: boolean;
    variant?: 'browse' | 'details' | 'drawer';
    name?: string;
    logo?: string | null;
    background?: string;
    runtime?: string | null;
    releaseInfo?: string | null;
    released?: Date | null | undefined;
    description?: string | null;
    deepLinks?: {
        metaDetailsVideos?: string;
        metaDetailsStreams?: string;
        player?: string;
    };
    links?: { category?: string; name?: string; url?: string }[];
    trailerStreams?: unknown[];
    inLibrary?: boolean;
    toggleInLibrary?: () => void;
    ratingInfo?: unknown;
    imdbRating?: number | string;
    voteAverage?: number;
}

declare const MetaPreview: React.ForwardRefExoticComponent<
    MetaPreviewProps & React.RefAttributes<HTMLDivElement>
> & {
    Placeholder: React.ComponentType<Record<string, unknown>>;
};

export default MetaPreview;

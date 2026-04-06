// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const UrlUtils = require('url');
const { useTranslation } = require('react-i18next');
const { default: Image } = require('stremio/components/Image');
const ModalDialog = require('stremio/components/ModalDialog');
const SharePrompt = require('stremio/components/SharePrompt');
const ExternalRatings = require('stremio/components/ExternalRatings/ExternalRatings');
const CONSTANTS = require('stremio/common/CONSTANTS');
const { buildExternalRatingsModel } = require('stremio/common/externalRatings');
const { navigateToAppHref } = require('stremio/common/navigation');
const routesRegexp = require('stremio/common/routesRegexp');
const useBinaryState = require('stremio/common/useBinaryState');
const useProfile = require('stremio/common/useProfile');
const ActionButton = require('./ActionButton');
const MetaLinks = require('./MetaLinks');
const MetaPreviewPlaceholder = require('./MetaPreviewPlaceholder');
const styles = require('./styles');
const { Ratings } = require('./Ratings');

const ALLOWED_LINK_REDIRECTS = [
    routesRegexp.search.regexp,
    routesRegexp.discover.regexp,
    routesRegexp.metadetails.regexp,
];

const isExternalRatingCategory = (category) => {
    if (typeof category !== 'string') {
        return false;
    }

    const normalizedCategory = category.toLowerCase();
    return category === CONSTANTS.IMDB_LINK_CATEGORY || normalizedCategory.includes('tomatoes') || normalizedCategory.includes('metacritic');
};

const MetaPreview = React.forwardRef(({
    className,
    compact,
    variant,
    name,
    logo,
    background,
    runtime,
    releaseInfo,
    released,
    description,
    deepLinks,
    links,
    trailerStreams,
    inLibrary,
    toggleInLibrary,
    ratingInfo,
    imdbRating: imdbRatingProp,
    voteAverage: voteAverageProp,
}, ref) => {
    const { t } = useTranslation();
    const [shareModalOpen, openShareModal, closeShareModal] = useBinaryState(false);
    const profile = useProfile();

    const handleToggleInLibrary = React.useCallback(() => {
        if (!profile?.auth) {
            navigateToAppHref('/intro');
            return;
        }

        if (typeof toggleInLibrary === 'function') {
            toggleInLibrary();
        }
    }, [profile, toggleInLibrary]);

    const imdbRating = React.useMemo(() => {
        const parsedImdbRating = typeof imdbRatingProp === 'number' ? imdbRatingProp : parseFloat(imdbRatingProp);
        if (!isNaN(parsedImdbRating)) {
            return parsedImdbRating;
        }

        if (!Array.isArray(links)) {
            return null;
        }

        const imdbLink = links.find((link) => link && link.category === CONSTANTS.IMDB_LINK_CATEGORY);
        if (!imdbLink || !imdbLink.name) {
            return null;
        }

        const parsed = parseFloat(imdbLink.name);
        return isNaN(parsed) ? null : parsed;
    }, [imdbRatingProp, links]);

    const ratingsModel = React.useMemo(() => buildExternalRatingsModel({
        links,
        imdbRating,
        voteAverage: voteAverageProp,
    }), [imdbRating, links, voteAverageProp]);

    const effectiveVariant = variant || (compact ? 'drawer' : 'details');
    const showCompactRatings = compact && effectiveVariant === 'browse';
    const showFullRatings = effectiveVariant === 'details';

    const linksGroups = React.useMemo(() => {
        return Array.isArray(links)
            ? links
                .filter((link) => link && typeof link.category === 'string' && typeof link.url === 'string')
                .reduce((groups, { category, name: linkName, url }) => {
                    if (isExternalRatingCategory(category) && effectiveVariant !== 'drawer') {
                        return groups;
                    }

                    const { protocol, path, pathname, hostname } = UrlUtils.parse(url);

                    if (category === CONSTANTS.SHARE_LINK_CATEGORY) {
                        groups.set(category, {
                            label: linkName,
                            href: url,
                        });
                        return groups;
                    }

                    if (typeof hostname === 'string' && hostname.length > 0) {
                        if (!groups.has(category)) {
                            groups.set(category, []);
                        }
                        groups.get(category).push({
                            label: linkName,
                            href: `https://www.stremio.com/warning#${encodeURIComponent(url)}`,
                        });
                        return groups;
                    }

                    if (protocol === 'stremio:' && pathname !== null && ALLOWED_LINK_REDIRECTS.some((regexp) => pathname.match(regexp))) {
                        if (!groups.has(category)) {
                            groups.set(category, []);
                        }
                        groups.get(category).push({
                            label: linkName,
                            href: `#${path}`,
                        });
                    }

                    return groups;
                }, new Map())
            : new Map();
    }, [effectiveVariant, links]);

    const showHref = React.useMemo(() => {
        if (!deepLinks) {
            return null;
        }

        return deepLinks.player || deepLinks.metaDetailsStreams || deepLinks.metaDetailsVideos || null;
    }, [deepLinks]);

    const trailerHref = React.useMemo(() => {
        if (!Array.isArray(trailerStreams) || trailerStreams.length === 0) {
            return null;
        }

        return trailerStreams[0]?.deepLinks?.player || null;
    }, [trailerStreams]);

    const renderLogoFallback = React.useCallback(() => (
        <div className={styles['logo-placeholder']}>{name}</div>
    ), [name]);

    return (
        <div
            className={classnames(className, styles['meta-preview-container'], {
                [styles['compact']]: compact,
                [styles['browse-compact']]: showCompactRatings,
                [styles['drawer-compact']]: effectiveVariant === 'drawer',
            })}
            ref={ref}
        >
            <div className={styles['main-details-glass']}>
                <div className={styles['hero-widget']}>
                    {typeof background === 'string' && background.length > 0 ? (
                        <div className={styles['background-image-layer']}>
                            <Image className={styles['background-image']} src={background} alt={' '} />
                        </div>
                    ) : null}

                    <div className={styles['hero-widget-content']}>
                        {typeof logo === 'string' && logo.length > 0 ? (
                            <Image
                                className={styles['logo']}
                                src={logo}
                                alt={' '}
                                title={name}
                                renderFallback={renderLogoFallback}
                            />
                        ) : renderLogoFallback()}

                        {(typeof runtime === 'string' && runtime.length > 0) || (typeof releaseInfo === 'string' && releaseInfo.length > 0) || (released instanceof Date && !isNaN(released.getTime())) ? (
                            <div className={styles['runtime-release-info-container']}>
                                {typeof runtime === 'string' && runtime.length > 0 ? <div className={styles['runtime-label']}>{runtime}</div> : null}
                                {typeof releaseInfo === 'string' && releaseInfo.length > 0 ? (
                                    <div className={styles['release-info-label']}>{releaseInfo}</div>
                                ) : released instanceof Date && !isNaN(released.getTime()) ? (
                                    <div className={styles['release-info-label']}>{released.getFullYear()}</div>
                                ) : null}
                            </div>
                        ) : null}

                        {showCompactRatings ? <ExternalRatings className={styles['compact-ratings']} model={ratingsModel} mode={'compact'} /> : null}

                        <div className={styles['action-buttons-container']}>
                            {typeof showHref === 'string' ? (
                                <ActionButton
                                    className={classnames(styles['action-button'], styles['show-button'])}
                                    icon={'play'}
                                    label={t('SHOW')}
                                    tabIndex={compact ? -1 : 0}
                                    href={showHref}
                                    tooltip={compact}
                                />
                            ) : null}

                            {typeof toggleInLibrary === 'function' ? (
                                <ActionButton
                                    className={styles['action-button']}
                                    icon={inLibrary ? 'remove-from-library' : 'add-to-library'}
                                    label={inLibrary ? t('REMOVE_FROM_LIB') : t('ADD_TO_LIB')}
                                    tooltip={compact}
                                    tabIndex={compact ? -1 : 0}
                                    onClick={handleToggleInLibrary}
                                />
                            ) : null}

                            {typeof trailerHref === 'string' ? (
                                <ActionButton
                                    className={styles['action-button']}
                                    icon={'trailer'}
                                    label={t('TRAILER')}
                                    tabIndex={compact ? -1 : 0}
                                    href={trailerHref}
                                    tooltip={compact}
                                />
                            ) : null}

                            {!compact && ratingInfo !== null ? <Ratings ratingInfo={ratingInfo} className={styles['ratings']} /> : null}

                            {linksGroups.has(CONSTANTS.SHARE_LINK_CATEGORY) && !compact ? (
                                <React.Fragment>
                                    <ActionButton
                                        className={styles['action-button']}
                                        icon={'share'}
                                        label={t('CTX_SHARE')}
                                        tooltip={true}
                                        tabIndex={0}
                                        onClick={openShareModal}
                                    />
                                    {shareModalOpen ? (
                                        <ModalDialog title={t('CTX_SHARE')} onCloseRequest={closeShareModal}>
                                            <SharePrompt
                                                className={styles['share-prompt']}
                                                url={linksGroups.get(CONSTANTS.SHARE_LINK_CATEGORY).href}
                                            />
                                        </ModalDialog>
                                    ) : null}
                                </React.Fragment>
                            ) : null}
                        </div>

                        {showFullRatings ? <ExternalRatings className={styles['full-ratings']} model={ratingsModel} /> : null}
                    </div>
                </div>

                {typeof description === 'string' && description.length > 0 ? (
                    <div className={styles['description-widget']}>
                        <div className={styles['label-container']}>{t('SUMMARY')}</div>
                        <div className={styles['description-text']}>{description}</div>
                    </div>
                ) : null}

                {Array.from(linksGroups.keys()).filter((category) => category !== CONSTANTS.SHARE_LINK_CATEGORY && category !== CONSTANTS.WRITERS_LINK_CATEGORY).length > 0 ? (
                    <div className={styles['meta-links-widget']}>
                        {Array.from(linksGroups.keys())
                            .filter((category) => category !== CONSTANTS.SHARE_LINK_CATEGORY && category !== CONSTANTS.WRITERS_LINK_CATEGORY)
                            .map((category, index) => (
                                <MetaLinks
                                    key={index}
                                    className={styles['meta-links']}
                                    label={category}
                                    links={linksGroups.get(category)}
                                />
                            ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
});

MetaPreview.Placeholder = MetaPreviewPlaceholder;

MetaPreview.propTypes = {
    className: PropTypes.string,
    compact: PropTypes.bool,
    variant: PropTypes.oneOf(['browse', 'details', 'drawer']),
    name: PropTypes.string,
    logo: PropTypes.string,
    background: PropTypes.string,
    runtime: PropTypes.string,
    releaseInfo: PropTypes.string,
    released: PropTypes.instanceOf(Date),
    description: PropTypes.string,
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string,
    }),
    links: PropTypes.arrayOf(PropTypes.shape({
        category: PropTypes.string,
        name: PropTypes.string,
        url: PropTypes.string,
    })),
    trailerStreams: PropTypes.array,
    inLibrary: PropTypes.bool,
    toggleInLibrary: PropTypes.func,
    ratingInfo: PropTypes.object,
    imdbRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    voteAverage: PropTypes.number,
};

module.exports = MetaPreview;

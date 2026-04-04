// Copyright (C) 2017-2023 Smart code 203358507

const UrlUtils = require('url');
const routesRegexp = require('./routesRegexp');

const LEGACY_HASH_ROUTE_PREFIX = '#/';
const GH_PAGES_REDIRECT_PARAM = 'p';

const normalizeSearchString = (search) => {
    if (typeof search !== 'string' || search.length === 0) {
        return '';
    }

    return search.startsWith('?') ? search.slice(1) : search;
};

const ensureLeadingSlash = (pathname) => {
    if (typeof pathname !== 'string' || pathname.length === 0) {
        return '/';
    }

    return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

const normalizeBasePath = (publicPath) => {
    const normalizedPublicPath = ensureLeadingSlash(typeof publicPath === 'string' && publicPath.length > 0 ? publicPath : '/');
    return normalizedPublicPath === '/' ? '' : normalizedPublicPath.replace(/\/$/, '');
};

const APP_BASE_PATH = normalizeBasePath(typeof process !== 'undefined' ? process.env.APP_PUBLIC_PATH : '/');

const stripBasePath = (pathname) => {
    const normalizedPathname = ensureLeadingSlash(pathname);

    if (APP_BASE_PATH.length > 0) {
        if (normalizedPathname === APP_BASE_PATH) {
            return '/';
        }

        if (normalizedPathname.startsWith(`${APP_BASE_PATH}/`)) {
            return normalizedPathname.slice(APP_BASE_PATH.length);
        }
    }

    return normalizedPathname;
};

const addBasePath = (pathname) => {
    const normalizedPathname = stripBasePath(pathname);

    if (APP_BASE_PATH.length === 0) {
        return normalizedPathname;
    }

    return normalizedPathname === '/' ? `${APP_BASE_PATH}/` : `${APP_BASE_PATH}${normalizedPathname}`;
};

const mergeHrefWithSearch = (href, search) => {
    const { pathname, query } = UrlUtils.parse(href);
    const mergedSearchParams = new URLSearchParams(normalizeSearchString(search));
    const routeSearchParams = new URLSearchParams(typeof query === 'string' ? query : '');

    mergedSearchParams.delete(GH_PAGES_REDIRECT_PARAM);
    routeSearchParams.forEach((value, key) => {
        mergedSearchParams.set(key, value);
    });

    return buildAppHref(typeof pathname === 'string' ? pathname : '/', mergedSearchParams);
};

const legacyHashToPath = (hash) => {
    if (typeof hash !== 'string' || !hash.startsWith(LEGACY_HASH_ROUTE_PREFIX)) {
        return null;
    }

    const legacyPath = hash.slice(1);
    return legacyPath.length > 0 ? legacyPath : '/';
};

const decodeGhPagesRedirect = (search) => {
    const searchParams = new URLSearchParams(normalizeSearchString(search));
    const redirectPath = searchParams.get(GH_PAGES_REDIRECT_PARAM);

    return typeof redirectPath === 'string' && redirectPath.length > 0 ?
        redirectPath
        :
        null;
};

const buildAppHref = (pathname, query) => {
    const normalizedPath = addBasePath(typeof pathname === 'string' ? pathname : '/');
    let queryString = '';

    if (typeof query === 'string') {
        queryString = normalizeSearchString(query);
    } else if (query instanceof URLSearchParams) {
        queryString = query.toString();
    } else if (query && typeof query === 'object') {
        queryString = new URLSearchParams(
            Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== '')
        ).toString();
    }

    return queryString.length > 0 ? `${normalizedPath}?${queryString}` : normalizedPath;
};

const normalizeAppHref = (href, currentOrigin) => {
    if (typeof href !== 'string' || href.length === 0) {
        return '/';
    }

    const legacyPath = legacyHashToPath(href);
    if (legacyPath !== null) {
        return legacyPath;
    }

    if (href.startsWith('#')) {
        return href;
    }

    if (/^(?:mailto:|tel:|data:|javascript:)/i.test(href)) {
        return href;
    }

    const origin = typeof currentOrigin === 'string' && currentOrigin.length > 0 ? currentOrigin : 'https://c4k.live';

    try {
        const url = new URL(href, origin);

        if (url.origin !== origin) {
            return href;
        }

        const urlLegacyPath = legacyHashToPath(url.hash);
        if (urlLegacyPath !== null) {
            return buildAppHref(urlLegacyPath);
        }

        if (typeof url.hash === 'string' && url.hash.length > 0) {
            return href;
        }

        const pathname = stripBasePath(url.pathname);
        return isAppRoutePath(pathname) ? buildAppHref(pathname, url.search) : `${ensureLeadingSlash(url.pathname)}${url.search}${url.hash}`;
    } catch (_error) {
        return href;
    }
};

const isAppRoutePath = (pathname) => {
    return Object.values(routesRegexp).some(({ regexp }) => regexp.test(pathname));
};

const isAppHref = (href, currentOrigin) => {
    const normalizedHref = normalizeAppHref(href, currentOrigin);

    if (typeof normalizedHref !== 'string' || !normalizedHref.startsWith('/')) {
        return false;
    }

    const { pathname } = UrlUtils.parse(normalizedHref);

    return typeof pathname === 'string' && isAppRoutePath(stripBasePath(pathname));
};

const resolveCanonicalAppLocation = ({ pathname, search, hash }) => {
    const redirectedHref = decodeGhPagesRedirect(search);
    if (redirectedHref !== null) {
        return {
            href: mergeHrefWithSearch(normalizeAppHref(redirectedHref), search),
            needsReplace: true,
        };
    }

    const legacyPath = legacyHashToPath(hash);
    if (legacyPath !== null) {
        return {
            href: mergeHrefWithSearch(normalizeAppHref(legacyPath), search),
            needsReplace: true,
        };
    }

    return {
        href: buildAppHref(stripBasePath(typeof pathname === 'string' ? pathname : '/'), search),
        needsReplace: false,
    };
};

const getCurrentAppLocation = (locationObject = window.location) => {
    const { href } = resolveCanonicalAppLocation(locationObject);
    const { pathname, query } = UrlUtils.parse(href);

    return {
        href,
        pathname: stripBasePath(typeof pathname === 'string' ? pathname : '/'),
        queryString: typeof query === 'string' ? query : '',
    };
};

const dispatchLocationChange = () => {
    window.dispatchEvent(new Event('locationchange'));
};

const syncWindowLocation = () => {
    const { href, needsReplace } = resolveCanonicalAppLocation(window.location);
    const currentHref = `${window.location.pathname}${window.location.search}`;

    if (!needsReplace || currentHref === href) {
        return false;
    }

    window.history.replaceState(window.history.state, '', href);
    dispatchLocationChange();

    return true;
};

const addLocationChangeListener = (listener) => {
    const onLocationChange = () => {
        if (syncWindowLocation()) {
            return;
        }

        listener(getCurrentAppLocation());
    };

    window.addEventListener('locationchange', onLocationChange);
    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);

    return () => {
        window.removeEventListener('locationchange', onLocationChange);
        window.removeEventListener('popstate', onLocationChange);
        window.removeEventListener('hashchange', onLocationChange);
    };
};

const navigateToAppHref = (href, options = {}) => {
    const normalizedHref = normalizeAppHref(href, window.location.origin);

    if (!isAppHref(normalizedHref, window.location.origin)) {
        if (options.replace) {
            window.location.replace(href);
        } else {
            window.location.assign(href);
        }

        return false;
    }

    const currentHref = resolveCanonicalAppLocation(window.location).href;
    if (currentHref === normalizedHref) {
        return true;
    }

    window.history[options.replace ? 'replaceState' : 'pushState'](window.history.state, '', normalizedHref);
    dispatchLocationChange();

    return true;
};

const getNavigationTargetForEvent = (event) => {
    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
    ) {
        return null;
    }

    const anchor = event.target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) {
        return null;
    }

    if ((typeof anchor.target === 'string' && anchor.target.length > 0 && anchor.target !== '_self') || anchor.hasAttribute('download')) {
        return null;
    }

    const href = anchor.getAttribute('href');
    if (!isAppHref(href, window.location.origin)) {
        return null;
    }

    return {
        anchor,
        href: normalizeAppHref(href, window.location.origin),
    };
};

module.exports = {
    addLocationChangeListener,
    buildAppHref,
    decodeGhPagesRedirect,
    getCurrentAppLocation,
    getNavigationTargetForEvent,
    isAppHref,
    legacyHashToPath,
    navigateToAppHref,
    normalizeAppHref,
    resolveCanonicalAppLocation,
    syncWindowLocation,
};

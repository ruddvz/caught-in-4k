const CONSTANTS = require('../../common/CONSTANTS');
const routesRegexp = require('../../common/routesRegexp');

const ALLOWED_LINK_REDIRECTS = [
    routesRegexp.search.regexp,
    routesRegexp.discover.regexp,
    routesRegexp.metadetails.regexp,
];

function getMetaPreviewLinksGroups({ links, ratingLinkHrefs, showFullRatings }) {
    const matchedRatingLinkHrefs = ratingLinkHrefs instanceof Set
        ? ratingLinkHrefs
        : new Set(Array.isArray(ratingLinkHrefs) ? ratingLinkHrefs : []);

    return Array.isArray(links)
        ? links
            .filter((link) => link && typeof link.category === 'string' && typeof link.url === 'string')
            .reduce((groups, { category, name: linkName, url }) => {
                if (showFullRatings && matchedRatingLinkHrefs.has(url)) {
                    return groups;
                }

                let parsedUrl = null;
                try {
                    parsedUrl = new URL(url);
                } catch (_) {
                    parsedUrl = null;
                }

                const protocol = parsedUrl?.protocol || null;
                const pathname = parsedUrl?.pathname || null;
                const hostname = parsedUrl?.hostname || null;
                const path = parsedUrl ? `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}` : null;

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
}

module.exports = {
    getMetaPreviewLinksGroups,
};

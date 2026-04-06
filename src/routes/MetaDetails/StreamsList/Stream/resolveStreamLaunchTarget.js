function resolveExternalHref(deepLinks, platformName) {
    if (!deepLinks?.externalPlayer) {
        return null;
    }

    if (typeof deepLinks.externalPlayer.web === 'string' && deepLinks.externalPlayer.web.length > 0) {
        return deepLinks.externalPlayer.web;
    }

    const platformHref = deepLinks.externalPlayer.openPlayer?.[platformName];
    if (typeof platformHref === 'string' && platformHref.length > 0) {
        return platformHref;
    }

    if (typeof deepLinks.externalPlayer.playlist === 'string' && deepLinks.externalPlayer.playlist.length > 0) {
        return deepLinks.externalPlayer.playlist;
    }

    return null;
}

function resolveStreamLaunchTarget({ deepLinks, playerType, platformName }) {
    if (!deepLinks) {
        return {
            href: null,
            target: null,
            download: null,
            isExternal: false,
        };
    }

    const internalHref = typeof deepLinks.player === 'string' && deepLinks.player.length > 0 ? deepLinks.player : null;
    const externalHref = resolveExternalHref(deepLinks, platformName);
    const prefersExternal = playerType !== null && typeof playerType !== 'undefined';
    const href = prefersExternal ? (externalHref || internalHref) : (internalHref || externalHref);
    const isExternal = Boolean(externalHref && href === externalHref);

    return {
        href,
        target: href === deepLinks?.externalPlayer?.web ? '_blank' : null,
        download: href === deepLinks?.externalPlayer?.playlist ? deepLinks.externalPlayer.fileName : null,
        isExternal,
    };
}

module.exports = {
    resolveStreamLaunchTarget,
};

function getProtocol(href) {
    try {
        return new URL(href, 'http://localhost').protocol;
    } catch {
        return null;
    }
}

function isHttpProtocol(protocol) {
    return protocol === 'http:' || protocol === 'https:';
}

function isBlockedProtocol(protocol) {
    return protocol === 'javascript:'
        || protocol === 'data:'
        || protocol === 'file:'
        || protocol === 'blob:'
        || protocol === 'about:';
}

function resolveExternalPlayerFallbackTarget({
    exhausted,
    externalPlayerFallbackEnabled,
    playerType,
    selectedStream,
    videoStream,
    platformName,
}) {
    if (!exhausted || !externalPlayerFallbackEnabled || !playerType) {
        return null;
    }

    const stream = selectedStream || videoStream;
    if (!stream?.deepLinks) {
        return null;
    }

    const externalPlayer = stream.deepLinks.externalPlayer;
    const platformHref = externalPlayer?.openPlayer?.[platformName];
    const platformProtocol = getProtocol(platformHref);

    if (
        typeof platformHref === 'string'
        && platformHref.length > 0
        && platformProtocol
        && !isHttpProtocol(platformProtocol)
        && !isBlockedProtocol(platformProtocol)
    ) {
        return {
            href: platformHref,
            target: null,
            download: null,
            isExternal: true,
        };
    }

    const playlistHref = externalPlayer?.playlist;
    const playlistProtocol = getProtocol(playlistHref);

    if (typeof playlistHref === 'string' && playlistHref.length > 0 && isHttpProtocol(playlistProtocol)) {
        return {
            href: playlistHref,
            target: null,
            download: externalPlayer.fileName || null,
            isExternal: true,
        };
    }

    return null;
}

module.exports = {
    resolveExternalPlayerFallbackTarget,
};

// Copyright (C) 2017-2023 Smart code 203358507

const routesRegexp = {
    intro: {
        regexp: /^\/intro$/,
        urlParamsNames: []
    },
    authPreview: {
        regexp: /^\/auth-preview$/,
        urlParamsNames: []
    },
    shadersHeroPreview: {
        regexp: /^\/shaders-hero-preview$/,
        urlParamsNames: []
    },
    board: {
        regexp: /^\/?(?:board)?$/,
        urlParamsNames: []
    },
    discover: {
        regexp: /^\/discover(?:\/([^/]*)\/([^/]*)\/([^/]*))?$/,
        urlParamsNames: ['transportUrl', 'type', 'catalogId']
    },
    library: {
        regexp: /^\/library(?:\/([^/]*))?$/,
        urlParamsNames: ['type']
    },
    calendar: {
        regexp: /^\/calendar(?:\/([^/]*)\/([^/]*))?$/,
        urlParamsNames: ['year', 'month']
    },
    continuewatching: {
        regexp: /^\/continuewatching(?:\/([^/]*))?$/,
        urlParamsNames: ['type']
    },
    search: {
        regexp: /^\/search$/,
        urlParamsNames: []
    },
    metadetails: {
        regexp: /^\/(?:metadetails|detail)\/([^/]*)\/([^/]*)(?:\/([^/]*))?$/,
        urlParamsNames: ['type', 'id', 'videoId']
    },
    addons: {
        regexp: /^\/addons(?:\/([^/]*)(?:\/([^/]*)\/([^/]*))?)?$/,
        urlParamsNames: ['type', 'transportUrl', 'catalogId']
    },
    settings: {
        regexp: /^\/settings$/,
        urlParamsNames: []
    },
    settingsShortcuts: {
        regexp: /^\/settings\/shortcuts$/,
        urlParamsNames: []
    },
    player: {
        regexp: /^\/player\/([^/]*)(?:\/([^/]*)\/([^/]*)\/([^/]*)\/([^/]*)\/([^/]*))?$/,
        urlParamsNames: ['stream', 'streamTransportUrl', 'metaTransportUrl', 'type', 'id', 'videoId']
    },
    tos: {
        regexp: /^\/tos$/,
        urlParamsNames: []
    },
    privacy: {
        regexp: /^\/privacy$/,
        urlParamsNames: []
    },
    profiles: {
        regexp: /^\/profiles$/,
        urlParamsNames: []
    },
    subscribe: {
        regexp: /^\/subscribe$/,
        urlParamsNames: []
    },
    admin: {
        regexp: /^\/admin$/,
        urlParamsNames: []
    },
    pricingDemo: {
        regexp: /^\/pricing-demo$/,
        urlParamsNames: []
    }
};

module.exports = routesRegexp;

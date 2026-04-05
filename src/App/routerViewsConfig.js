// Copyright (C) 2017-2023 Smart code 203358507

const routes = require('stremio/routes');
const { routesRegexp } = require('stremio/common');

const routerViewsConfig = [
    [
        {
            ...routesRegexp.board,
            component: routes.Board
        }
    ],
    [
        {
            ...routesRegexp.intro,
            component: routes.Intro
        },
        {
            ...routesRegexp.shadersHeroPreview,
            component: routes.ShadersHeroPreview
        },
        {
            ...routesRegexp.discover,
            component: routes.Discover
        },
        {
            ...routesRegexp.library,
            component: routes.Library
        },
        {
            ...routesRegexp.continuewatching,
            component: routes.Library
        },
        {
            ...routesRegexp.search,
            component: routes.Search
        }
    ],
    [
        {
            ...routesRegexp.metadetails,
            component: routes.MetaDetails
        }
    ],
    [
        {
            ...routesRegexp.addons,
            component: routes.Addons
        },
        {
            ...routesRegexp.settings,
            component: routes.Settings
        },
        {
            ...routesRegexp.settingsShortcuts,
            component: routes.SettingsShortcuts
        }
    ],
    [
        {
            ...routesRegexp.player,
            component: routes.Player
        }
    ],
    [
        {
            ...routesRegexp.tos,
            component: routes.Tos
        },
        {
            ...routesRegexp.privacy,
            component: routes.PrivacyPolicy
        },
        {
            ...routesRegexp.profiles,
            component: routes.Profiles
        }
    ]
];

module.exports = routerViewsConfig;

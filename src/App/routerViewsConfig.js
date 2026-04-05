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
            ...routesRegexp.authPreview,
            component: routes.AuthPreview
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
        },
        {
            ...routesRegexp.subscribe,
            component: routes.Subscribe
        },
        {
            ...routesRegexp.admin,
            component: routes.Admin
        },
        {
            ...routesRegexp.pricingDemo,
            component: routes.PricingDemo
        }
    ]
];

module.exports = routerViewsConfig;

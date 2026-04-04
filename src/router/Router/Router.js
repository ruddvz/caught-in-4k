// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const ReactIs = require('react-is');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { deepEqual } = require('fast-equals');
const { addLocationChangeListener, getCurrentAppLocation, syncWindowLocation } = require('stremio/common/navigation');
const { RouteFocusedProvider } = require('../RouteFocusedContext');
const Route = require('../Route');
const routeConfigForPath = require('./routeConfigForPath');
const urlParamsForPath = require('./urlParamsForPath');

const Router = ({ className, onPathNotMatch, onRouteChange, ...props }) => {
    const viewsConfig = React.useMemo(() => props.viewsConfig, []);
    const [views, setViews] = React.useState(() => {
        return Array(viewsConfig.length).fill(null);
    });
    React.useLayoutEffect(() => {
        const onLocationChange = () => {
            const { pathname, queryString } = getCurrentAppLocation();
            const queryParams = new URLSearchParams(queryString);
            const routeConfig = routeConfigForPath(viewsConfig, pathname);
            if (routeConfig === null) {
                if (typeof onPathNotMatch === 'function') {
                    const component = onPathNotMatch();
                    if (ReactIs.isValidElementType(component)) {
                        setViews((views) => {
                            return views
                                .slice(0, viewsConfig.length)
                                .concat({
                                    key: '-1',
                                    component
                                });
                        });
                    }
                }

                return;
            }

            const urlParams = urlParamsForPath(routeConfig, pathname);
            const routeViewIndex = viewsConfig.findIndex((vc) => vc.includes(routeConfig));
            const routeIndex = viewsConfig[routeViewIndex].findIndex((rc) => rc === routeConfig);
            const handled = typeof onRouteChange === 'function' && onRouteChange(routeConfig, urlParams, queryParams);
            if (!handled) {
                setViews((views) => {
                    return views
                        .slice(0, viewsConfig.length)
                        .map((view, index) => {
                            if (index < routeViewIndex) {
                                return view;
                            } else if (index === routeViewIndex) {
                                return {
                                    key: `${routeViewIndex}${routeIndex}`,
                                    component: routeConfig.component,
                                    urlParams: view !== null && deepEqual(view.urlParams, urlParams) ?
                                        view.urlParams
                                        :
                                        urlParams,
                                    queryParams: view !== null && deepEqual(Array.from(view.queryParams.entries()), Array.from(queryParams.entries())) ?
                                        view.queryParams
                                        :
                                        queryParams
                                };
                            } else {
                                return null;
                            }
                        });
                });
            }
        };

        const removeLocationChangeListener = addLocationChangeListener(onLocationChange);
        if (!syncWindowLocation()) {
            onLocationChange();
        }

        return removeLocationChangeListener;
    }, [onPathNotMatch, onRouteChange]);
    return (
        <div className={classnames(className, 'routes-container')}>
            {
                views
                    .filter((view) => view !== null)
                    .map(({ key, component, urlParams, queryParams }, index, views) => (
                        <RouteFocusedProvider key={key} value={index === views.length - 1}>
                            <Route>
                                {React.createElement(component, { urlParams, queryParams })}
                            </Route>
                        </RouteFocusedProvider>
                    ))
            }
        </div>
    );
};

Router.propTypes = {
    className: PropTypes.string,
    onPathNotMatch: PropTypes.func,
    onRouteChange: PropTypes.func,
    viewsConfig: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.exact({
        regexp: PropTypes.instanceOf(RegExp).isRequired,
        urlParamsNames: PropTypes.arrayOf(PropTypes.string).isRequired,
        component: PropTypes.elementType.isRequired
    }))).isRequired
};

module.exports = Router;

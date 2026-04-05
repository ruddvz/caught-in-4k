// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const useTranslate = require('stremio/common/useTranslate');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { withCoreSuspender, getVisibleChildrenRange } = require('stremio/common');
const { Image, MainNavBars, MetaItem, MetaRow } = require('stremio/components');
const useSearch = require('./useSearch');
const { getSearchQuery, isSearchRouteSynced } = require('./searchQuery');
const styles = require('./styles');

const THRESHOLD = 100;

// Placeholder row that hides itself if loading hasn't resolved within 10 seconds
const SearchRowWithTimeout = ({ className, catalog, title }) => {
    const [timedOut, setTimedOut] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => setTimedOut(true), 10000);
        return () => clearTimeout(timer);
    }, []);
    if (timedOut) return null;
    return (
        <MetaRow.Placeholder
            className={className}
            catalog={catalog}
            title={title}
        />
    );
};

const Search = ({ queryParams }) => {
    const t = useTranslate();
    const [search, loadSearchRows] = useSearch(queryParams);
    const query = React.useMemo(() => getSearchQuery(queryParams), [queryParams]);
    const isSearchSynced = React.useMemo(() => isSearchRouteSynced(query, search.selected), [query, search.selected]);
    const scrollContainerRef = React.useRef();
    const onVisibleRangeChange = React.useCallback(() => {
        if (!isSearchSynced || search.catalogs.length === 0) {
            return;
        }

        const range = getVisibleChildrenRange(scrollContainerRef.current, THRESHOLD);
        if (range === null) {
            return;
        }

        loadSearchRows(range);
    }, [isSearchSynced, search.catalogs]);
    const onScroll = React.useCallback(debounce(onVisibleRangeChange, 250), [onVisibleRangeChange]);
    React.useLayoutEffect(() => {
        onVisibleRangeChange();
    }, [search.catalogs, onVisibleRangeChange]);
    let content = (
        <div className={classnames(styles['search-hints-wrapper'])}>
            <div className={classnames(styles['search-hints-title-container'], 'animation-fade-in')}>
                <div className={styles['search-hints-title']}>{t.string('SEARCH_ANYTHING')}</div>
            </div>
            <div className={classnames(styles['search-hints-container'], 'animation-fade-in')}>
                <div className={styles['search-hint-container']}>
                    <Icon className={styles['icon']} name={'trailer'} />
                    <div className={styles['label']}>{t.string('SEARCH_CATEGORIES')}</div>
                </div>
                <div className={styles['search-hint-container']}>
                    <Icon className={styles['icon']} name={'actors'} />
                    <div className={styles['label']}>{t.string('SEARCH_PERSONS')}</div>
                </div>
                <div className={styles['search-hint-container']}>
                    <Icon className={styles['icon']} name={'link'} />
                    <div className={styles['label']}>{t.string('SEARCH_PROTOCOLS')}</div>
                </div>
                <div className={styles['search-hint-container']}>
                    <Icon className={styles['icon']} name={'imdb-outline'} />
                    <div className={styles['label']}>{t.string('SEARCH_TYPES')}</div>
                </div>
            </div>
        </div>
    );

    if (query !== null) {
        if (!isSearchSynced) {
            content = null;
        } else if (search.catalogs.length === 0) {
            content = (
                <div className={styles['message-container']}>
                    <Image
                        className={styles['image']}
                        src={require('/assets/images/empty.png')}
                        alt={' '}
                    />
                    <div className={styles['message-label']}>{ t.string('STREMIO_TV_SEARCH_NO_ADDONS') }</div>
                </div>
            );
        } else {
            content = search.catalogs.map((catalog, index) => {
                switch (catalog.content?.type) {
                    case 'Ready': {
                        return (
                            <MetaRow
                                key={index}
                                className={classnames(styles['search-row'], styles['search-row-poster'], 'animation-fade-in')}
                                catalog={catalog}
                                itemComponent={MetaItem}
                                posterShape={'poster'}
                            />
                        );
                    }
                    case 'Err': {
                        if (catalog.content.content !== 'EmptyContent') {
                            return (
                                <MetaRow
                                    key={index}
                                    className={classnames(styles['search-row'], 'animation-fade-in')}
                                    catalog={catalog}
                                    message={'This source is currently unavailable.'}
                                />
                            );
                        }
                        return null;
                    }
                    default: {
                        return (
                            <SearchRowWithTimeout
                                key={index}
                                className={classnames(styles['search-row'], styles['search-row-poster'], 'animation-fade-in')}
                                catalog={catalog}
                                title={t.catalogTitle(catalog)}
                            />
                        );
                    }
                }
            });
        }
    }

    return (
        <MainNavBars className={styles['search-container']} route={'search'} query={query}>
            <div ref={scrollContainerRef} className={styles['search-content']} onScroll={onScroll}>{content}</div>
        </MainNavBars>
    );
};

Search.propTypes = {
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

const SearchFallback = ({ queryParams }) => (
    <MainNavBars
        className={styles['search-container']}
        route={'search'}
        query={getSearchQuery(queryParams)}
    />
);

SearchFallback.propTypes = Search.propTypes;

module.exports = withCoreSuspender(Search, SearchFallback);

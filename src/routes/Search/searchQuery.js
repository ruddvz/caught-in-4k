// Copyright (C) 2017-2023 Smart code 203358507

const getSearchQuery = (queryParams) => {
    const queryValue = queryParams.get('search') ?? queryParams.get('query');
    return typeof queryValue === 'string' && queryValue.length > 0 ? queryValue : null;
};

const getSelectedSearchQuery = (selected) => {
    return selected !== null ?
        selected.extra.reduceRight((currentQuery, [name, value]) => {
            if (currentQuery !== null) {
                return currentQuery;
            }

            if (name === 'search') {
                return value;
            }

            return currentQuery;
        }, null)
        :
        null;
};

const isSearchRouteSynced = (query, selected) => query === null || getSelectedSearchQuery(selected) === query;

module.exports = {
    getSearchQuery,
    getSelectedSearchQuery,
    isSearchRouteSynced,
};

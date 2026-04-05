// Copyright (C) 2017-2023 Smart code 203358507

const {
    getSearchQuery,
    getSelectedSearchQuery,
    isSearchRouteSynced,
} = require('../src/routes/Search/searchQuery');

describe('search query helpers', () => {
    it('prefers the search param when it exists', () => {
        const queryParams = new URLSearchParams('search=Peaky&query=Legacy');

        expect(getSearchQuery(queryParams)).toBe('Peaky');
    });

    it('falls back to the legacy query param', () => {
        const queryParams = new URLSearchParams('query=Legacy');

        expect(getSearchQuery(queryParams)).toBe('Legacy');
    });

    it('normalizes empty query params to null', () => {
        const searchParams = new URLSearchParams('search=');
        const legacyParams = new URLSearchParams('query=');

        expect(getSearchQuery(searchParams)).toBe(null);
        expect(getSearchQuery(legacyParams)).toBe(null);
    });

    it('extracts the last search value from the selected model state', () => {
        const selected = {
            extra: [
                ['genre', 'crime'],
                ['search', 'Old'],
                ['search', 'Peaky'],
            ],
        };

        expect(getSelectedSearchQuery(selected)).toBe('Peaky');
    });

    it('treats empty-route searches as synced even if the model is stale', () => {
        const staleSelected = {
            extra: [
                ['search', 'Peaky'],
            ],
        };

        expect(isSearchRouteSynced(null, staleSelected)).toBe(true);
    });

    it('requires populated searches to match the selected model state', () => {
        const matchingSelected = {
            extra: [
                ['search', 'Peaky'],
            ],
        };
        const staleSelected = {
            extra: [
                ['search', 'Old'],
            ],
        };

        expect(isSearchRouteSynced('Peaky', matchingSelected)).toBe(true);
        expect(isSearchRouteSynced('Peaky', staleSelected)).toBe(false);
    });
});
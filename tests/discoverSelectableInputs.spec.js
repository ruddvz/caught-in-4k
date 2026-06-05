// Copyright (C) 2017-2023 Smart code 203358507

const mapSelectableInputs = require('../src/routes/Discover/mapSelectableInputs');

describe('mapSelectableInputs', () => {
    const t = {
        string: (k) => k,
        stringWithPrefix: (v, prefix) => `${prefix || ''}${v}`,
        catalogTitle: () => 'catalog',
    };

    it('returns empty selects when selectable is missing', () => {
        expect(mapSelectableInputs({ selectable: null }, t)).toEqual([[], false]);
    });

    it('handles extra filter with no selected option', () => {
        const discover = {
            selected: { request: { path: { type: 'movie', id: 'x' } } },
            selectable: {
                types: [{ type: 'movie', selected: true, deepLinks: { discover: '/discover/movie' } }],
                catalogs: [{ id: 'c1', name: 'Catalog', selected: true, addon: { manifest: { name: 'Addon' } }, deepLinks: { discover: '/discover/movie/c1' } }],
                extra: [{
                    name: 'genre',
                    isRequired: false,
                    options: [
                        { value: 'action', selected: false, deepLinks: { discover: '/discover/movie/c1?genre=action' } },
                    ],
                }],
                nextPage: false,
            },
        };

        const [selects] = mapSelectableInputs(discover, t);
        expect(selects).toHaveLength(3);
        expect(selects[2].value).toBeUndefined();
        expect(typeof selects[2].title).toBe('function');
    });
});

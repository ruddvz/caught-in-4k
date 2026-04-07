const { describe, expect, it } = require('@jest/globals');

const {
    getMultiselectTriggerA11yProps,
    getDropdownMenuA11yProps,
    getDropdownOptionA11yProps,
} = require('../src/components/MultiselectMenu/a11y');

describe('multiselect menu accessibility helpers', () => {
    it('keeps the trigger aligned with popup menu semantics', () => {
        expect(getMultiselectTriggerA11yProps(true)).toEqual({
            'aria-haspopup': 'menu',
            'aria-expanded': true,
        });

        expect(getMultiselectTriggerA11yProps(false)).toEqual({
            'aria-haspopup': 'menu',
            'aria-expanded': false,
        });
    });

    it('exposes a popup menu container with a readable label', () => {
        expect(getDropdownMenuA11yProps('Options')).toEqual({
            role: 'menu',
            'aria-label': 'Options',
        });
    });

    it('marks each option as a menuitemradio with a string aria-checked state', () => {
        expect(getDropdownOptionA11yProps({ label: 'Always', selected: true })).toEqual({
            role: 'menuitemradio',
            'aria-label': 'Always',
            'aria-checked': 'true',
        });

        expect(getDropdownOptionA11yProps({ label: 'Never', selected: false })).toEqual({
            role: 'menuitemradio',
            'aria-label': 'Never',
            'aria-checked': 'false',
        });
    });
});
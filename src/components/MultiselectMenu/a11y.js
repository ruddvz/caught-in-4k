function getMultiselectTriggerA11yProps(menuOpen) {
    return {
        'aria-haspopup': 'menu',
        'aria-expanded': menuOpen,
    };
}

function getDropdownMenuA11yProps(label) {
    return {
        role: 'menu',
        'aria-label': label,
    };
}

function getDropdownOptionA11yProps({ label, selected }) {
    return {
        role: 'menuitemradio',
        'aria-label': String(label),
        'aria-checked': selected ? 'true' : 'false',
    };
}

module.exports = {
    getMultiselectTriggerA11yProps,
    getDropdownMenuA11yProps,
    getDropdownOptionA11yProps,
};

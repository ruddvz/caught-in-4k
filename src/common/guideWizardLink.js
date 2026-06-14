// Copyright (C) 2026 Caught in 4K
//
// Cross-links between the Guide hub (/guide) and the interactive Wizard
// (/wizard). The app uses a hash router, so instead of fragile in-route
// anchors we stash the intended target in sessionStorage and let the
// destination route consume it on mount. Each value is read exactly once.

const GUIDE_FOCUS_KEY = 'c4k_guide_focus_section';
const WIZARD_STEP_KEY = 'c4k_wizard_goto_step';

const getSession = () => (typeof sessionStorage !== 'undefined' ? sessionStorage : null);

const setItem = (key, value) => {
    const store = getSession();
    if (!store || !value) return;
    try {
        store.setItem(key, value);
    } catch (_e) {
        // ignore storage failures (private mode, quota, etc.)
    }
};

const consumeItem = (key) => {
    const store = getSession();
    if (!store) return null;
    try {
        const value = store.getItem(key);
        if (value) store.removeItem(key);
        return value;
    } catch (_e) {
        return null;
    }
};

module.exports = {
    // Guide section to expand + scroll to after navigating to /guide.
    requestGuideSection: (sectionId) => setItem(GUIDE_FOCUS_KEY, sectionId),
    consumeGuideSection: () => consumeItem(GUIDE_FOCUS_KEY),
    // Wizard step to jump to after navigating to /wizard.
    requestWizardStep: (stepId) => setItem(WIZARD_STEP_KEY, stepId),
    consumeWizardStep: () => consumeItem(WIZARD_STEP_KEY),
};

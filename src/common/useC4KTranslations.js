/**
 * Caught in 4K Translation Hook
 * NOTE: C4K overrides are now merged into i18n resources at init time (see index.js).
 * This hook is kept for backward compatibility but simply re-exports useTranslation.
 */

const { useTranslation } = require('react-i18next');

const useC4KTranslations = (ns, options) => {
    return useTranslation(ns, options);
};

module.exports = useC4KTranslations;

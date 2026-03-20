/**
 * Caught in 4K Translation Hook
 * Wraps react-i18next useTranslation and applies custom Gen Z copy overrides
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useMemo } from 'react';
import caughtIn4KTranslations from './caught-in-4k-translations';

export const useC4KTranslations = (ns, options) => {
  const { t: i18nT, i18n, ...rest } = useI18nTranslation(ns, options);

  // Memoize the override function to avoid re-renders
  const t = useMemo(() => {
    return (key, defaultValue = '', opts = {}) => {
      // Check if this key has a C4K override
      const override = caughtIn4KTranslations[key];
      
      if (override) {
        // If it's a function (like SEARCH_NO_RESULTS), call it with interpolation
        if (typeof override === 'function') {
          return override(opts.defaultValue || opts.replace?.query || '');
        }
        // Otherwise, return the override string directly
        return override;
      }

      // Fall back to standard i18n behavior
      return i18nT(key, defaultValue, opts);
    };
  }, [i18nT]);

  return { t, i18n, ...rest };
};

export default useC4KTranslations;

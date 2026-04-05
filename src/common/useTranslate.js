const { useCallback, useMemo } = require('react');
const { useTranslation } = require('react-i18next');

const useTranslate = () => {
    const translation = useTranslation();

    const t = useMemo(() => {
        if (typeof translation === 'function') {
            return translation;
        }
        if (translation && typeof translation.t === 'function') {
            return translation.t;
        }
        if (Array.isArray(translation) && typeof translation[0] === 'function') {
            return translation[0];
        }
        return (key) => {
            console.warn('Translation function "t" not found, falling back to key:', key);
            return key;
        };
    }, [translation]);

    const string = useCallback((key) => {
        try {
            return t(key);
        } catch (e) {
            console.warn('t(key) failed:', e);
            return key;
        }
    }, [t]);

    const stringWithPrefix = useCallback((value, prefix, fallback = null) => {
        const key = `${prefix}${value}`;
        const defaultValue = fallback ?? value.charAt(0).toUpperCase() + value.slice(1);
        try {
            return t(key, { defaultValue });
        } catch (_error) {
            return defaultValue;
        }
    }, [t]);

    const catalogTitle = useCallback(({ addon, id, name, type } = {}, withType = true) => {
        if (addon && id && name) {
            const partialKey = `${addon.manifest.id.split('.').join('_')}_${id}`;
            const translatedName = stringWithPrefix(partialKey, 'CATALOG_', name);
            if (type && withType) {
                const translatedType = stringWithPrefix(type, 'TYPE_');
                return `${translatedName} - ${translatedType}`;
            }
            return translatedName;
        }
        return name || id || null;
    }, [stringWithPrefix]);

    return useMemo(() => ({
        string,
        stringWithPrefix,
        catalogTitle,
    }), [string, stringWithPrefix, catalogTitle]);
};

module.exports = useTranslate;

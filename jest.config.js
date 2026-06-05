const includeI18nScan = process.env.JEST_INCLUDE_I18N === '1';

module.exports = {
    roots: ['<rootDir>/tests'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleNameMapper: {
        '^stremio/(.*)$': '<rootDir>/src/$1',
    },
    modulePathIgnorePatterns: [
        '<rootDir>/build/',
        '<rootDir>/everything-claude-code/',
        '<rootDir>/\\.claude/',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/build/',
        '<rootDir>/everything-claude-code/',
        '<rootDir>/\\.claude/',
        ...(includeI18nScan ? [] : ['<rootDir>/tests/i18nScan.test.js']),
    ],
};
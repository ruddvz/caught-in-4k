module.exports = {
    roots: ['<rootDir>/tests'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    modulePathIgnorePatterns: [
        '<rootDir>/build/',
        '<rootDir>/everything-claude-code/',
        '<rootDir>/\\.claude/',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/build/',
        '<rootDir>/everything-claude-code/',
        '<rootDir>/\\.claude/',
    ],
};
const CODE_PATTERN = /^\d{4}$/;

function normalizeSecurityCode(code) {
    return typeof code === 'string' ? code.trim() : '';
}

function validateSecurityCode(code) {
    const normalizedCode = normalizeSecurityCode(code);

    if (!CODE_PATTERN.test(normalizedCode)) {
        return { valid: false, error: 'Codes must be exactly 4 digits.' };
    }

    return { valid: true };
}

function hashSecurityCode(code) {
    const normalizedCode = normalizeSecurityCode(code);
    return normalizedCode.split('').reduce((accumulator, character) => (
        ((accumulator << 5) - accumulator + character.charCodeAt(0)) | 0
    ), 0).toString(36);
}

function matchesSecurityCode(code, storedHash) {
    if (typeof storedHash !== 'string' || storedHash.length === 0) {
        return false;
    }

    return hashSecurityCode(code) === storedHash;
}

function verifySecurityAction({ mode, code, profileHash = null, masterHash = null }) {
    const validation = validateSecurityCode(code);
    if (!validation.valid) {
        return false;
    }

    if (mode === 'unlock') {
        return matchesSecurityCode(code, profileHash);
    }

    if (mode === 'delete' || mode === 'delete-account' || mode === 'master-verify') {
        return matchesSecurityCode(code, masterHash);
    }

    if (mode === 'remove') {
        return matchesSecurityCode(code, profileHash) || matchesSecurityCode(code, masterHash);
    }

    return false;
}

module.exports = {
    hashSecurityCode,
    matchesSecurityCode,
    normalizeSecurityCode,
    validateSecurityCode,
    verifySecurityAction,
};

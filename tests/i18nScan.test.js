// Copyright (C) 2017-2023 Smart code 203358507

const fs = require('fs');
const path = require('path');
const recast = require('recast');
const babelParser = require('@babel/parser');

const directoryToScan = './src';

const IGNORE_PATH_FRAGMENTS = [
    '/caught-in-4k-translations',
    '/AuthPreview/',
    '/ShadersHeroPreview/',
    '/PricingDemo',
    '/Admin/',
    '/Subscribe/',
    '/Profiles/',
    '/Tos/',
    '/PrivacyPolicy/',
    '/Intro/',
    '/CanonTakeBox/',
    '/SatisfactionMeterDial/',
    '/components/ui/auth-form',
];

const IGNORE_STRINGS = new Set([
    'C4K',
    'Caught in 4K',
]);

function toKey(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 40);
}

function shouldIgnoreFile(filePath) {
    return IGNORE_PATH_FRAGMENTS.some((fragment) => filePath.includes(fragment));
}

function shouldIgnoreString(text) {
    if (IGNORE_STRINGS.has(text)) {
        return true;
    }
    if (!/[a-zA-Z]{2,}/.test(text)) {
        return true;
    }
    return false;
}

function scanFile(filePath, report) {
    if (shouldIgnoreFile(filePath)) {
        return;
    }

    try {
        const code = fs.readFileSync(filePath, 'utf8');
        const ast = babelParser.parse(code, {
            sourceType: 'module',
            plugins: [
                'jsx',
                'typescript',
                'classProperties',
                'objectRestSpread',
                'optionalChaining',
                'nullishCoalescingOperator',
            ],
            errorRecovery: true,
        });

        recast.types.visit(ast, {
            visitJSXText(path) {
                const text = path.node.value.trim();
                if (text.length > 1 && /\w/.test(text) && !shouldIgnoreString(text)) {
                    const loc = path.node.loc?.start || { line: 0 };
                    report.push({
                        file: filePath,
                        line: loc.line,
                        string: text,
                        key: toKey(text),
                    });
                }
                this.traverse(path);
            },

            visitJSXExpressionContainer(path) {
                const expr = path.node.expression;

                if (
                    expr.type === 'CallExpression' &&
                    expr.callee.type === 'Identifier' &&
                    expr.callee.name === 't'
                ) {
                    return false;
                }

                if (expr.type === 'StringLiteral') {
                    const parent = path.parentPath.node;
                    if (parent.type === 'JSXElement' && !shouldIgnoreString(expr.value)) {
                        const loc = path.node.loc?.start || { line: 0 };
                        report.push({
                            file: filePath,
                            line: loc.line,
                            string: expr.value,
                            key: toKey(expr.value),
                        });
                    }
                }

                this.traverse(path);
            },
        });
    } catch (err) {
        console.warn(`Skipping ${filePath}: ${err.message}`);
    }
}

function walk(dir, report) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, report);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            scanFile(fullPath, report);
        }
    });
}

const report = [];
walk(directoryToScan, report);

const baselinePath = path.join(__dirname, 'i18n-baseline.json');
let baseline = [];
if (fs.existsSync(baselinePath)) {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
}

const baselineKeys = new Set(baseline.map((e) => `${e.file}:${e.line}:${e.string}`));
const newViolations = report.filter((e) => !baselineKeys.has(`${e.file}:${e.line}:${e.string}`));

if (newViolations.length !== 0) {
    describe.each(newViolations)('Missing translation key', (entry) => {
        it(`should not have "${entry.string}" in ${entry.file} at line ${entry.line}`, () => {
            expect(entry.string).toBeFalsy();
        });
    });
} else {
    describe('Missing translation key', () => {
        it('No new hardcoded strings beyond baseline', () => {
            expect(true).toBe(true);
        });
    });
}

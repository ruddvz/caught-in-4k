const fs = require('fs');
const path = require('path');
const recast = require('recast');
const babelParser = require('@babel/parser');

const directoryToScan = './src';
const ignoredFiles = new Set([
    'src/components/CanonTakeBox/CanonTakeBox.js',
    'src/components/MetaItem/MetaItem.js',
    'src/components/NavBar/HorizontalNavBar/NavMenu/NavMenuContent.js',
    'src/components/SatisfactionMeterDial/SatisfactionMeterDial.js',
    'src/components/SatisfactionMeterLegend/SatisfactionMeterLegend.js',
    'src/routes/Tos/Tos.js',
    'src/routes/PrivacyPolicy/PrivacyPolicy.js',
    'src/routes/Intro/Intro.js',
    'src/routes/Profiles/PinModal/PinModal.js',
    'src/routes/Profiles/Profiles.js',
    'src/routes/Admin/Admin.js',
    'src/routes/Subscribe/Subscribe.js',
    'src/routes/Settings/General/General.tsx',
    'src/routes/Settings/Interface/Interface.tsx',
    'src/routes/Settings/Player/Player.tsx',
    'src/routes/Settings/ProfileManagement/ProfileManagement.tsx',
    'src/routes/Settings/Settings.tsx',
    'src/routes/SettingsShortcuts/SettingsShortcuts.tsx',
    'src/components/ui/auth-form-1.tsx',
    'src/components/ui/demo.tsx',
]);

function toKey(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 40);
}

function scanFile(filePath, report) {
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
                if (text.length > 1 && /\w/.test(text)) {
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
                    if (parent.type === 'JSXElement') {
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
            }
        });

    } catch (err) {
        console.warn(`❌ Skipping ${filePath}: ${err.message}`);
    }
}

function shouldIgnore(filePath) {
    return ignoredFiles.has(filePath.replace(/\\/g, '/'));
}

function walk(dir, report) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (shouldIgnore(fullPath)) {
            return;
        }
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, report);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            // console.log('📄 Scanning file:', fullPath);
            scanFile(fullPath, report);
        }
    });
}
const report = [];

walk(directoryToScan, report);

if (report.length !== 0) {
    describe.each(report)('Missing translation key', (entry) => {
        it(`should not have "${entry.string}" in ${entry.file} at line ${entry.line}`, () => {
            expect(entry.string).toBeFalsy();
        });
    });
} else {
    describe('Missing translation key', () => {
        it('No hardcoded strings found', () => {
            expect(true).toBe(true); // or just skip
        });
    });
}

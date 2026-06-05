// Copyright (C) 2017-2023 Smart code 203358507

const fs = require('fs');

describe('route exports index', () => {
    const indexSource = fs.readFileSync('src/routes/index.js', 'utf8');

    it('exports Calendar', () => {
        expect(indexSource).toMatch(/Calendar/);
        expect(indexSource).toMatch(/Calendar,/);
    });
});

// Copyright (C) 2017-2023 Smart code 203358507

const fs = require('fs');
const path = require('path');

describe('Supabase RLS migration', () => {
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260605000000_rls_profiles_subscriptions.sql');

    it('exists and enables RLS on profiles and subscriptions', () => {
        expect(fs.existsSync(migrationPath)).toBe(true);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        expect(sql).toMatch(/enable row level security/i);
        expect(sql).toMatch(/profiles_select_own/);
        expect(sql).toMatch(/auth\.uid\(\)/);
    });
});

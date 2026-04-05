/**
 * Supabase Client — singleton for C4K subscription system.
 * Reads env vars at build time. Returns null if not configured,
 * so the app degrades gracefully without Supabase.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    });
}

/** @returns {boolean} true when Supabase env vars are configured */
const isSupabaseConfigured = () => Boolean(supabase);

module.exports = { supabase, isSupabaseConfigured };

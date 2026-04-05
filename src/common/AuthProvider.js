/**
 * C4K Auth Context — provides Supabase user session, profile, subscription
 * status, and admin flag to the entire app.
 *
 * Gracefully returns null/defaults when Supabase is not configured.
 */

const React = require('react');
const { supabase, isSupabaseConfigured } = require('./supabaseClient');
const { getSubscriptionAccessState } = require('./subscriptionAccess');

const ACCESS_STATE_REFRESH_INTERVAL_MS = 60 * 1000;

const AuthContext = React.createContext({
    session: null,
    user: null,
    profile: null,
    subscription: null,
    isAdmin: false,
    isApproved: false,
    isEntitled: false,
    isSuspended: false,
    isSubscribed: false,
    hasActiveSubscription: false,
    daysRemaining: 0,
    loading: true,
    signUp: async () => {},
    signIn: async () => {},
    signOut: async () => {},
    refreshProfile: async () => {},
});

const fetchProfile = async (userId) => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.warn('[C4K Auth] Failed to fetch profile:', error.message);
        return null;
    }
    return data;
};

const fetchSubscription = async (userId) => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.warn('[C4K Auth] Failed to fetch subscription:', error.message);
    }
    return data || null;
};

const AuthProvider = ({ children }) => {
    const [session, setSession] = React.useState(null);
    const [profile, setProfile] = React.useState(null);
    const [subscription, setSubscription] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [accessStateNow, setAccessStateNow] = React.useState(() => Date.now());
    const activeLoadIdRef = React.useRef(0);
    const mountedRef = React.useRef(true);

    const loadUserData = React.useCallback(async (userId) => {
        const loadId = activeLoadIdRef.current + 1;
        activeLoadIdRef.current = loadId;
        setLoading(true);

        const [prof, sub] = await Promise.all([
            fetchProfile(userId),
            fetchSubscription(userId),
        ]);

        if (!mountedRef.current || activeLoadIdRef.current !== loadId) {
            return;
        }

        setProfile(prof);
        setSubscription(sub);
        setLoading(false);
    }, []);

    React.useEffect(() => {
        mountedRef.current = true;

        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!mountedRef.current) {
                return;
            }

            setSession(s);
            if (s?.user) {
                loadUserData(s.user.id);
            } else {
                activeLoadIdRef.current += 1;
                setProfile(null);
                setSubscription(null);
                setLoading(false);
            }
        });

        // Listen for auth state changes
        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
            async (_event, s) => {
                setSession(s);
                if (s?.user) {
                    await loadUserData(s.user.id);
                } else {
                    activeLoadIdRef.current += 1;
                    setProfile(null);
                    setSubscription(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            mountedRef.current = false;
            activeLoadIdRef.current += 1;
            authSub?.unsubscribe();
        };
    }, [loadUserData]);

    const signUp = React.useCallback(async (email, password, displayName) => {
        if (!supabase) return { error: { message: 'Auth not configured' } };
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName || email.split('@')[0] },
            },
        });
        return { data, error };
    }, []);

    const signIn = React.useCallback(async (email, password) => {
        if (!supabase) return { error: { message: 'Auth not configured' } };
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    }, []);

    const signOut = React.useCallback(async () => {
        if (!supabase) return;
        activeLoadIdRef.current += 1;
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        setSubscription(null);
        setLoading(false);
    }, []);

    const refreshProfile = React.useCallback(async () => {
        if (session?.user) {
            await loadUserData(session.user.id);
        }
    }, [session, loadUserData]);

    React.useEffect(() => {
        if (!profile && !subscription) {
            return undefined;
        }

        const intervalId = setInterval(() => {
            setAccessStateNow(Date.now());
        }, ACCESS_STATE_REFRESH_INTERVAL_MS);

        return () => {
            clearInterval(intervalId);
        };
    }, [profile, subscription]);

    const accessState = React.useMemo(
        () => getSubscriptionAccessState({ now: accessStateNow, profile, subscription }),
        [accessStateNow, profile, subscription]
    );

    const value = React.useMemo(() => ({
        session,
        user: session?.user || null,
        profile,
        subscription,
        isAdmin: accessState.isAdmin,
        isApproved: accessState.isApproved,
        isEntitled: accessState.isEntitled,
        isSuspended: accessState.isSuspended,
        isSubscribed: accessState.isSubscribed,
        hasActiveSubscription: accessState.hasActiveSubscription,
        daysRemaining: accessState.daysRemaining,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
    }), [session, profile, subscription, accessState, loading, signUp, signIn, signOut, refreshProfile]);

    return React.createElement(AuthContext.Provider, { value }, children);
};

const useAuth = () => React.useContext(AuthContext);

module.exports = { AuthProvider, useAuth, AuthContext };

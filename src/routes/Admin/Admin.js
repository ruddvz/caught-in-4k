// Copyright (C) 2024 Caught In 4K

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { navigateToAppHref } = require('stremio/common/navigation');
const { useAuth } = require('stremio/common/AuthProvider');
const { sanitizeManagedAddonUrl, validateManagedAddonUrl } = require('stremio/common/managedAddonSecurity');
const { supabase, isSupabaseConfigured } = require('stremio/common/supabaseClient');
const { resolveApiBaseUrl } = require('stremio/common/apiBaseUrl');
const { trimTrailingSlash } = require('stremio/common/subscriptionCheckout');
const { getServerTier } = require('stremio/common/guideAccess');
const styles = require('./styles.less');

const TABS = ['Users', 'Access', 'Subscriptions', 'Setup'];
const getDisplaySubscriptionStatus = (subscription) => {
    if (
        subscription.status === 'active' &&
        subscription.expires_at &&
        new Date(subscription.expires_at).getTime() < Date.now()
    ) {
        return 'expired';
    }

    return subscription.status;
};

const callAdminRpc = async (name, args = {}) => {
    const { data, error } = await supabase.rpc(name, args);
    if (error) {
        throw error;
    }

    return data;
};

const Admin = () => {
    const auth = useAuth();
    const [activeTab, setActiveTab] = React.useState('Users');
    const [users, setUsers] = React.useState([]);
    const [accessRows, setAccessRows] = React.useState([]);
    const [subscriptions, setSubscriptions] = React.useState([]);
    const [setupRequests, setSetupRequests] = React.useState([]);
    const [revealedRequestId, setRevealedRequestId] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [actionLoading, setActionLoading] = React.useState(null);
    const [accessLoading, setAccessLoading] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState('');
    const [addonName, setAddonName] = React.useState('');
    const [addonTransportUrl, setAddonTransportUrl] = React.useState('');
    const [feedback, setFeedback] = React.useState(null);

    const isAdmin = auth && auth.isAdmin;
    const configurationReady = isSupabaseConfigured() && Boolean(supabase);

    const loadAdminData = React.useCallback(async () => {
        if (!configurationReady || !isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [usersRes, accessRes, subscriptionsRes, setupRes] = await Promise.all([
                callAdminRpc('admin_list_users'),
                callAdminRpc('admin_list_user_addons'),
                callAdminRpc('admin_list_subscriptions'),
                // RLS lets admins read setup_requests directly.
                supabase.from('setup_requests').select('*').order('created_at', { ascending: false }),
            ]);

            // Direct table reads return { data, error } instead of throwing, so
            // surface RLS/permission/network failures rather than rendering an
            // empty list that looks like "no requests".
            if (setupRes && setupRes.error) {
                throw setupRes.error;
            }

            const nextUsers = usersRes || [];
            setUsers(nextUsers);
            setAccessRows(accessRes || []);
            setSubscriptions(subscriptionsRes || []);
            setSetupRequests((setupRes && setupRes.data) || []);

            if (!selectedUserId) {
                const firstManagedUser = nextUsers.find((user) => !user.is_admin);
                if (firstManagedUser) {
                    setSelectedUserId(firstManagedUser.id);
                }
            }
        } catch (error) {
            console.error('[Admin] Fetch error:', error);
            setFeedback({ tone: 'error', message: error.message || 'Failed to load admin data.' });
        } finally {
            setLoading(false);
        }
    }, [configurationReady, isAdmin, selectedUserId]);

    const manageableUsers = React.useMemo(() => {
        return users.filter((user) => !user.is_admin);
    }, [users]);

    const selectedUserAddons = React.useMemo(() => {
        return accessRows.filter((row) => row.user_id === selectedUserId);
    }, [accessRows, selectedUserId]);

    const activeSubscriptionCount = React.useMemo(() => {
        return subscriptions.filter((subscription) => getDisplaySubscriptionStatus(subscription) === 'active').length;
    }, [subscriptions]);

    // Redirect non-admins
    React.useEffect(() => {
        if (configurationReady && auth && !auth.loading && !isAdmin) {
            navigateToAppHref('/');
        }
    }, [auth, configurationReady, isAdmin]);

    React.useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    const handleUserAction = React.useCallback(async (userId, newStatus) => {
        if (!supabase) return;
        setActionLoading(userId);
        setFeedback(null);
        try {
            const [updatedUser] = await callAdminRpc('admin_update_user_status', {
                next_status: newStatus,
                target_user_id: userId,
            });

            setUsers((prev) => prev.map((u) =>
                u.id === userId ? { ...u, status: updatedUser?.status || newStatus } : u
            ));
            setFeedback({ tone: 'success', message: `User status updated to ${newStatus}.` });
        } catch (err) {
            console.error('[Admin] Action error:', err);
            setFeedback({ tone: 'error', message: err.message || 'Failed to update user status.' });
        } finally {
            setActionLoading(null);
        }
    }, []);

    const handleAccessAdd = React.useCallback(async (event) => {
        event.preventDefault();
        if (!supabase || !selectedUserId) {
            setFeedback({ tone: 'error', message: 'Choose a user before saving access.' });
            return;
        }

        if (!addonName.trim() || !addonTransportUrl.trim()) {
            setFeedback({ tone: 'error', message: 'Source name and transport URL are required.' });
            return;
        }

        const addonUrlError = validateManagedAddonUrl(addonTransportUrl);
        if (addonUrlError) {
            setFeedback({ tone: 'error', message: addonUrlError });
            return;
        }

        setAccessLoading(true);
        setFeedback(null);
        try {
            await callAdminRpc('admin_upsert_user_addon', {
                target_addon_name: addonName.trim(),
                target_addon_transport_url: sanitizeManagedAddonUrl(addonTransportUrl),
                target_user_id: selectedUserId,
            });

            setAddonName('');
            setAddonTransportUrl('');
            setFeedback({ tone: 'success', message: 'Curated access saved.' });
            await loadAdminData();
        } catch (error) {
            console.error('[Admin] Failed to save access:', error);
            setFeedback({ tone: 'error', message: error.message || 'Failed to save curated access.' });
        } finally {
            setAccessLoading(false);
        }
    }, [addonName, addonTransportUrl, loadAdminData, selectedUserId]);

    const handleAccessDelete = React.useCallback(async (rowId) => {
        if (!supabase) return;

        setAccessLoading(true);
        setFeedback(null);
        try {
            await callAdminRpc('admin_remove_user_addon', { target_addon_id: rowId });

            setAccessRows((previousRows) => previousRows.filter((row) => row.id !== rowId));
            setFeedback({ tone: 'success', message: 'Curated access removed.' });
        } catch (error) {
            console.error('[Admin] Failed to delete access:', error);
            setFeedback({ tone: 'error', message: error.message || 'Failed to remove curated access.' });
        } finally {
            setAccessLoading(false);
        }
    }, []);

    const handleFulfillRequest = React.useCallback(async (requestId) => {
        setActionLoading(requestId);
        setFeedback(null);
        try {
            const apiBaseUrl = resolveApiBaseUrl();
            const accessToken = (auth && auth.session && auth.session.access_token) || '';
            if (!apiBaseUrl || !accessToken) {
                throw new Error('Backend is not connected on this build.');
            }
            const response = await fetch(`${trimTrailingSlash(apiBaseUrl)}/api/setup/fulfill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ id: requestId }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fulfill request.');
            }
            setFeedback({ tone: 'success', message: 'Marked fulfilled — password cleared, term recorded.' });
            await loadAdminData();
        } catch (error) {
            console.error('[Admin] Fulfill error:', error);
            setFeedback({ tone: 'error', message: error.message || 'Failed to fulfill request.' });
        } finally {
            setActionLoading(null);
        }
    }, [auth, loadAdminData]);

    const handleDeleteRequest = React.useCallback(async (requestId) => {
        if (!supabase) return;
        setActionLoading(requestId);
        setFeedback(null);
        try {
            const { error } = await supabase.from('setup_requests').delete().eq('id', requestId);
            if (error) {
                throw error;
            }
            setSetupRequests((previous) => previous.filter((request) => request.id !== requestId));
            setFeedback({ tone: 'success', message: 'Request deleted.' });
        } catch (error) {
            console.error('[Admin] Delete request error:', error);
            setFeedback({ tone: 'error', message: error.message || 'Failed to delete request.' });
        } finally {
            setActionLoading(null);
        }
    }, []);

    if (!configurationReady) {
        return (
            <div className={styles['admin-page']}>
                <div className={styles['ambient-orb-a']} />
                <div className={styles['ambient-orb-b']} />
                <div className={styles['admin-header']}>
                    <Button className={styles['back-btn']} onClick={() => navigateToAppHref('/')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </Button>
                    <div>
                        <h1 className={styles['admin-title']}>C4K Admin</h1>
                        <p className={styles['admin-copy']}>Preview mode stays visible even before the data layer is attached.</p>
                    </div>
                </div>
                <div className={styles['empty-surface']}>
                    <h2 className={styles['surface-title']}>Admin preview mode</h2>
                    <p className={styles['surface-copy']}>
                        Connect Supabase on this build to turn the dashboard live. Until then, this route stays available for layout review only.
                    </p>
                </div>
            </div>
        );
    }

    if (!auth || auth.loading) {
        return <div className={styles['admin-page']}><p className={styles['loading']}>Loading...</p></div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={styles['admin-page']}>
            <div className={styles['ambient-orb-a']} />
            <div className={styles['ambient-orb-b']} />
            <div className={styles['admin-header']}>
                <Button className={styles['back-btn']} onClick={() => navigateToAppHref('/')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </Button>
                <div>
                    <h1 className={styles['admin-title']}>C4K Admin</h1>
                    <p className={styles['admin-copy']}>Approve accounts, keep billing visible, and store curated access in one place.</p>
                </div>
            </div>

            <div className={styles['metrics-grid']}>
                <div className={styles['metric-card']}>
                    <span className={styles['metric-label']}>Users</span>
                    <strong className={styles['metric-value']}>{users.length}</strong>
                </div>
                <div className={styles['metric-card']}>
                    <span className={styles['metric-label']}>Pending approval</span>
                    <strong className={styles['metric-value']}>{users.filter((user) => user.status === 'pending').length}</strong>
                </div>
                <div className={styles['metric-card']}>
                    <span className={styles['metric-label']}>Active terms</span>
                    <strong className={styles['metric-value']}>{activeSubscriptionCount}</strong>
                </div>
                <div className={styles['metric-card']}>
                    <span className={styles['metric-label']}>Curated sources</span>
                    <strong className={styles['metric-value']}>{accessRows.length}</strong>
                </div>
            </div>

            <div className={styles['tabs-bar']}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={classnames(styles['tab'], { [styles['active']]: activeTab === tab })}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className={styles['tab-content']}>
                {feedback ? (
                    <div className={classnames(styles['status-banner'], {
                        [styles['status-success']]: feedback.tone === 'success',
                        [styles['status-error']]: feedback.tone === 'error',
                    })}>
                        {feedback.message}
                    </div>
                ) : null}
                {!configurationReady ? (
                    <div className={styles['empty-surface']}>
                        <h2 className={styles['surface-title']}>Admin preview mode</h2>
                        <p className={styles['surface-copy']}>
                            Supabase is not configured on this build yet, so the dashboard cannot read or write live data.
                        </p>
                    </div>
                ) : loading ? (
                    <p className={styles['loading']}>Loading data...</p>
                ) : activeTab === 'Access' ? (
                    <div className={styles['access-layout']}>
                        <form className={styles['editor-surface']} onSubmit={handleAccessAdd}>
                            <div className={styles['surface-header']}>
                                <h2 className={styles['surface-title']}>Curated Access</h2>
                                <p className={styles['surface-copy']}>Assign transport URLs to approved accounts without reopening the public page.</p>
                            </div>

                            <label className={styles['field']}>
                                <span className={styles['field-label']}>User</span>
                                <select
                                    className={styles['select-input']}
                                    value={selectedUserId}
                                    onChange={(event) => setSelectedUserId(event.target.value)}
                                >
                                    <option value="">Choose a user</option>
                                    {manageableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>{user.display_name || user.email}</option>
                                    ))}
                                </select>
                            </label>

                            <label className={styles['field']}>
                                <span className={styles['field-label']}>Source name</span>
                                <input
                                    className={styles['text-input']}
                                    type="text"
                                    value={addonName}
                                    onChange={(event) => setAddonName(event.target.value)}
                                    placeholder="VIP Movies"
                                />
                            </label>

                            <label className={styles['field']}>
                                <span className={styles['field-label']}>Transport URL</span>
                                <input
                                    className={styles['text-input']}
                                    type="url"
                                    value={addonTransportUrl}
                                    onChange={(event) => setAddonTransportUrl(event.target.value)}
                                    placeholder="https://example.com/manifest.json"
                                />
                            </label>

                            <button className={styles['primary-btn']} type="submit" disabled={accessLoading}>
                                {accessLoading ? 'Saving...' : 'Save Access'}
                            </button>
                        </form>

                        <div className={styles['list-surface']}>
                            <div className={styles['surface-header']}>
                                <h2 className={styles['surface-title']}>Assigned Sources</h2>
                                <p className={styles['surface-copy']}>Review what the selected account can receive after approval and billing.</p>
                            </div>

                            {selectedUserId && selectedUserAddons.length > 0 ? (
                                <div className={styles['access-list']}>
                                    {selectedUserAddons.map((row) => (
                                        <article key={row.id} className={styles['access-card']}>
                                            <div>
                                                <strong className={styles['access-title']}>{row.addon_name}</strong>
                                                <p className={styles['access-url']}>{row.addon_transport_url}</p>
                                            </div>
                                            <button
                                                className={styles['danger-link']}
                                                type="button"
                                                onClick={() => handleAccessDelete(row.id)}
                                                disabled={accessLoading}
                                            >
                                                Remove
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles['empty-surface']}>
                                    <h3 className={styles['surface-title']}>No curated access yet</h3>
                                    <p className={styles['surface-copy']}>
                                        Pick a user and add the transport URLs you want managed from admin.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'Users' ? (
                    <div className={styles['table-wrapper']}>
                        <table className={styles['data-table']}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Admin</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.display_name || '—'}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={classnames(styles['status-pill'], styles[`status-${user.status}`])}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>{user.is_admin ? 'Yes' : 'No'}</td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className={styles['actions-cell']}>
                                            {user.status === 'pending' && (
                                                <button
                                                    className={classnames(styles['action-btn'], styles['approve-btn'])}
                                                    onClick={() => handleUserAction(user.id, 'approved')}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.status === 'approved' && (
                                                <button
                                                    className={classnames(styles['action-btn'], styles['suspend-btn'])}
                                                    onClick={() => handleUserAction(user.id, 'suspended')}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {user.status === 'suspended' && (
                                                <button
                                                    className={classnames(styles['action-btn'], styles['approve-btn'])}
                                                    onClick={() => handleUserAction(user.id, 'approved')}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    Reactivate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={6} className={styles['empty-row']}>No users yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'Setup' ? (
                    <div className={styles['table-wrapper']}>
                        <table className={styles['data-table']}>
                            <thead>
                                <tr>
                                    <th>Contact</th>
                                    <th>Tier</th>
                                    <th>Login</th>
                                    <th>Devices</th>
                                    <th>Status</th>
                                    <th>Term ends</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {setupRequests.map((request) => {
                                    const tier = getServerTier(request.server_tier);
                                    const revealed = revealedRequestId === request.id;
                                    return (
                                        <tr key={request.id}>
                                            <td>{request.email}</td>
                                            <td>{tier ? `${tier.name} · ${tier.termLabel}` : request.server_tier}</td>
                                            <td>
                                                <div>{request.desired_username || '—'}</div>
                                                {request.desired_password ? (
                                                    <button
                                                        type="button"
                                                        className={styles['danger-link']}
                                                        onClick={() => setRevealedRequestId(revealed ? null : request.id)}
                                                    >
                                                        {revealed ? request.desired_password : 'Show password'}
                                                    </button>
                                                ) : (
                                                    <span className={styles['empty-row']}>cleared</span>
                                                )}
                                            </td>
                                            <td>{request.devices || '—'}</td>
                                            <td>
                                                <span className={classnames(styles['status-pill'], styles[`status-${request.status}`])}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>{request.term_expires_at ? new Date(request.term_expires_at).toLocaleDateString() : '—'}</td>
                                            <td className={styles['actions-cell']}>
                                                {request.status !== 'fulfilled' ? (
                                                    <button
                                                        className={classnames(styles['action-btn'], styles['approve-btn'])}
                                                        onClick={() => handleFulfillRequest(request.id)}
                                                        disabled={actionLoading === request.id}
                                                    >
                                                        Mark fulfilled
                                                    </button>
                                                ) : null}
                                                <button
                                                    className={classnames(styles['action-btn'], styles['suspend-btn'])}
                                                    onClick={() => handleDeleteRequest(request.id)}
                                                    disabled={actionLoading === request.id}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {setupRequests.length === 0 && (
                                    <tr><td colSpan={7} className={styles['empty-row']}>No setup requests yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles['table-wrapper']}>
                        <table className={styles['data-table']}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Plan</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Expires</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((sub) => (
                                    <tr key={sub.id}>
                                        {(() => {
                                            const displayStatus = getDisplaySubscriptionStatus(sub);

                                            return (
                                                <>
                                                    <td>{sub.user_display_name || sub.user_email || sub.user_id}</td>
                                                    <td>{sub.plan}</td>
                                                    <td>${(sub.price_cents / 100).toFixed(2)}</td>
                                                    <td>
                                                        <span className={classnames(styles['status-pill'], styles[`status-${displayStatus}`])}>
                                                            {displayStatus}
                                                        </span>
                                                    </td>
                                                    <td>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—'}</td>
                                                    <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                                                </>
                                            );
                                        })()}
                                    </tr>
                                ))}
                                {subscriptions.length === 0 && (
                                    <tr><td colSpan={6} className={styles['empty-row']}>No subscriptions yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

module.exports = Admin;

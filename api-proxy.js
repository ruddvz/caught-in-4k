/**
 * Caught in 4K - Canon Takes API Proxy
 * Local development server
 * 
 * Run: node api-proxy.js
 * Server: http://localhost:3001/api/canon-take
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ quiet: process.env.NODE_ENV === 'test' });
const { getSubscriptionPlan } = require('./src/common/subscriptionPlans');
const { GUIDE_PRODUCT, getServerTier } = require('./src/common/guideAccess');
const {
    canonTakeBodySchema,
    checkoutBodySchema,
    accessKeyBodySchema,
    guideCheckoutBodySchema,
    setupRequestBodySchema,
    setupFulfillBodySchema,
    validateBody,
} = require('./api-proxy/schemas');
const { verifyAccessKey, isAccessKeyGateEnabled } = require('./src/common/accessKey');
const { generateCanonTakeText } = require('./api-proxy/llmProviders');

// Lazy-load Stripe and Supabase — only initialized when env vars are present
let stripe = null;
let supabaseAdmin = null;

const normalizeOrigin = (origin) => {
  if (typeof origin !== 'string' || origin.trim().length === 0) {
    return null;
  }

  try {
    return new URL(origin).origin;
  } catch (_error) {
    return null;
  }
};

const normalizeAppBasePath = (pathname) => {
  if (typeof pathname !== 'string' || pathname.trim().length === 0 || pathname === '/') {
    return '';
  }

  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/+$/, '');
};

const normalizeAppUrl = (value) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  try {
    const parsedUrl = new URL(value);
    const basePath = normalizeAppBasePath(parsedUrl.pathname);
    return {
      basePath,
      origin: parsedUrl.origin,
      url: `${parsedUrl.origin}${basePath}`,
    };
  } catch (_error) {
    return null;
  }
};

const buildAppUrl = (baseUrl, pathname, query) => {
  const normalizedBaseUrl = normalizeAppUrl(baseUrl);
  if (!normalizedBaseUrl) {
    return null;
  }

  const normalizedPathname = typeof pathname === 'string' && pathname.length > 0
    ? (pathname.startsWith('/') ? pathname : `/${pathname}`)
    : '/';
  const url = new URL(normalizedBaseUrl.origin);
  url.pathname = normalizedBaseUrl.basePath.length > 0
    ? (normalizedPathname === '/' ? normalizedBaseUrl.basePath : `${normalizedBaseUrl.basePath}${normalizedPathname}`)
    : normalizedPathname;

  if (query instanceof URLSearchParams) {
    url.search = query.toString();
  } else if (typeof query === 'string') {
    url.search = query.startsWith('?') ? query.slice(1) : query;
  } else if (query && typeof query === 'object') {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length > 0) {
        params.set(key, String(value));
      }
    });
    url.search = params.toString();
  }

  return url.toString();
};

const getAppOriginConfig = (env = process.env) => {
  const configuredAppUrl = normalizeAppUrl(env.APP_BASE_URL || env.PUBLIC_APP_URL || 'https://c4k.live') || {
    basePath: '',
    origin: 'https://c4k.live',
    url: 'https://c4k.live',
  };
  const configuredOrigin = configuredAppUrl.origin;
  const allowedOrigins = new Set([configuredOrigin]);

  String(env.ALLOWED_APP_ORIGINS || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean)
    .forEach((origin) => allowedOrigins.add(origin));

  if (env.NODE_ENV !== 'production') {
    [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3000',
      'https://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'https://localhost:3001',
      'https://127.0.0.1:3001',
    ].forEach((origin) => allowedOrigins.add(origin));
  }

  return {
    allowedOrigins: Array.from(allowedOrigins),
    defaultAppUrl: configuredAppUrl.url,
    defaultOrigin: configuredOrigin,
  };
};

const isAllowedOrigin = (origin, allowedOrigins) => {
  const normalizedOrigin = normalizeOrigin(origin);
  return Boolean(normalizedOrigin && allowedOrigins.includes(normalizedOrigin));
};

const resolveCheckoutOrigin = (origin, config = getAppOriginConfig()) => {
  return isAllowedOrigin(origin, config.allowedOrigins) ? normalizeOrigin(origin) : config.defaultOrigin;
};

const resolveCheckoutBaseUrl = (origin, config = getAppOriginConfig()) => {
  const checkoutOrigin = resolveCheckoutOrigin(origin, config);
  const configuredAppUrl = normalizeAppUrl(config.defaultAppUrl || checkoutOrigin) || {
    basePath: '',
    origin: checkoutOrigin,
    url: checkoutOrigin,
  };

  return `${checkoutOrigin}${configuredAppUrl.basePath}`;
};

const resolveBearerToken = (headers = {}) => {
  const authorizationHeader = headers.authorization || headers.Authorization || '';
  if (typeof authorizationHeader !== 'string' || !authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = authorizationHeader.slice(7).trim();
  return token.length > 0 ? token : null;
};

const verifyCheckoutRequest = async ({ headers, supabaseClient }) => {
  const accessToken = resolveBearerToken(headers);
  if (!accessToken) {
    return {
      error: { message: 'Please sign in again before checkout.', status: 401 },
      user: null,
    };
  }

  const { data, error } = await supabaseClient.auth.getUser(accessToken);
  if (error || !data?.user?.id || !data.user.email) {
    return {
      error: { message: 'Unable to verify account for checkout.', status: 401 },
      user: null,
    };
  }

  return { error: null, user: data.user };
};

const calculateSubscriptionExpiry = ({ latestExpiryIso, now = new Date(), days }) => {
  const baselineDate = latestExpiryIso ? new Date(latestExpiryIso) : new Date(now);
  const currentDate = now instanceof Date ? new Date(now) : new Date(now);
  const effectiveBaseDate = baselineDate > currentDate ? baselineDate : currentDate;
  const expiresAt = new Date(effectiveBaseDate);

  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
};

const getCheckoutSessionEmail = (session) => {
  return session?.customer_details?.email || session?.customer_email || session?.metadata?.subscriptionEmail || null;
};

const validateCheckoutSessionForProvisioning = ({ expectedEmail, planConfig, session }) => {
  if (!session || !planConfig) {
    return { reason: 'Missing checkout session or plan configuration.', valid: false };
  }

  if (session.mode !== 'payment') {
    return { reason: 'Checkout session mode is not supported.', valid: false };
  }

  if (session.payment_status !== 'paid') {
    return { reason: 'Checkout session is not paid yet.', valid: false };
  }

  const billedAmount = typeof session.amount_subtotal === 'number' ? session.amount_subtotal : session.amount_total;
  if (typeof billedAmount !== 'number' || billedAmount !== planConfig.priceCents) {
    return { reason: 'Checkout session amount does not match the selected plan.', valid: false };
  }

  if (typeof session.currency === 'string' && session.currency.toLowerCase() !== 'usd') {
    return { reason: 'Checkout session currency does not match the billing configuration.', valid: false };
  }

  if (expectedEmail) {
    const sessionEmail = getCheckoutSessionEmail(session);
    if (!sessionEmail || sessionEmail.toLowerCase() !== expectedEmail.toLowerCase()) {
      return { reason: 'Checkout session email does not match the verified account.', valid: false };
    }
  }

  return { reason: null, valid: true };
};

const isNotFoundError = (error) => error && error.code === 'PGRST116';

const POSITIVE_PAYMENT_EVENT_TYPES = new Set(['checkout.session.async_payment_succeeded', 'checkout.session.completed']);
const NEGATIVE_PAYMENT_EVENT_TYPES = new Set(['charge.dispute.created', 'charge.refunded']);

const extractStripePaymentIntentId = (stripeObject) => {
  if (!stripeObject || typeof stripeObject !== 'object') {
    return null;
  }

  if (typeof stripeObject.payment_intent === 'string' && stripeObject.payment_intent.trim().length > 0) {
    return stripeObject.payment_intent;
  }

  return stripeObject.object === 'payment_intent' && typeof stripeObject.id === 'string'
    ? stripeObject.id
    : null;
};

const shouldCancelSubscriptionForStripeEvent = (eventType) => NEGATIVE_PAYMENT_EVENT_TYPES.has(eventType);

const shouldRevokeAccessForStripeEvent = (event) => {
  if (!event || typeof event !== 'object' || !NEGATIVE_PAYMENT_EVENT_TYPES.has(event.type)) {
    return false;
  }

  if (event.type !== 'charge.refunded') {
    return true;
  }

  const charge = event.data && event.data.object ? event.data.object : null;
  if (!charge || typeof charge !== 'object') {
    return false;
  }

  if (charge.refunded === true) {
    return true;
  }

  return typeof charge.amount === 'number'
    && typeof charge.amount_refunded === 'number'
    && charge.amount_refunded >= charge.amount;
};

const cancelSubscriptionAccess = async ({ paymentIntentId, revokedAt = new Date().toISOString(), supabaseClient }) => {
  if (!paymentIntentId) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from('subscriptions')
    .update({ expires_at: revokedAt, status: 'cancelled' })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .eq('status', 'active')
    .select('id');

  if (error) {
    throw error;
  }

  return Array.isArray(data) && data.length > 0;
};

const hasPaymentReversal = async ({ paymentIntentId, supabaseClient }) => {
  if (!paymentIntentId) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from('stripe_payment_reversals')
    .select('payment_intent_id')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (error && !isNotFoundError(error)) {
    throw error;
  }

  return Boolean(data && data.payment_intent_id === paymentIntentId);
};

const recordPaymentReversal = async ({ eventType, paymentIntentId, supabaseClient }) => {
  if (!paymentIntentId) {
    return false;
  }

  const { error } = await supabaseClient
    .from('stripe_payment_reversals')
    .upsert({
      event_type: eventType,
      payment_intent_id: paymentIntentId,
      recorded_at: new Date().toISOString(),
    }, {
      onConflict: 'payment_intent_id',
    });

  if (error) {
    throw error;
  }

  return true;
};

const getStripe = () => {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
};

const getSupabaseAdmin = () => {
    if (!supabaseAdmin && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient } = require('@supabase/supabase-js');
        supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    return supabaseAdmin;
};

// Sends a transactional email via Resend. No-ops (returns false) when RESEND_API_KEY
// is not configured, so the app degrades gracefully.
const sendEmail = async ({ to, subject, text }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || 'Caught in 4K <noreply@c4k.live>';
    if (!apiKey || !to) {
        return false;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to, subject, text }),
        });
        if (!response.ok) {
            console.error('[Resend] Email failed:', response.status, await response.text());
            return false;
        }
        return true;
    } catch (error) {
        console.error('[Resend] Email error:', error.message);
        return false;
    }
};

const app = express();

// Security headers — applied first, before all other middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin(origin, callback) {
    const { allowedOrigins } = getAppOriginConfig();
    if (!origin || isAllowedOrigin(origin, allowedOrigins)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
}));
// Parse JSON for all routes except Stripe webhook (which needs raw body)
app.use((req, res, next) => {
    if (req.originalUrl === '/api/stripe/webhook') {
        next();
    } else {
        express.json({ limit: '32kb' })(req, res, next);
    }
});

// General API rate limiter: 30 requests per IP per minute
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

// Stricter limiter for Canon Takes endpoint: 10 per IP per minute
const canonTakeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Canon Takes rate limit reached.' },
});
app.use('/api/canon-take', canonTakeLimiter);

const handleCanonTake = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, year, genres, imdbRating } = req.validatedBody || req.body;

  try {
    const hasAnyProvider = Boolean(
      process.env.GEMINI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.OPENROUTER_API_KEY
    );

    if (!hasAnyProvider) {
      return res.status(500).json({ error: 'No LLM provider configured' });
    }

    console.log(`[Canon Take] Generating for: ${title} (${year})`);

    const { canonTake, provider } = await generateCanonTakeText({
      title,
      year,
      genres,
      imdbRating,
    });

    if (!canonTake) {
      return res.status(500).json({ error: 'All LLM providers failed' });
    }

    console.log(`[Canon Take] ✅ Generated via ${provider}: "${canonTake.substring(0, 60)}..."`);
    return res.status(200).json({ canonTake, provider });
  } catch (error) {
    console.error('[Canon Take] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

app.post('/api/canon-take', validateBody(canonTakeBodySchema), handleCanonTake);

app.post('/api/access/verify', validateBody(accessKeyBodySchema), (req, res) => {
    if (!isAccessKeyGateEnabled()) {
        return res.status(200).json({ valid: true, gateEnabled: false });
    }
    const valid = verifyAccessKey(req.validatedBody.key);
    return res.status(valid ? 200 : 403).json({ valid, gateEnabled: true });
});

// ────────────────────────────────────────────────────────────
// Stripe Checkout — creates a Stripe Checkout Session
// ────────────────────────────────────────────────────────────
app.post('/api/stripe/create-checkout-session', validateBody(checkoutBodySchema), async (req, res) => {
    const stripeClient = getStripe();
  const sb = getSupabaseAdmin();
    if (!stripeClient) {
        return res.status(503).json({ error: 'Stripe is not configured' });
    }
  if (!sb) {
    return res.status(503).json({ error: 'Supabase admin is not configured' });
  }

  const { plan } = req.validatedBody || req.body || {};

  const planConfig = getSubscriptionPlan(plan);
  if (!planConfig) {
        return res.status(400).json({ error: 'Invalid plan' });
    }

    try {
    const verifiedCheckout = await verifyCheckoutRequest({ headers: req.headers, supabaseClient: sb });
    if (verifiedCheckout.error) {
      return res.status(verifiedCheckout.error.status).json({ error: verifiedCheckout.error.message });
    }

    const userId = verifiedCheckout.user.id;
    const email = verifiedCheckout.user.email;
    const { data: userRecord, error: userError } = await sb
      .from('users')
      .select('id, email, status, is_admin')
      .eq('id', userId)
      .single();

    if (userError || !userRecord || userRecord.email !== email) {
      return res.status(403).json({ error: 'Unable to verify account for checkout' });
    }

    if (userRecord.status !== 'approved' && userRecord.is_admin !== true) {
      return res.status(403).json({ error: 'Account approval is still pending' });
    }

    const appBaseUrl = resolveCheckoutBaseUrl(req.headers.origin);
        const session = await stripeClient.checkout.sessions.create({
      client_reference_id: userId,
            mode: 'payment',
            customer_email: email,
            line_items: [{
                price_data: {
                    currency: 'usd',
          product_data: { name: `C4K ${planConfig.label}` },
          unit_amount: planConfig.priceCents,
                },
                quantity: 1,
            }],
      metadata: { userId, plan: planConfig.id, subscriptionEmail: email },
        success_url: buildAppUrl(appBaseUrl, '/subscribe', { success: '1', plan: planConfig.id }),
        cancel_url: buildAppUrl(appBaseUrl, '/subscribe', { cancelled: '1', plan: planConfig.id }),
        });

        console.log(`[Stripe] Checkout session created for user=${userId} — plan: ${planConfig.id}`);
        return res.json({ url: session.url });
    } catch (err) {
        console.error('[Stripe] Checkout error:', err.message);
      return res.status(500).json({ error: 'Unable to start checkout right now.' });
    }
});

// ────────────────────────────────────────────────────────────
// Guide ($30 one-time) — creates a Stripe Checkout Session
// ────────────────────────────────────────────────────────────
app.post('/api/stripe/create-guide-checkout-session', validateBody(guideCheckoutBodySchema), async (req, res) => {
    const stripeClient = getStripe();
    const sb = getSupabaseAdmin();
    if (!stripeClient) {
        return res.status(503).json({ error: 'Stripe is not configured' });
    }
    if (!sb) {
        return res.status(503).json({ error: 'Supabase admin is not configured' });
    }

    try {
        const verified = await verifyCheckoutRequest({ headers: req.headers, supabaseClient: sb });
        if (verified.error) {
            return res.status(verified.error.status).json({ error: verified.error.message });
        }

        const userId = verified.user.id;
        const email = verified.user.email;
        const appBaseUrl = resolveCheckoutBaseUrl(req.headers.origin);
        const session = await stripeClient.checkout.sessions.create({
            client_reference_id: userId,
            mode: 'payment',
            customer_email: email,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `C4K ${GUIDE_PRODUCT.name}` },
                    unit_amount: GUIDE_PRODUCT.priceCents,
                },
                quantity: 1,
            }],
            metadata: { userId, product: 'guide', subscriptionEmail: email },
            success_url: buildAppUrl(appBaseUrl, '/guide', { success: '1' }),
            cancel_url: buildAppUrl(appBaseUrl, '/guide', { cancelled: '1' }),
        });

        console.log(`[Stripe] Guide checkout session created for user=${userId}`);
        return res.json({ url: session.url });
    } catch (err) {
        console.error('[Stripe] Guide checkout error:', err.message);
        return res.status(500).json({ error: 'Unable to start checkout right now.' });
    }
});

// ────────────────────────────────────────────────────────────
// Setup request ($120 done-for-you) — stores the request and emails the operator
// ────────────────────────────────────────────────────────────
app.post('/api/setup/request', validateBody(setupRequestBodySchema), async (req, res) => {
    const sb = getSupabaseAdmin();
    if (!sb) {
        return res.status(503).json({ error: 'Supabase admin is not configured' });
    }

    const body = req.validatedBody;
    const tier = getServerTier(body.server_tier);
    if (!tier) {
        return res.status(400).json({ error: 'Invalid server tier' });
    }

    // Attach the C4K user id when a valid session is present (optional).
    let userId = null;
    const verified = await verifyCheckoutRequest({ headers: req.headers, supabaseClient: sb });
    if (!verified.error) {
        userId = verified.user.id;
    }

    try {
        const { error: insertError } = await sb.from('setup_requests').insert({
            user_id: userId,
            email: body.email,
            server_tier: body.server_tier,
            desired_username: body.desired_username,
            desired_password: body.desired_password,
            devices: body.devices || '',
            notes: body.notes || '',
            status: 'new',
        });
        if (insertError) {
            throw insertError;
        }

        const operatorEmail = process.env.OPERATOR_EMAIL;
        await sendEmail({
            to: operatorEmail,
            subject: 'New C4K account setup request',
            text: [
                'A new done-for-you setup request was submitted.',
                '',
                `Tier: ${tier.name} (${tier.termLabel})`,
                `Contact: ${body.email}`,
                `Desired username: ${body.desired_username}`,
                `Devices: ${body.devices || '—'}`,
                `Notes: ${body.notes || '—'}`,
                '',
                'Open the C4K admin panel to view the full request and provision the account.',
            ].join('\n'),
        });

        return res.json({ ok: true });
    } catch (err) {
        console.error('[Setup] Request error:', err.message);
        return res.status(500).json({ error: 'Unable to submit your request right now.' });
    }
});

// Admin marks a setup request fulfilled: records the term-expiry for renewal
// tracking and clears the stored password.
app.post('/api/setup/fulfill', validateBody(setupFulfillBodySchema), async (req, res) => {
    const sb = getSupabaseAdmin();
    if (!sb) {
        return res.status(503).json({ error: 'Supabase admin is not configured' });
    }

    try {
        const verified = await verifyCheckoutRequest({ headers: req.headers, supabaseClient: sb });
        if (verified.error) {
            return res.status(verified.error.status).json({ error: verified.error.message });
        }

        const { data: adminRecord, error: adminError } = await sb
            .from('users')
            .select('is_admin')
            .eq('id', verified.user.id)
            .single();
        if (adminError || !adminRecord || adminRecord.is_admin !== true) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.validatedBody;
        const { data: request, error: requestError } = await sb
            .from('setup_requests')
            .select('id, server_tier, user_id')
            .eq('id', id)
            .single();
        if (requestError || !request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const tier = getServerTier(request.server_tier);
        const termExpiresAt = calculateSubscriptionExpiry({ days: tier ? tier.includedDays : 0 });

        const { error: updateError } = await sb
            .from('setup_requests')
            .update({
                status: 'fulfilled',
                fulfilled_at: new Date().toISOString(),
                term_expires_at: termExpiresAt.toISOString(),
                desired_password: null,
            })
            .eq('id', id);
        if (updateError) {
            throw updateError;
        }

        // Bundle: setup customers with a C4K account also get the guide unlocked.
        if (request.user_id) {
            await sb.from('users').update({ guide_unlocked: true }).eq('id', request.user_id);
        }

        return res.json({ ok: true, term_expires_at: termExpiresAt.toISOString() });
    } catch (err) {
        console.error('[Setup] Fulfill error:', err.message);
        return res.status(500).json({ error: 'Unable to fulfill request right now.' });
    }
});

// ────────────────────────────────────────────────────────────
// Stripe Webhook — handles checkout.session.completed
// ────────────────────────────────────────────────────────────
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripeClient = getStripe();
    const sb = getSupabaseAdmin();
    if (!stripeClient || !sb) {
        return res.status(503).json({ error: 'Stripe/Supabase not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        return res.status(503).json({ error: 'Webhook secret not configured' });
    }

    let event;
    try {
        event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    if (POSITIVE_PAYMENT_EVENT_TYPES.has(event.type)) {
        const session = event.data.object;
        const { userId, plan, product } = session.metadata || {};

      // $30 guide one-time purchase — flip the unlock flag and finish.
      if (product === 'guide') {
        if (!userId) {
          console.error('[Stripe Webhook] Missing userId for guide session:', session.id);
          return res.json({ received: true });
        }
        // Only unlock once the payment has actually cleared. For async payment
        // methods Stripe fires checkout.session.completed with payment_status
        // 'unpaid' (the charge settles later via async_payment_succeeded).
        if (session.payment_status !== 'paid') {
          console.error(`[Stripe Webhook] Ignoring guide session ${session.id}: payment_status=${session.payment_status}`);
          return res.json({ received: true });
        }
        // Reject any amount that does not match the expected price (including a
        // missing amount), rather than only when it is present and wrong.
        if (session.amount_total !== GUIDE_PRODUCT.priceCents) {
          console.error(`[Stripe Webhook] Ignoring guide session ${session.id}: unexpected amount ${session.amount_total}`);
          return res.json({ received: true });
        }
        try {
          const { error: unlockError } = await sb
            .from('users')
            .update({ guide_unlocked: true })
            .eq('id', userId);
          if (unlockError) {
            throw unlockError;
          }
          console.log(`[Stripe Webhook] Guide unlocked: user=${userId}`);
        } catch (error) {
          console.error('[Stripe Webhook] Guide unlock error:', error);
          return res.status(500).json({ error: 'Failed to unlock guide' });
        }
        return res.json({ received: true });
      }

      const planConfig = getSubscriptionPlan(plan);

      if (!userId || !planConfig) {
        console.error('[Stripe Webhook] Missing checkout metadata for session:', session.id);
        return res.json({ received: true });
      }

      try {
        const { data: userRecord, error: userError } = await sb
          .from('users')
          .select('email')
          .eq('id', userId)
          .maybeSingle();

        if (userError) {
          throw userError;
        }

        if (!userRecord) {
          console.error('[Stripe Webhook] Unknown user for checkout session:', userId);
          return res.json({ received: true });
        }

        const validation = validateCheckoutSessionForProvisioning({
          expectedEmail: userRecord.email,
          planConfig,
          session,
        });
        if (!validation.valid) {
          console.error(`[Stripe Webhook] Ignoring session ${session.id}: ${validation.reason}`);
          return res.json({ received: true });
        }

        const paymentIntentId = extractStripePaymentIntentId(session);
        if (await hasPaymentReversal({ paymentIntentId, supabaseClient: sb })) {
          console.error(`[Stripe Webhook] Ignoring reversed payment intent for session ${session.id}`);
          return res.json({ received: true });
        }

        const { data: existingSession, error: existingSessionError } = await sb
          .from('subscriptions')
          .select('id')
          .eq('stripe_session_id', session.id)
          .maybeSingle();

        if (existingSessionError && !isNotFoundError(existingSessionError)) {
          throw existingSessionError;
        }

        if (existingSession) {
          return res.json({ received: true });
        }

        const { data: latestActiveSubscription, error: latestActiveSubscriptionError } = await sb
          .from('subscriptions')
          .select('expires_at')
          .eq('user_id', userId)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestActiveSubscriptionError && !isNotFoundError(latestActiveSubscriptionError)) {
          throw latestActiveSubscriptionError;
        }

        const expiresAt = calculateSubscriptionExpiry({
          days: planConfig.days,
          latestExpiryIso: latestActiveSubscription?.expires_at,
        });

            const { error } = await sb.from('subscriptions').insert({
                user_id: userId,
              plan: planConfig.id,
          price_cents: planConfig.priceCents,
                    stripe_payment_intent_id: paymentIntentId,
                stripe_session_id: session.id,
                status: 'active',
                expires_at: expiresAt.toISOString(),
            });

            if (error) {
          throw error;
            }

        console.log(`[Stripe Webhook] Subscription activated: user=${userId}, plan=${planConfig.id}, expires=${expiresAt.toISOString()}`);
      } catch (error) {
        console.error('[Stripe Webhook] Persistence error:', error);
        return res.status(500).json({ error: 'Failed to persist subscription update' });
        }
    } else if (shouldRevokeAccessForStripeEvent(event)) {
      try {
        const paymentIntentId = extractStripePaymentIntentId(event.data.object);
        await recordPaymentReversal({
          eventType: event.type,
          paymentIntentId,
          supabaseClient: sb,
        });
        const cancelled = await cancelSubscriptionAccess({
          paymentIntentId,
          supabaseClient: sb,
        });

        if (cancelled) {
          console.log(`[Stripe Webhook] Subscription cancelled for payment intent=${paymentIntentId}`);
        }
      } catch (error) {
        console.error('[Stripe Webhook] Failed to cancel subscription access:', error);
        return res.status(500).json({ error: 'Failed to revoke subscription access' });
      }
    }

    return res.json({ received: true });
});

const PORT = process.env.PORT || 3001;
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`\n🎬 Caught in 4K - API Proxy`);
      console.log(`📍 Running on http://localhost:${PORT}`);
      console.log(`🔌 Canon Takes: POST http://localhost:${PORT}/api/canon-take`);
      console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ NOT FOUND'}`);
      console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ NOT FOUND'}`);
      console.log(`🔗 Supabase Admin: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '❌ NOT FOUND'}\n`);
    });
  }

  module.exports = {
    app,
    calculateSubscriptionExpiry,
    getAppOriginConfig,
    buildAppUrl,
    cancelSubscriptionAccess,
    isAllowedOrigin,
    extractStripePaymentIntentId,
    hasPaymentReversal,
    recordPaymentReversal,
    resolveBearerToken,
    resolveCheckoutBaseUrl,
    resolveCheckoutOrigin,
    shouldCancelSubscriptionForStripeEvent,
    shouldRevokeAccessForStripeEvent,
    validateCheckoutSessionForProvisioning,
    verifyCheckoutRequest,
  };

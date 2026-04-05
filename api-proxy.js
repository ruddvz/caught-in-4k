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
require('dotenv').config();
const { getSubscriptionPlan } = require('./src/common/subscriptionPlans');

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
        express.json()(req, res, next);
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

  const { title, year, genres, imdbRating } = req.body;

  if (!title || !year || !genres || imdbRating === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const userPrompt = `Write a Canon Take for: ${title} (${year}). Genre: ${genres}. IMDB: ${imdbRating}/10.`;

    const systemPrompt = `You write Canon Takes — short, honest movie summaries for a Gen Z film platform called Caught in 4K. Rules: max 3 sentences, no more. Sound like a friend who has seen the film giving you the real verdict. Have an actual opinion. Reference the cultural moment if there is one (memes, catchphrases, awards, controversies). Never start with "This film" or "The movie". No spoilers. No em dashes. No AI tells like "delves into", "testament to", "nuanced". Write in lowercase where it fits the tone.`;

    console.log(`[Canon Take] Generating for: ${title} (${year})`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: userPrompt }],
            },
          ],
          safety_settings: [
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
          generation_config: {
            max_output_tokens: 120,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error(`[Canon Take] Gemini error:`, data.error);
      return res.status(400).json({ error: data.error.message });
    }

    const canonTake = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!canonTake) {
      return res.status(500).json({ error: 'No response from Gemini' });
    }

    console.log(`[Canon Take] ✅ Generated: "${canonTake.substring(0, 60)}..."`);
    return res.status(200).json({ canonTake });
  } catch (error) {
    console.error('[Canon Take] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

app.post('/api/canon-take', handleCanonTake);

// ────────────────────────────────────────────────────────────
// Stripe Checkout — creates a Stripe Checkout Session
// ────────────────────────────────────────────────────────────
app.post('/api/stripe/create-checkout-session', async (req, res) => {
    const stripeClient = getStripe();
  const sb = getSupabaseAdmin();
    if (!stripeClient) {
        return res.status(503).json({ error: 'Stripe is not configured' });
    }
  if (!sb) {
    return res.status(503).json({ error: 'Supabase admin is not configured' });
  }

  const { plan } = req.body || {};
  if (!plan) {
    return res.status(400).json({ error: 'Missing plan' });
    }

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
      metadata: { userId, plan, subscriptionEmail: email },
        success_url: buildAppUrl(appBaseUrl, '/subscribe', { success: '1' }),
        cancel_url: buildAppUrl(appBaseUrl, '/subscribe', { cancelled: '1' }),
        });

        console.log(`[Stripe] Checkout session created for user=${userId} — plan: ${plan}`);
        return res.json({ url: session.url });
    } catch (err) {
        console.error('[Stripe] Checkout error:', err.message);
      return res.status(500).json({ error: 'Unable to start checkout right now.' });
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
        const { userId, plan } = session.metadata || {};
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
                plan,
          price_cents: planConfig.priceCents,
                    stripe_payment_intent_id: paymentIntentId,
                stripe_session_id: session.id,
                status: 'active',
                expires_at: expiresAt.toISOString(),
            });

            if (error) {
          throw error;
            }

        console.log(`[Stripe Webhook] Subscription activated: user=${userId}, plan=${plan}, expires=${expiresAt.toISOString()}`);
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

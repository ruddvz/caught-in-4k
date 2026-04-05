# C4K Manual Setup Checklist
Last updated: 2026-04-05

These are the things that cannot be done in code — you need to do them yourself.
Grouped by phase so you can work through them in order.

---

## Phase 1 — Right Now (No API needed)

These should work immediately after the latest code changes.

- [ ] Run `npm run dev` and open a movie/show detail page — verify the hero card now shows the backdrop image
- [ ] On the same detail page, verify you can scroll through episodes or streams in the right panel
- [ ] Open Settings → verify the Devices section appears showing "This device"
- [ ] Verify Canon Takes load from Pollinations or disappear cleanly (no "No take yet" text)

---

## Phase 2 — Deploy the Backend Proxy

The entire backend (Canon Takes, Stripe, Supabase auth) runs through `api-proxy.js`.
It currently has no production host. Pick one:

### Option A — Railway (recommended, easiest)
1. Go to railway.app → New Project → Deploy from GitHub repo
2. Set the start command: `node api-proxy.js`
3. Add all environment variables from the list in Phase 3
4. Railway gives you a public URL like `https://c4k-proxy.up.railway.app`
5. Set that URL as `REACT_APP_CANON_PROXY_URL` in your frontend `.env`

### Option B — Render
1. Go to render.com → New Web Service → connect your repo
2. Build command: `npm install`
3. Start command: `node api-proxy.js`
4. Add environment variables (Phase 3)

### Option C — Fly.io
1. `npm install -g flyctl`
2. `fly launch` from the project root
3. `fly secrets set KEY=value` for each env var
4. `fly deploy`

**After deploying:** Add PM2 for crash recovery (if your host doesn't auto-restart):
```bash
npm install -g pm2
pm2 start api-proxy.js --name c4k-proxy
pm2 save
pm2 startup
```

---

## Phase 3 — Environment Variables

### Frontend `.env` (create this file at the project root)
```
REACT_APP_CANON_PROXY_URL=https://your-proxy-host.com/api/canon-take
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_BASE_URL=https://your-proxy-host.com
```

### Backend proxy (set these as environment variables on your host, NOT in code)
```
GEMINI_API_KEY=           # Optional — only if you re-enable Gemini later
STRIPE_SECRET_KEY=        # From Stripe Dashboard → Developers → API Keys
STRIPE_WEBHOOK_SECRET=    # From Stripe Dashboard → Webhooks → signing secret
SUPABASE_URL=             # From Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=# From Supabase → Settings → API → service_role key
PORT=3001
NODE_ENV=production
APP_BASE_URL=https://c4k.live   # Your production frontend URL
```

> Never commit these values to git. Add `.env` to `.gitignore` if it isn't already.

---

## Phase 4 — Supabase Setup

### 4a. Create a Supabase project
1. Go to supabase.com → New Project
2. Note your Project URL and anon key

### 4b. Run these SQL migrations in the Supabase SQL editor

**Users table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user row when someone signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Subscriptions table**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for the checkout query (runs on every purchase)
CREATE INDEX idx_subscriptions_user_active
  ON subscriptions (user_id, status, expires_at DESC);
```

**Stripe payment reversals table**
```sql
CREATE TABLE stripe_payment_reversals (
  payment_intent_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Profiles table** *(for cross-device profile sync — future)*
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_id TEXT,
  accent_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Devices table** *(for server-side device enforcement — future)*
```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_label TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);
```

### 4c. Row-Level Security
Enable RLS on all tables, then add policies:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "users_select_own" ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can read their own subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Phase 5 — Stripe Setup

1. Create a Stripe account at stripe.com
2. Go to Developers → API Keys → copy the **Secret key** (starts with `sk_`)
3. Go to Developers → Webhooks → Add endpoint
   - URL: `https://your-proxy-host.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `charge.refunded`
     - `charge.dispute.created`
4. Copy the **Signing secret** (starts with `whsec_`)
5. Set both keys as environment variables on your proxy host

**Test the webhook locally:**
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

---

## Phase 6 — Device Limits (Backend Wiring)

Right now device limits are tracked locally in each browser's localStorage.
When the backend is ready:

1. Add a `POST /api/devices/register` endpoint to `api-proxy.js` that upserts into the `devices` table
2. Add a `GET /api/devices` endpoint that returns all devices for the authenticated user
3. Add a `DELETE /api/devices/:deviceId` endpoint to remove a device
4. Update `src/common/useDeviceSession.ts` — replace the localStorage read/write calls with fetch calls to those endpoints
5. The `isAtLimit()` check then reads from the server-verified device count instead of localStorage

---

## Phase 7 — Canon Takes Cache (Cost Control)

Without this, every user querying the same movie hits Pollinations.
When ready:

1. Add the `canon_takes_cache` table to Supabase:
   ```sql
   CREATE TABLE canon_takes_cache (
     content_id TEXT NOT NULL,
     content_type TEXT NOT NULL,
     take_text TEXT NOT NULL,
     generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
     PRIMARY KEY (content_id, content_type)
   );
   ```
2. Add `GET /api/canon-take/:type/:id` to the proxy — returns cached take or null
3. Add that endpoint as a pre-check in `pollinationsApi.js` before calling Pollinations
4. On Pollinations success, write the result back via `POST /api/canon-take/cache`

---

## Phase 8 — Production Deploy (Frontend)

C4K frontend deploys to GitHub Pages via GitHub Actions.

1. Go to your repo → Settings → Pages → Source: `gh-pages` branch
2. Run `npm run deploy` to build and push to `gh-pages`
3. Verify the live URL loads and `REACT_APP_*` env vars are baked into the build

> Env vars must be set **before** building. They are compiled into the bundle at build time, not runtime.

---

## Quick Reference — What's Behind Each Feature

| Feature | Needs |
|---------|-------|
| Canon Takes (Pollinations) | Nothing — works now |
| Canon Takes (cached) | Phase 7 |
| Login / Sign Up | Phase 3 + 4 |
| Subscription checkout | Phase 3 + 4 + 5 |
| Device limit enforcement | Phase 6 |
| Cross-device profile sync | Phase 4 (profiles table) + code wiring |
| Admin panel | Phase 4 (is_admin flag) |
| Stripe refund handling | Phase 5 (already coded in api-proxy.js) |

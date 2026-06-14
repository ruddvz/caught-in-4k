# 🚀 Caught in 4K — Guide & Setup Launch Manual

**Your to-do checklist for turning on the two paid products.**

This file is for **you** (the operator). Work top to bottom. Anything marked
✅ **DONE** is already finished — you only need to do the ⬜ **TODO** items.

> The two products this covers:
> | Product | Price | What the buyer gets |
> |---|---|---|
> | **Stremio Setup Guide** | **$30** one-time | Unlocks the in-app written guide + the step-by-step Wizard |
> | **Done-for-You Account Setup** | **$120** one-time | You build their account for them. Includes streaming time: **Single IP = 180 days**, **Multi-Stream = 90 days** |

Everything else on the site (the live Stremio app, the `films` table, Canon
Takes, etc.) is **separate** and untouched by this work.

---

## 📋 At a glance — what's left for you

| # | Task | Where | Status |
|---|------|-------|--------|
| 1 | Database schema + tables | Supabase | ✅ DONE (by me) |
| 2 | Make yourself an admin | Supabase SQL | ⬜ TODO |
| 3 | Configure auth email settings | Supabase | ⬜ TODO |
| 4 | Create Stripe account + keys + webhook | Stripe | ⬜ TODO |
| 5 | Create Resend account + verify domain | Resend | ⬜ TODO |
| 6 | Set access keys (invite gate) | env var | ⬜ TODO (optional) |
| 7 | Deploy to Vercel + set env vars | Vercel | ⬜ TODO |
| 8 | Restructure backend into Vercel functions | code | ⬜ TODO (I can do this — just ask) |
| 9 | Test the full flow in Stripe **test mode** | everywhere | ⬜ TODO |
| 10 | Flip to **live mode** + launch | Stripe/Vercel | ⬜ TODO |

---

## ✅ 1. Database — DONE

I already applied the schema to your **`caught-in-4k`** Supabase project
(`xuxrqadwnebggzvriuku`, region `ca-central-1`). The `films` table and your
live site were **not** touched. What's now in place:

- `users.guide_unlocked` (boolean) — the flag the $30 purchase flips on.
- `setup_requests` table — where $120 setup orders land, **locked to admins
  only** via Row-Level Security (RLS).
- The `users` auth table, the new-signup trigger, and the `admin_*` RPCs that
  the Admin page and these flows depend on.

**You don't need to do anything here.** Move on to step 2.

---

## ⬜ 2. Make yourself an admin

You need `is_admin = true` on your own user row so you can see the **Admin →
Setup** tab and fulfill orders.

1. **First, sign up on the site** with your email (`pvr6675@gmail.com`) so a
   `users` row exists. (Do this once the site is deployed, or locally.)
2. Then in **Supabase → SQL Editor**, run:

```sql
update public.users
set is_admin = true
where email = 'pvr6675@gmail.com';
```

3. Verify:

```sql
select email, is_admin, guide_unlocked from public.users where email = 'pvr6675@gmail.com';
```

---

## ⬜ 3. Supabase auth settings (important for the $30 flow)

The guide paywall lets a buyer **create an account inline** and pay
immediately. For that to work smoothly:

- **Supabase → Authentication → Providers → Email**
  - Decide on **"Confirm email"**:
    - **OFF** = buyer gets instant access right after sign-up (smoothest for
      sales — *recommended*).
    - **ON** = buyer must click a confirmation link in their email before they
      can pay. More secure, but adds friction. If you keep this ON, tell buyers
      to confirm first.
- **Supabase → Authentication → URL Configuration**
  - Set **Site URL** to your real domain (e.g. `https://c4k.live`) so auth
    emails link back correctly.

---

## ⬜ 4. Stripe

### 4a. Account + keys
1. Create / log into **https://dashboard.stripe.com**.
2. Stay in **Test mode** (toggle, top-right) until you've tested everything.
3. **Developers → API keys** — copy:
   - **Publishable key** (`pk_test_...`) → frontend env `REACT_APP_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...`) → backend env `STRIPE_SECRET_KEY`

> You don't need to create Products/Prices in the Stripe dashboard — the
> backend creates the line items on the fly ($30 guide / $120 setup) with the
> correct amounts.

### 4b. Webhook (this is what unlocks the guide after payment)
1. **Developers → Webhooks → Add endpoint.**
2. **Endpoint URL:** `https://YOUR-DOMAIN/api/stripe/webhook`
   (e.g. `https://c4k.live/api/stripe/webhook`).
3. **Events to send** — select at minimum:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `charge.refunded` *(optional, for awareness)*
4. Save, then copy the **Signing secret** (`whsec_...`) → backend env
   `STRIPE_WEBHOOK_SECRET`.

> ⚠️ The webhook only unlocks the guide when Stripe reports the payment as
> **actually paid** and the **amount matches $30** — so card test failures and
> mismatched amounts won't grant access.

---

## ⬜ 5. Resend (emails for setup orders)

When someone buys the $120 setup, the backend emails **you** (the operator) so
you know to build their account.

1. Create / log into **https://resend.com**.
2. **Domains → Add domain** → add `c4k.live` (or your domain) and add the DNS
   records Resend gives you. Wait for "Verified".
3. **API Keys → Create** → copy the key → backend env `RESEND_API_KEY`.
4. Set backend env `RESEND_FROM` to a sender on your verified domain, e.g.
   `Caught in 4K <noreply@c4k.live>` (this is also the default).
5. Set backend env `OPERATOR_EMAIL` to **where you want order notifications**
   (e.g. `pvr6675@gmail.com`).

> No Resend account yet? The flow still works — setup orders are saved to the
> `setup_requests` table regardless, and you'll see them in the Admin tab. The
> email is just a convenience ping.

---

## ⬜ 6. Access keys (invite-only gate — optional)

If you want the site invite-only, set the frontend env `C4K_ACCESS_KEYS` to a
comma-separated list of 12-character keys (letters/digits, dashes optional):

```
C4K_ACCESS_KEYS=ABCD1234EFGH,WXYZ-5678-PQRS
```

Leave it empty to disable the gate.

---

## ⬜ 7. Deploy to Vercel

1. **Import the repo** at https://vercel.com → New Project.
2. Framework preset: it's a custom webpack build. Set:
   - **Build command:** `pnpm run build` (or `npm run build`)
   - **Output directory:** `build`
3. Add **all environment variables** below (Settings → Environment Variables).
4. Point your domain (`c4k.live`) at Vercel (Settings → Domains) and update DNS.

### Environment variables reference

**Frontend (must be present at _build_ time — names start with `REACT_APP_` or are the gate):**

| Variable | Value |
|---|---|
| `REACT_APP_SUPABASE_URL` | `https://xuxrqadwnebggzvriuku.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | your **publishable** key (`sb_publishable_...`) — Supabase → Project Settings → API → "Publishable key" *(preferred over the legacy anon JWT)* |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | your `pk_test_...` / `pk_live_...` |
| `REACT_APP_API_BASE_URL` | your site origin, e.g. `https://c4k.live` ⚠️ **required** so the Guide/Setup/Admin pages can reach `/api/*` |
| `C4K_ACCESS_KEYS` | optional invite keys (step 6) |

> These Supabase frontend keys are safe to ship in the browser bundle (they're
> protected by Row-Level Security), but don't paste their literal values into
> committed files — secret scanners will flag them. Always copy the current
> values from **Supabase → Project Settings → API** when filling in Vercel.

**Backend (server-only — NEVER expose these in the frontend):**

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://xuxrqadwnebggzvriuku.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase → Project Settings → API → `service_role` (keep secret!) |
| `STRIPE_SECRET_KEY` | your `sk_test_...` / `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | your `whsec_...` (step 4b) |
| `RESEND_API_KEY` | your Resend key (step 5) |
| `RESEND_FROM` | `Caught in 4K <noreply@c4k.live>` |
| `OPERATOR_EMAIL` | where order pings go, e.g. `pvr6675@gmail.com` |
| `APP_BASE_URL` | your site origin, e.g. `https://c4k.live` (Stripe redirects + CORS) |
| `ALLOWED_APP_ORIGINS` | optional extra origins (preview/staging), comma-separated |

---

## ⬜ 8. Backend serverless restructure (pending)

The backend currently lives in **`api-proxy.js`** as a single Express server.
On Vercel, `/api/*` routes need to be **serverless functions** (files under an
`api/` folder). Until that's done, deploying the static frontend alone will
make the Guide/Setup/Admin pages fail to reach the backend.

**Two options:**
- **A. I do it for you** — just say "do the Vercel restructure" and I'll split
  `api-proxy.js` into Vercel serverless functions and wire the routes. *(Recommended.)*
- **B. Host the Express backend separately** (Railway/Render/Fly) and set
  `REACT_APP_API_BASE_URL` to that backend's URL instead of your site origin.

---

## ⬜ 9. Test everything (Stripe **test mode**)

Run through the real flows before going live:

**Guide ($30):**
1. Sign up / log in on the site.
2. Go to **Guide** → hit the paywall → click buy → use Stripe test card
   `4242 4242 4242 4242`, any future expiry, any CVC.
3. After redirect, confirm the guide + Wizard are unlocked.
4. In Supabase, confirm `users.guide_unlocked = true` for that user.

**Setup ($120):**
1. Go to **Setup**, pick a tier, fill the form, submit.
2. Confirm a row appears in `setup_requests` (Supabase) **and** you got the
   `OPERATOR_EMAIL` notification.
3. As an admin, open **Admin → Setup**, find the request, and click **Fulfill**
   — confirm it provisions the account / clears the stored password.

**Negative checks:**
- A failed test card (`4000 0000 0000 0002`) should **not** unlock the guide.

---

## ⬜ 10. Go live

1. Stripe: flip to **Live mode**, regenerate live keys, and create a **live**
   webhook (repeat step 4b with live keys).
2. Update Vercel env vars to the **live** Stripe keys + live `whsec_`.
3. Redeploy.
4. Do one real $30 purchase yourself to confirm the live path, then refund it
   in Stripe.

---

## 🔍 How the flows work (for your reference)

**$30 Guide unlock**
`Guide page paywall` → inline sign-up/login → `POST /api/stripe/create-guide-checkout-session`
→ Stripe Checkout → on payment, Stripe calls `POST /api/stripe/webhook` →
backend verifies **paid + correct amount** → sets `users.guide_unlocked = true`
→ buyer sees Guide + Wizard.

**$120 Setup order**
`Setup page form` → `POST /api/setup/request` → backend inserts into
`setup_requests` (service role) + emails `OPERATOR_EMAIL` → you fulfill it from
**Admin → Setup** (`POST /api/setup/fulfill`), which provisions access for the
chosen tier (180 / 90 days) and clears the stored password.

> If the backend is ever unreachable, the Setup form falls back to opening a
> pre-filled email to you so an order is **never silently lost** (the password
> is intentionally **not** included in that email and is collected securely
> afterward).

---

## 🔒 Security notes

- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  and `RESEND_API_KEY` are **backend-only**. Never put them in a `REACT_APP_*`
  var or commit them.
- `setup_requests` is readable/writable **only by admins** (RLS). The browser
  never inserts into it directly — it goes through the backend service role.
- After you provision a setup account, the buyer's stored password is **cleared**
  from the row on fulfill.

---

## ⚠️ Known limitations / future ideas

- **Guide refunds aren't auto-revoked.** If you refund a $30 guide purchase,
  `guide_unlocked` stays `true`. To revoke manually:
  ```sql
  update public.users set guide_unlocked = false where email = '<buyer-email>';
  ```
  (Auto-revoke on `charge.refunded` can be added later if you want it.)
- **No renewal reminders** for the 180/90-day setup windows yet — track those
  manually for now.
- **Vercel serverless restructure** (step 8) is still pending.

---

## 🛟 Troubleshooting

| Symptom | Likely cause |
|---|---|
| Guide doesn't unlock after paying | Webhook URL wrong / `STRIPE_WEBHOOK_SECRET` mismatch — check Stripe → Webhooks → "Recent deliveries" |
| "Unable to submit request" on Setup | `REACT_APP_API_BASE_URL` not set, or backend not deployed (step 7/8) |
| Can't see Admin → Setup tab | You're not an admin yet — do step 2 |
| No order emails | `RESEND_API_KEY` / domain not verified / `OPERATOR_EMAIL` unset (orders still saved in the table) |
| Buyer can't pay right after sign-up | "Confirm email" is ON in Supabase — see step 3 |

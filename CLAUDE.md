# Outreachly — AI Cold Outreach SaaS

## What this is
A B2B SaaS tool where users create outreach campaigns, import leads, and the AI (Claude API) generates hyper-personalized cold emails. Sequences auto-follow-up. Dashboard shows open/reply rates. Pricing: ₹9,900/₹19,900/₹29,900/mo via Razorpay.


## Tech Stack
| Layer | Tool |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | PostgreSQL via Prisma (hosted on Supabase) |
| Payments | Razorpay (subscriptions) |
| AI | OPENAI API |
| Email delivery | Resend (transactional) + SendGrid (outreach) |
| Background jobs | Trigger.dev |
| Deploy | Vercel |

## Folder Structure
```
src/
  app/
    (auth)/              # Clerk login/signup pages
    (dashboard)/         # All protected routes
      campaigns/         # List + create campaigns
      leads/             # Lead management per campaign
      analytics/         # Stats dashboard
      settings/          # Billing, email accounts
    api/
      campaigns/         # CRUD
      leads/             # CRUD + CSV import
      emails/
        generate/        # Claude API → email generation
        send/            # SendGrid delivery
      webhooks/
        razorpay/        # Razorpay event handler
  components/
    ui/                  # shadcn components (auto-generated)
    campaigns/           # CampaignCard, CampaignForm
    leads/               # LeadTable, LeadImport
    emails/              # EmailPreview, SequenceEditor
  lib/
    prisma.ts            # Prisma client singleton
    razorpay.ts          # Razorpay client + plan config
    openai.ts            # OpenAI client + email generation helpers
    email.ts             # SendGrid/Resend helpers
    utils.ts             # cn() and shared helpers
  middleware.ts          # Clerk auth guard
prisma/
  schema.prisma          # Full DB schema
.env.local               # All secrets (copy from .env.example)
```

## Database Schema (Prisma)
```prisma
model User {
  id            String   @id @default(cuid())
  clerkId       String   @unique
  email         String   @unique
  name          String?
  plan          Plan     @default(FREE)
  campaigns     Campaign[]
  subscription  Subscription?
  createdAt     DateTime @default(now())
}

model Campaign {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id])
  name                String
  targetDescription   String   # "CTOs at Series A SaaS startups"
  status              CampaignStatus @default(DRAFT)
  leads               Lead[]
  sequences           Sequence[]
  createdAt           DateTime @default(now())
}

model Lead {
  id          String   @id @default(cuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id])
  firstName   String
  lastName    String
  email       String
  company     String
  title       String
  linkedinUrl String?
  emailLogs   EmailLog[]
  createdAt   DateTime @default(now())
}

model Sequence {
  id          String   @id @default(cuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id])
  stepNumber  Int
  subject     String
  body        String   @db.Text
  delayDays   Int      @default(0)
  emailLogs   EmailLog[]
}

model EmailLog {
  id          String    @id @default(cuid())
  leadId      String
  lead        Lead      @relation(fields: [leadId], references: [id])
  sequenceId  String
  sequence    Sequence  @relation(fields: [sequenceId], references: [id])
  status      EmailStatus @default(PENDING)
  sentAt      DateTime?
  openedAt    DateTime?
  repliedAt   DateTime?
  createdAt   DateTime  @default(now())
}

model Subscription {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id])
  stripeCustomerId    String   @unique
  stripeSubId         String   @unique
  plan                Plan
  status              String
  currentPeriodEnd    DateTime
}

enum Plan { FREE STARTER GROWTH PRO }
enum CampaignStatus { DRAFT ACTIVE PAUSED COMPLETED }
enum EmailStatus { PENDING SENT OPENED REPLIED BOUNCED }
```

## Pricing Plans
| Plan | Price | Leads/mo | Sender emails |
|---|---|---|---|
| Free | $0 | 50 | 1 |
| Starter | $99 | 500 | 1 |
| Growth | $199 | 2000 | 3 |
| Pro | $299 | Unlimited | 10 |

## Environment Variables (.env.local)
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/campaigns
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/campaigns

# Database (Supabase)
DATABASE_URL=
DIRECT_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_STARTER_PRICE_ID=
STRIPE_GROWTH_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Anthropic
ANTHROPIC_API_KEY=

# SendGrid
SENDGRID_API_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Feature Build Order (work on ONE session at a time)

### PHASE 1 — Foundation ✅ COMPLETE
Next.js app scaffolded at C:\Users\Lenovo\projects\outreachly

### PHASE 2 — Core Setup ✅ COMPLETE
All dependencies installed (Prisma, Clerk, OpenAI, shadcn/ui, Resend, SendGrid, Trigger.dev). Full schema at `prisma/schema.prisma`. Lib files: `src/lib/prisma.ts`, `src/lib/openai.ts`, `src/lib/email.ts`, `src/lib/auth.ts`, `src/lib/razorpay.ts`. Clerk middleware at `src/middleware.ts`. ClerkProvider in `src/app/layout.tsx`.

### PHASE 3 — Auth + Dashboard Shell ✅ COMPLETE
Clerk auth pages at `src/app/(auth)/sign-in` and `sign-up`. Dashboard shell at `src/app/(dashboard)/layout.tsx` with premium dark sidebar (logo, nav groups, upgrade card, user button). Sidebar nav at `src/components/dashboard/sidebar-nav.tsx`. All page routes scaffolded: /campaigns, /leads, /analytics, /settings.

### PHASE 4 — Campaigns + Leads CRUD ✅ COMPLETE
Campaigns: `/campaigns` lists campaigns with stat cards (GET `/api/campaigns`), `/campaigns/new` creates one (POST `/api/campaigns`). Leads: `/leads` shows leads per campaign (GET `/api/leads?campaignId=`), add lead dialog (POST `/api/leads`), CSV import button. Zod validation on all routes. Components: `CampaignCard`, `CampaignForm`, `LeadTable`, `AddLeadDialog`, `ImportLeadsButton`.

### PHASE 5 — AI Email Generation ✅ COMPLETE
`POST /api/emails/generate` calls OpenAI gpt-4o with lead + campaign data, returns 3 email variants. Sequence UI at `/campaigns/[id]/emails` — `SequenceEditor` lists steps, `StepDialog` is a two-column AI generator (Lead Intel Card on left, live email preview with "Generated by AI" chip on right). Sequences stored in `Sequence` table via `GET/POST/PUT/DELETE /api/sequences`.

### PHASE 6 — Email Sending + Sequences ✅ COMPLETE
Manual send endpoint at `POST /api/emails/send` (takes leadId + sequenceId, creates EmailLog, sends via SendGrid, returns SENT or BOUNCED). Campaign activate/pause at `POST /api/campaigns/[id]/activate`. Trigger.dev scheduled job at `src/trigger/send-sequences.ts` (runs every 15 min — walks every ACTIVE campaign, determines next due sequence step per lead based on delayDays, sends via SendGrid, updates EmailLog). SendGrid event webhook at `POST /api/webhooks/sendgrid` (ECDSA signature verification, handles open → OPENED, bounce/dropped → BOUNCED). CampaignCard now has a live Activate/Pause toggle button. New env vars: `SENDGRID_FROM_EMAIL`, `SENDGRID_WEBHOOK_SECRET`, `TRIGGER_PROJECT_ID`, `TRIGGER_SECRET_KEY`. To run jobs locally: `npx trigger dev`.

### PHASE 7 — Razorpay Billing ✅ COMPLETE
`POST /api/razorpay/checkout` creates a Razorpay subscription (12-cycle monthly), stores a "created" Subscription record, returns `subscriptionId` + `keyId` to the frontend. `POST /api/webhooks/razorpay` verifies HMAC-SHA256 signature, handles `subscription.activated/charged` (→ updates Subscription + sets User.plan) and `subscription.cancelled/completed` (→ downgrades to FREE). Settings page (`/settings`) is now a server component that reads the real `user.plan` from DB, highlights the current plan, disables downgrades, and renders a `RazorpayCheckoutButton` client component (loads Razorpay.js dynamically, opens modal, redirects to `/settings?upgraded=1` on success). Both `POST /api/leads` and `POST /api/leads/import` now enforce monthly lead limits per plan (FREE=50, STARTER=500, GROWTH=2000, PRO=unlimited) and return a `PLAN_LIMIT_EXCEEDED` 403 if the user is over quota.

### PHASE 8 — Analytics Dashboard ✅ COMPLETE
`/analytics` is a server component that runs a single `prisma.emailLog.findMany` (scoped to the user's campaigns) and derives all metrics in-memory: leads contacted (distinct lead IDs with a sent log), total emails sent, open rate, reply rate. Chart data is 30 daily buckets built from `sentAt` timestamps. Funnel shows Sent → Opened → Replied with real counts and percentages. Campaign performance table lists every campaign with leads, sent count, open rate bar, and reply rate bar. Recharts `AreaChart` rendered in `src/components/analytics/emails-chart.tsx` (client component). Installed `recharts ^3.8.1`.

### PHASE 9 — Landing Page + Launch ✅ COMPLETE
`src/app/page.tsx` — authenticated users redirect to `/campaigns`; unauthenticated users see the full dark-mode landing page. Sections: fixed glassmorphism navbar, Hero (headline, badge, product preview mockup of the AI generator UI), Trust bar (4 stats), Features (3 cards), How It Works (3 steps), Pricing (4 tier cards — Free/Starter/Growth/Pro with ₹ pricing, highlight on Growth), Testimonials (3 placeholder cards with star ratings), CTA banner, Footer. All CTAs link to `/sign-up`. `src/app/opengraph-image.tsx` uses Next.js `ImageResponse` (edge runtime) for social sharing preview.

---

## Key Decisions Made
- Using Clerk over NextAuth: saves 2-3 days, handles orgs/sessions/webhooks
- Using Supabase for Postgres: free tier, good DX, built-in connection pooling
- Using OpenAI API for email gen (gpt-4o)
- Using Razorpay over Stripe: Stripe is invite-only in India; Razorpay supports INR subscriptions natively
- App Router only: no Pages Router, no mixing
- All routes under (dashboard) are protected by Clerk middleware

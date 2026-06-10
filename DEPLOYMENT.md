# NTU Past Papers Archive — Deployment Guide

## Environment Variables

Copy `.env.example` to `.env.local` for local development.
Set all variables in Vercel dashboard for production.

```env
# .env.example

# Supabase (get from Supabase dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...   # NEVER expose to client

# reCAPTCHA v3 (get from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...

# File upload config
MAX_UPLOAD_SIZE_MB=20
```

---

## Step 1 — Create Supabase Project

1. Go to https://supabase.com → New project
2. Choose region closest to Pakistan (Singapore/Mumbai)
3. Save the database password securely

---

## Step 2 — Run Migrations

In Supabase SQL Editor, run:

```
supabase/migrations/001_initial_schema.sql
```

Or using Supabase CLI:
```bash
npx supabase db push
```

---

## Step 3 — Create Storage Buckets

In Supabase Dashboard → Storage → New bucket:

### Bucket 1: `papers` (Private)
- Private bucket (no public access)
- Max file size: 20MB
- Allowed MIME types: application/pdf, image/jpeg, image/png, application/vnd.openxmlformats-officedocument.wordprocessingml.document

### Bucket 2: Storage Policies

Run in SQL Editor:

```sql
-- Allow service role full access (used by API routes)
CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Allow anon read on approved papers path
CREATE POLICY "Public read approved papers"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'papers' AND name LIKE 'approved/%');
```

---

## Step 4 — Create Admin User

In Supabase Dashboard → Authentication → Users → Invite user

Use an email you control (admin@yourdomain.com). The user will get an invite email.

---

## Step 5 — Install Dependencies

```bash
npx create-next-app@latest ntu-past-papers --typescript --tailwind --app
cd ntu-past-papers

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install uuid
npm install lucide-react

# shadcn/ui setup
npx shadcn@latest init
npx shadcn@latest add button card input label select badge alert dialog alert-dialog table

# Dev
npm install -D @types/uuid
```

---

## Step 6 — Project Structure

Create files as per ARCHITECTURE.md.

Copy all generated source files into place.

---

## Step 7 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY
vercel env add RECAPTCHA_SECRET_KEY
vercel env add MAX_UPLOAD_SIZE_MB

# Production deploy
vercel --prod
```

---

## Step 8 — Post-Deployment Checklist

- [ ] Test contribute form with a real roll number
- [ ] Confirm department auto-detection works
- [ ] Submit a test paper → verify pending status in admin
- [ ] Log in to admin panel → approve test paper
- [ ] Verify paper appears on public /papers page
- [ ] Test PDF viewer
- [ ] Test download
- [ ] Verify leaderboard updates after approval
- [ ] Test duplicate submission prevention
- [ ] Verify rate limiting works (submit 6 times quickly)
- [ ] Check reCAPTCHA is rejecting bots
- [ ] Test on mobile viewport

---

## Scaling Considerations

### For 10,000+ students:
- Database indexes are already in place (see migration)
- Use Vercel Edge Functions for API routes that need low latency
- Enable Supabase connection pooling (PgBouncer) in project settings

### For 100,000+ downloads:
- Supabase Storage is backed by S3 — scales automatically
- Enable Vercel CDN caching on API routes (already set with Cache-Control headers)
- Consider Cloudflare in front of Vercel for additional edge caching

### For tens of thousands of papers:
- The `v_papers_public` view + indexes handle this well
- Add full-text search with `pg_trgm` (already enabled in migration)
- Consider adding Redis (Upstash) for rate limiting at scale

### Optional upgrades:
- Replace in-memory rate limiter with Upstash Redis
- Add Cloudflare Turnstile instead of reCAPTCHA
- Add email notifications to admin on new submissions (Resend/Nodemailer)
- Add Sentry for error tracking

---

## Admin Panel Routes

| Route | Description |
|-------|-------------|
| `/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/departments` | Manage departments |
| `/admin/teachers` | Manage teachers |
| `/admin/subjects` | Manage subjects |
| `/admin/pending` | Review pending papers |
| `/admin/approved` | Browse approved papers |
| `/admin/rejected` | Browse rejected papers |
| `/admin/contributors` | Search contributors |
| `/admin/leaderboard` | Leaderboard view |

## Public Routes

| Route | Description |
|-------|-------------|
| `/papers` | Browse & filter all papers |
| `/contribute` | Submit a paper |
| `/leaderboard` | Top contributors |
| `/contributors/[rollNumber]` | Contributor profile |

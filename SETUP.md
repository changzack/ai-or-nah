# AI or Nah - Setup Guide

This guide walks through setting up the AI or Nah project for local development.

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- A Supabase account (free tier works)
- Hive Moderation API key (to be obtained in Step 4)
- Apify API token (to be obtained in Step 3)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Supabase Setup

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to finish initializing

### 2.2 Run Database Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the migrations in order:
   - Copy contents of `supabase/migrations/001_init.sql`
   - Paste and execute
   - Copy contents of `supabase/migrations/002_functions.sql`
   - Paste and execute

### 2.3 Create Storage Bucket

Follow the instructions in `supabase/STORAGE_SETUP.md` to create the `instagram-images` bucket.

### 2.4 Get API Keys

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following:
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` key → SUPABASE_SERVICE_ROLE_KEY

## Step 3: Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Leave API keys as placeholders for now (will be added in later steps):
   ```env
   HIVE_API_KEY=your_hive_api_key
   APIFY_API_TOKEN=your_apify_token
   ```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification Checklist

After completing setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] Database tables exist in Supabase dashboard (results, result_images, ip_rate_limits)
- [ ] Storage bucket `instagram-images` is created and public
- [ ] Environment variables are set in `.env.local`
- [ ] `.env.local` is in `.gitignore` (should already be)

## Project Structure Overview

```
ai-or-nah/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Landing page (to be built in Step 2)
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── lib/                         # Shared utilities
│   ├── constants.ts             # App constants and thresholds
│   ├── types.ts                 # TypeScript types
│   ├── username.ts              # Username parsing/validation
│   ├── utils.ts                 # Utility functions
│   ├── db/                      # Database operations
│   │   ├── results.ts          # Results CRUD
│   │   ├── images.ts           # Image references CRUD
│   │   └── rate-limit.ts       # Rate limiting logic
│   ├── storage/                # Supabase Storage operations
│   │   └── images.ts           # Image upload/delete
│   ├── integrations/           # External API integrations
│   │   ├── apify.ts            # Instagram scraping (stub)
│   │   └── hive.ts             # AI detection (stub)
│   └── supabase/               # Supabase clients
│       ├── client.ts           # Browser client
│       └── server.ts           # Server client
├── supabase/                   # Database migrations
│   ├── migrations/
│   │   ├── 001_init.sql       # Initial schema
│   │   └── 002_functions.sql  # SQL functions
│   └── STORAGE_SETUP.md       # Storage configuration guide
├── .env.example                # Environment variables template
└── .env.local                  # Your local environment (git-ignored)
```

## Next Steps

Once setup is complete, proceed to:
- **Step 2:** Build the landing page (app/page.tsx)
- **Step 3:** Implement Apify Instagram scraping
- **Step 4:** Implement Hive AI detection
- **Step 5:** Build results page
- And so on...

## Troubleshooting

### Database connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that migrations have been run

### Storage errors
- Verify `instagram-images` bucket exists
- Verify bucket is set to public
- Verify storage policies are applied

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Restart your IDE/editor

## Support

For issues or questions, refer to:
- [README.md](./README.md) for project overview
- [PRD.md](./PRD.md) for detailed requirements
- [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md) for design specs

AIorNah Readme.md


# AI or Nah

A mobile-first web application that helps users verify whether Instagram accounts feature real people or AI-generated models. Built to combat the growing problem of fake AI Instagram accounts creating OnlyFans scams.

**Live URL:** [aiornah.ai](https://aiornah.ai) *(coming soon)*

## Overview

AI or Nah analyzes Instagram accounts and provides an AI likelihood score with an entertaining, detailed breakdown. Users can quickly verify suspicious accounts before engaging or sending money, with results optimized for sharing.

**Target Users:** Men (18-50) who encounter suspicious Instagram accounts and want quick verification.

**Key Features:**
- Single username lookup with instant results
- AI image detection + profile pattern analysis
- Playful, shareable results pages
- Cached results for viral sharing
- Mobile-only experience (MVP)

## Documentation

- **[Product Requirements Document](./PRD.md)** - Complete feature specifications, user flows, and technical requirements
- **[Brand Guidelines](./BRAND_GUIDELINES.md)** - Visual design system, color palette, typography, and component specs

## Tech Stack

- **Frontend:** Next.js (React-based, mobile-first)
- **Scraping:** Apify Instagram Profile Scraper (handles proxies and anti-detection)
- **AI Detection:** Hive Moderation API
- **Database:** Supabase (PostgreSQL)
- **Image Storage:** Supabase Storage
- **Hosting:** Vercel

## Project Structure
```
ai-or-nah/
├── README.md                 # This file
├── PRD.md                    # Product requirements
├── BRAND_GUIDELINES.md       # Design system
├── app/
│   ├── page.tsx             # Landing page
│   ├── check/[username]/
│   │   └── page.tsx         # Results page
│   ├── api/
│   │   ├── analyze/         # Analysis endpoint
│   │   └── check/           # Cache lookup endpoint
│   └── layout.tsx           # Root layout
├── components/              # React components
├── lib/
│   ├── apify.ts            # Apify scraper integration
│   ├── hive.ts             # Hive API integration
│   ├── supabase.ts         # Database client
│   └── utils.ts            # Helper functions
├── public/                  # Static assets
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Hive Moderation API key
- Apify API token (free tier available)
- Supabase project (free tier available)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd ai-or-nah

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys and config to .env.local

# Run development server
npm run dev
```

### Environment Variables
```
HIVE_API_KEY=your_hive_api_key
APIFY_API_TOKEN=your_apify_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development Workflow

1. **Phase 1 - MVP Core Features:**
   - Project setup (Next.js, Supabase, environment configuration)
   - Landing page with username input
   - Apify Instagram scraping integration
   - Hive API integration for image analysis
   - Results page with playful breakdown
   - Database caching (Supabase)
   - Rate limiting (3 checks per IP per day)
   - Share functionality + OG meta tags
   - Desktop QR code experience
   - Image storage (Supabase Storage)

2. **Phase 2 - Post-MVP:**
   - Analytics tracking integration
   - Browse/trending section
   - Admin dashboard
   - Community features
   - Data refresh strategy

## Key Constraints

- **Mobile-only:** Desktop shows "mobile only" message
- **No user accounts:** Anonymous usage with IP-based rate limiting
- **Rate limits:** 3 fresh checks per IP per day, unlimited cached views
- **Image storage:** Download and host images, auto-delete after 90 days of inactivity
- **Legal:** Entertainment purposes disclaimer, Terms of Service

## API Integrations

### Hive Moderation API
- **Purpose:** AI image detection
- **Endpoint:** `POST /api/v2/task/sync`
- **Cost:** ~$0.001-0.002 per image
- **Response:** AI probability score (0-1)

### Apify Instagram Profile Scraper
- **Purpose:** Instagram profile data extraction
- **Data:** Profile info, last 9 image posts, captions, engagement metrics
- **Cost:** Free tier ~250-500 profiles/month, then ~$0.01-0.02/profile
- **Advantage:** Handles proxies, anti-detection, and maintenance automatically

## Success Metrics

**MVP Success (Qualitative):**
- Personal validation: Creator uses it 10+ times and finds it useful
- Small group validation: 5+ friends use it and report value
- Organic traction: 100+ searches from strangers
- Viral indicator: At least one shared result gets reshared

**Post-MVP Metrics (with analytics integration):**
- % of searches that are shared
- Average searches per user
- Cache hit rate
- Scraping failure rate

## Design Principles

- **75% Entertainment, 25% Trust**
- **Personality in copy, professionalism in design**
- **Native app feel** - card-based layouts, bottom-anchored CTAs
- **Thumb-friendly** - large tap targets, one-handed navigation
- **"Robinhood meets Apple Health"** aesthetic

## Contributing

This is currently a solo MVP project. Contributions may be opened after initial launch.

## License

[To be determined]

## Contact

For questions or feedback: [contact information]

---

**Built with Claude Code** 🤖
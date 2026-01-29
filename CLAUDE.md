# AI or Nah - Claude Code Instructions

## Project Context
AI or Nah is a mobile-first web tool that verifies whether Instagram accounts feature real people or AI-generated models.

## Planning System

This project uses a **three-tier planning system**:

### 1. Product Requirements (`PRD.md`)
- **What:** Full product spec, features, user flows, technical requirements
- **Maintained by:** Claude (update when scope/requirements change during discussion)
- **Purpose:** Source of truth for what we're building and why

### 2. Project Status (`PROJECT_PLAN.md`)
- **What:** Current phase, completed work, in-progress tasks, upcoming priorities
- **Maintained by:** Claude (update after completing phases/features)
- **Purpose:** Track implementation progress across sessions

### 3. Detailed Implementation (Claude Plan Mode)
- **What:** Specific files to modify, code patterns, step-by-step implementation
- **Maintained by:** Claude (generated fresh each session)
- **Purpose:** Tactical execution, always current with codebase state

### Workflow
1. **At session start:** Read `PRD.md` for product context, then `PROJECT_PLAN.md` for current status
2. **For implementation tasks:** Enter plan mode to generate detailed working plans
3. **After completing work:** Update `PROJECT_PLAN.md` to reflect progress
4. **When scope changes:** Update `PRD.md` to capture new/changed requirements

### Why This Works
- PRD stays clean as the product spec (doesn't get cluttered with status)
- Project plan tracks progress without needing granular implementation details
- Detailed plans are generated fresh, always accurate to current codebase
- Claude doesn't need to maintain implementation details - regenerating is cheap

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Animations:** Framer Motion
- **APIs:** Apify (Instagram scraping), Hive (AI detection)
- **Hosting:** Vercel

## Code Conventions
- Mobile-first responsive design (base styles for mobile, then md:, lg:, xl:)
- Use Framer Motion for animations
- Components in `/components`, organized by feature (e.g., `/components/results/`)
- API routes in `/app/api/`
- Utility functions in `/lib/`

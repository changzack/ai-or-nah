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

## Analytics Instrumentation (Amplitude)

**IMPORTANT:** When implementing new features, pages, or user interactions, you MUST consider and implement appropriate analytics events. This is a default requirement for all development work.

### Tracking Plan Maintenance (REQUIRED)

`/docs/TRACKING_PLAN.md` is the **source of truth** for all analytics events. You MUST update this file whenever you:
- **Add** a new analytics event
- **Modify** an existing event (name, properties, trigger conditions)
- **Remove** an event that is no longer used

Update the tracking plan **in the same commit** as the code change to keep them in sync.

### When to Add Events

Add analytics events for:
- **Page views** - Track when users land on new pages/routes
- **User actions** - Button clicks, form submissions, interactions
- **Funnel steps** - Any action that moves users through conversion flows
- **Feature usage** - When users engage with specific features
- **Errors** - Failed operations, API errors, validation failures
- **State changes** - Auth state, purchase completions, significant UI changes

### Event Naming Convention

Use **Title Case** with **Verb + Noun** pattern:
```
✓ "Viewed Home"
✓ "Submitted Username"
✓ "Completed Purchase"
✓ "Clicked Share Button"
✗ "home_page_view"
✗ "submitUsername"
```

### Property Naming Convention

Use **camelCase** for all event and user properties:
```typescript
amplitude.track('Submitted Username', {
  username: 'example_user',
  isLoggedIn: true,
  checkCount: 3,
  source: 'homepage'
});
```

### Implementation Pattern

Analytics utility location: `/lib/analytics.ts`

```typescript
// Always use the centralized track function
import { track } from '@/lib/analytics';

// In components/pages:
track('Event Name', { property: 'value' });
```

### Standard Properties

Include these properties when relevant:
- `source` - Where the action originated (e.g., 'homepage', 'results_page')
- `username` - The Instagram username being checked (when applicable)
- `isLoggedIn` - User's auth state
- `hasCredits` - Whether user has remaining credits

### Identity Management

- Anonymous users: Amplitude auto-generates device ID
- On auth: Call `identify()` with user email to merge sessions
- User properties to set on auth: `email`, `authProvider`, `createdAt`

### Reference: Tracking Plan

See `/docs/TRACKING_PLAN.md` for the complete list of events, properties, and implementation notes.

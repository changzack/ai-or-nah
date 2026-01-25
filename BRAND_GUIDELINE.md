AiorNah Brand Guidelines


# AI or Nah - Brand Design Guidelines

**Version:** 1.0  
**Last Updated:** January 25, 2026  
**Purpose:** Visual design system for Claude Code implementation

---

## Brand Essence

### Core Identity
**Product Name:** AI or Nah  
**Domain:** aiornah.ai  
**Tagline:** "Check if your IG crush is real"

### Brand Positioning
- **Primary emotion:** Entertainment (75%) with Trust (25%)
- **Tone:** Playful, casual, approachable but credible
- **Voice:** Knowledgeable friend giving you straight talk - not corporate, not meme page
- **Target balance:** Modern enough for 25-year-olds to share, credible enough for 45-year-olds to trust

### Key Principle
**Personality in copy, professionalism in design.** The words can be playful ("Skin smoother than a Snapchat filter"), but the design stays clean and clear.

---

## Color Palette

### Primary Colors

**Brand Primary: Deep Purple/Indigo**
- `#6366F1` (Indigo-500) - Main brand color
- `#7C3AED` (Purple-600) - Alternative primary
- Usage: Primary buttons, key UI elements, percentage scores, brand accents
- Why: Modern, tech-forward, credible but not corporate, works across age groups

**Background: Soft White**
- `#FAFAFA` (Gray-50) - Primary background
- `#F9FAFB` (Gray-100) - Alternative background
- `#FFFFFF` - Pure white for cards
- Usage: Page backgrounds, card backgrounds
- Why: Clean, legible, app-like, doesn't strain eyes

**Accent/CTA: Warm Orange/Coral**
- `#F97316` (Orange-500) - Primary CTA color
- `#FB923C` (Orange-400) - Hover/light variant
- Usage: Primary action buttons (Share, Submit), interactive elements
- Why: Warm, inviting, action-oriented, not too young or boring

### Semantic Colors

**AI/Fake Indicator: Bold Red**
- `#EF4444` (Red-500) - High AI likelihood
- `#DC2626` (Red-600) - Darker variant
- Usage: "Almost Definitely Fake" verdicts, ❌ red flags, warning states
- Why: Clear warning without being alarming

**Real Indicator: Green**
- `#10B981` (Green-500) - Low AI likelihood
- `#059669` (Green-600) - Darker variant
- Usage: "Probably Real" verdicts, ✅ positive indicators
- Why: Reassuring, positive, trustworthy

**Unclear/Mixed: Amber**
- `#F59E0B` (Amber-500) - Medium AI likelihood
- `#D97706` (Amber-600) - Darker variant
- Usage: "Hard to Tell" verdicts, 🤔 unclear states
- Why: Caution without judgment

### Text Colors

**Primary Text**
- `#1F2937` (Gray-800) - Main body text
- `#111827` (Gray-900) - Headings, emphasis
- Why: Easier to read than pure black, professional

**Secondary Text**
- `#6B7280` (Gray-500) - Supporting text, metadata
- Usage: "Last checked: 3 days ago", timestamps, labels
- Why: Clear hierarchy without disappearing

### Gradients

**Background Gradients (Subtle)**
- Light purple to light blue: `linear-gradient(135deg, #F3F4F6 0%, #E0E7FF 100%)`
- Soft gradient behind hero sections or cards
- Keep subtle - 5-10% opacity maximum
- Usage: Landing page background, results page header background

**Button Gradients (Optional)**
- Primary CTA: `linear-gradient(135deg, #F97316 0%, #FB923C 100%)`
- Keep subtle, mainly for hover states

**Card Gradients (Very Subtle)**
- White to off-white: `linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)`
- Adds depth without being obvious

---

## Typography

### Font Family

**Primary Font: Inter or DM Sans**
- Modern sans-serif with personality but professional
- Clean, highly legible across all sizes
- Works well on mobile screens
- Not too playful (avoid Poppins, Quicksand)
- Fallback: System UI fonts (-apple-system, BlinkMacSystemFont, "Segoe UI")

### Font Weights

- **Bold (700):** Verdicts, primary headings, key numbers
- **Semi-Bold (600):** Section headings, emphasis
- **Medium (500):** Button text, labels
- **Regular (400):** Body copy, standard text

### Font Sizes (Mobile-First)

**Display/Hero Text:**
- AI Percentage: `64px` - `72px` (bold)
- Verdict Statement: `28px` - `32px` (bold)

**Headings:**
- H1 (Page Title): `32px` (bold)
- H2 (Section Headers): `24px` (semi-bold)
- H3 (Subsections): `20px` (semi-bold)

**Body Text:**
- Primary: `16px` (regular) - Minimum for readability
- Secondary: `14px` (regular) - Metadata, timestamps
- Small: `12px` (medium) - Labels, fine print

**Buttons:**
- Primary CTA: `18px` (medium/semi-bold)
- Secondary: `16px` (medium)

### Line Height
- Headings: 1.2-1.3
- Body text: 1.5-1.6
- Generous spacing for readability across ages

---

## Visual Style

### Design Philosophy

**Native App Feel, Not Website**
- Card-based layouts
- Bottom-anchored primary actions (thumb-reach)
- Smooth page transitions
- Feels like an installed app, not a browser page

**Clean But Not Clinical**
- Professional execution with personality
- Strategic use of emoji (🤖✅❌⚠️🤔)
- Playful copy in clean containers
- Modern but not trendy

### Layout Principles

**1. Generous Whitespace**
- Not cramped or overwhelming
- Easy to scan
- Clear breathing room between sections

**2. Card-Based Design**
- Results sections in distinct cards
- Subtle shadows for elevation
- Clear content grouping

**3. Progressive Disclosure**
- Most important info first (verdict at top)
- Details follow in scannable sections
- Clear visual hierarchy

**4. Thumb-Friendly Mobile UX**
- Large tap targets (minimum 48px height)
- Primary actions at bottom of screen
- One-handed navigation optimized
- Swipe gestures where appropriate

### Component Styles

**Buttons:**
- Border radius: `8px` - `12px` (slightly rounded, not pill-shaped)
- Height: Minimum `48px` for touch targets
- Padding: `16px` horizontal
- Shadow: Subtle on primary buttons
- States: Clear hover/active states with subtle transitions

**Primary Button (CTA):**
- Background: Orange gradient `#F97316`
- Text: White, semi-bold
- Full-width on mobile
- Slight shadow for elevation

**Secondary Button:**
- Background: Transparent or light gray
- Border: 1px solid gray
- Text: Dark gray, medium weight

**Cards:**
- Border radius: `12px` - `16px`
- Background: White `#FFFFFF`
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`
- Padding: `20px` - `24px`
- Clear separation between sections

**Icons:**
- Mix of emoji + simple line icons
- Emoji for personality: 🤖✅❌⚠️🤔📸👤🎯💡
- Line icons for UI: Share, back button, navigation
- Size: 24px - 32px for emoji in headings

**Loading States:**
- Smooth skeleton screens or spinners
- Use brand purple color
- Professional animations (not gimmicky)
- Progress text: "Fetching profile...", "Analyzing images..."

**Animations:**
- Smooth, subtle (200-300ms transitions)
- Fade-ins for content
- Slide-up for modals/sheets
- Native-feeling page transitions
- No jarring or distracting animations

---

## Layout Structure

### Results Page Visual Hierarchy
```
┌─────────────────────────────┐
│   [← Back]                  │  ← Minimal top nav
│                             │
│   ┌───────────────────────┐ │
│   │                       │ │
│   │        87%            │ │  ← Huge percentage (64px+)
│   │                       │ │     Brand purple color
│   │   🤖 Almost           │ │  ← Large verdict (28px)
│   │   Definitely Fake     │ │     Color-coded by result
│   │                       │ │
│   └───────────────────────┘ │  Hero card with subtle gradient
│                             │
│   ┌───────────────────────┐ │
│   │ 📸 THE IMAGES         │ │  ← Section card
│   │                       │ │     Icon + heading (24px)
│   │ ❌ Skin smoother than │ │  ← Red X + playful copy
│   │    a Snapchat filter  │ │     16px body text
│   │                       │ │
│   │ ❌ Impossible shadows │ │  ← Multiple red flags
│   │                       │ │
│   │ ✅ Hands look normal  │ │  ← Green check for positives
│   │                       │ │
│   │ [Image thumbnails]    │ │  ← 3x3 grid of analyzed images
│   │                       │ │
│   │ Analyzed 9 images     │ │  ← Metadata (14px, gray)
│   └───────────────────────┘ │
│                             │
│   ┌───────────────────────┐ │
│   │ 👤 THE PROFILE        │ │  ← Another section card
│   │                       │ │
│   │ ❌ 52K followers      │ │  ← Factual red flags
│   │    in 2 months        │ │
│   │                       │ │
│   │ ❌ Posts daily at 9am │ │
│   │                       │ │
│   │ ❌ Every caption:     │ │
│   │    "Hey guys 💕"      │ │
│   └───────────────────────┘ │
│                             │
│   ┌───────────────────────┐ │
│   │ 🎯 THE PATTERN        │ │  ← Consistency section
│   │                       │ │
│   │ ❌ All photos         │ │
│   │    scored 80%+ AI     │ │
│   └───────────────────────┘ │
│                             │
│   ┌───────────────────────┐ │
│   │ 💡 BOTTOM LINE        │ │  ← Clear guidance card
│   │                       │ │
│   │ This is AI-generated. │ │  ← Direct language
│   │ Don't send money.     │ │     18px, semi-bold
│   └───────────────────────┘ │
│                             │
│   ┌───────────────────────┐ │
│   │ 🚩 Red flags to       │ │  ← Educational card
│   │    spot yourself:     │ │
│   │                       │ │
│   │ • Perfect skin        │ │  ← Bullet points
│   │ • Identical face      │ │     14px-16px
│   │ • Generic captions    │ │
│   └───────────────────────┘ │
│                             │
│   Last checked: 3 days ago  │  ← Small timestamp (12px gray)
│                             │
│  ┌─────────────────────────┐│
│  │   Share This Result 📤  ││  ← Primary CTA
│  └─────────────────────────┘│     Orange, full-width
│                             │     48px height
│                             │
│     Check Another Account   │  ← Secondary action
│                             │     Text link or ghost button
│                             │
└─────────────────────────────┘
```

### Landing Page Structure
```
┌─────────────────────────────┐
│                             │
│   AI or Nah                 │  ← Logo/wordmark (32px)
│                             │
│                             │
│   Check if your IG          │  ← Headline (28px bold)
│   crush is real             │
│                             │
│   Find out in 30 seconds    │  ← Subheadline (18px)
│                             │
│  ┌─────────────────────────┐│
│  │  @username or URL       ││  ← Input field
│  └─────────────────────────┘│     48px height, rounded
│                             │
│  ┌─────────────────────────┐│
│  │     Check Account       ││  ← Primary CTA
│  └─────────────────────────┘│     Orange, bold
│                             │
│                             │
│   Don't get catfished.      │  ← Supporting copy (14px)
│   Verify before you slide   │
│   into DMs.                 │
│                             │
└─────────────────────────────┘
```

---

## Design References

### Visual Inspiration
Study these for balanced, credible-but-friendly design:

**Primary References:**
- **Robinhood app** - Serious subject (money) with approachable interface
- **Apple Health app** - Native feel, clean, trustworthy, works across ages
- **Stripe** - Professional but approachable, clean but not boring
- **Notion** - Modern, friendly interface that works across demographics

**Avoid These Styles:**
- BeReal (too Gen Z)
- TikTok UI (too young, too chaotic)
- Duolingo (too gamified/playful)
- Brutalist designs (too harsh)

### The Sweet Spot
**"Robinhood meets Apple Health"** - Clean, modern, professional execution with just enough personality to not feel corporate.

---

## Component Specifications

### Verdict Display (Critical Component)

**Visual Treatment:**
- Large container with subtle background gradient
- Centered content
- Clear visual hierarchy

**Percentage Number:**
- Size: 64px - 72px
- Weight: Bold (700)
- Color: Varies by verdict:
  - 0-30%: Green `#10B981`
  - 31-60%: Amber `#F59E0B`
  - 61-80%: Orange `#F97316`
  - 81-100%: Red `#EF4444`

**Verdict Text:**
- Size: 28px - 32px
- Weight: Bold (700)
- Color: Dark gray `#1F2937`
- Includes emoji: 🤖 ⚠️ 🤔 ✅

**Verdict Options:**
- **0-30%:** "✅ Probably Real"
- **31-60%:** "🤔 Hard to Tell"
- **61-80%:** "⚠️ Likely Fake"
- **81-100%:** "🤖 Almost Definitely Fake"

### Section Cards

**Structure:**
- White background `#FFFFFF`
- Border radius: 12px - 16px
- Padding: 20px - 24px
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`
- Margin between cards: 16px

**Section Header:**
- Emoji + text (e.g., "📸 THE IMAGES")
- Size: 20px - 24px
- Weight: Semi-bold (600)
- Color: Dark gray `#1F2937`
- Margin bottom: 12px

**Section Content:**
- Red flags with ❌ or ✅ emoji
- Body text: 16px regular
- Line spacing: 1.5
- Clear visual separation between items

### Red Flag List Items

**Structure:**
```
❌ Skin smoother than a Snapchat filter
```

**Styling:**
- Emoji (❌ or ✅): 20px - 24px
- Text: 16px regular
- Color: Dark gray for text
- Spacing: 8px - 12px between items
- Left-aligned with emoji as visual indicator

### Image Grid

**Layout:**
- 3x3 grid of thumbnails
- Equal spacing (8px - 12px gaps)
- Rounded corners on images (8px)
- Aspect ratio: Square (1:1)
- Tap to expand (optional for MVP)

**Below Grid:**
- Metadata text: "Analyzed 9 images"
- Size: 14px
- Color: Gray `#6B7280`
- Center-aligned under grid

### Share Button

**Primary CTA Styling:**
- Background: Orange `#F97316` with subtle gradient
- Text: "Share This Result 📤"
- Color: White
- Size: 18px semi-bold
- Height: 48px minimum
- Border radius: 8px - 12px
- Full-width on mobile
- Shadow: `0 2px 4px rgba(249, 115, 22, 0.2)`

**Interaction:**
- Hover: Slightly darker orange
- Active: Pressed state with subtle scale
- Opens native mobile share sheet

### Loading States

**Progress Animation:**
- Brand purple spinner or skeleton screen
- Progress text updates:
  - "Fetching profile..."
  - "Analyzing images..."
  - "Calculating score..."
- Text: 16px regular, gray
- Center-aligned
- Smooth transitions between states

---

## Spacing & Layout

### Spacing Scale
- `4px` - Tiny (inline spacing)
- `8px` - Small (list items, tight groupings)
- `12px` - Medium (between related elements)
- `16px` - Default (between sections)
- `24px` - Large (between major sections)
- `32px` - Extra large (page margins)

### Container Widths
- Mobile: 100% with 16px - 20px side padding
- Max-width: 480px (centered on tablet/desktop)
- Cards: Full-width within container

### Responsive Breakpoints
- Mobile-first design (primary)
- Desktop (>768px): Show "Mobile only" message
- No tablet/desktop layout in MVP

---

## Accessibility

### Minimum Requirements
- Color contrast ratio: 4.5:1 for body text
- Touch targets: 48px minimum height/width
- Focus states: Visible outline on interactive elements
- Alt text: Descriptive text for all images
- Semantic HTML: Proper heading hierarchy

### Readability
- Minimum font size: 16px for body text
- Line height: 1.5 - 1.6 for body text
- Clear visual hierarchy
- High contrast text on backgrounds

---

## Implementation Notes

### Technical Considerations

**Mobile-First:**
- Build for mobile viewport (320px - 480px) first
- Test on actual devices, not just browser dev tools
- Optimize for one-handed use

**Performance:**
- Optimize images (WebP format, lazy loading)
- Minimize animation weight
- Fast page transitions

**Progressive Enhancement:**
- Core functionality works without JavaScript
- Enhance with smooth animations where supported
- Native share API with clipboard fallback

### CSS Framework Considerations
- Use Tailwind CSS for rapid development (optional)
- Or vanilla CSS with CSS variables for colors
- Consistent spacing using scale above

---

## Brand Voice in Design

### Copy Tone on UI Elements

**Playful but Clear:**
- ✅ "Skin smoother than a Snapchat filter"
- ✅ "52K followers in 2 months? Sure, Jan."
- ❌ Don't: "Detected anomalous dermatological smoothing patterns"

**Direct but Not Harsh:**
- ✅ "This is AI-generated. Don't send money."
- ❌ Don't: "You're being scammed, idiot"
- ❌ Don't: "Potentially synthetic imagery detected"

**Confident but Honest:**
- ✅ "Almost Definitely Fake (87%)"
- ✅ "Hard to Tell (52%)" with caveat
- ❌ Don't: "Definitely 100% confirmed fake"

---

## Design System Summary

### At a Glance

**Colors:**
- Primary: Purple/Indigo `#6366F1`
- CTA: Orange `#F97316`
- Background: White `#FAFAFA`
- Success: Green `#10B981`
- Warning: Red `#EF4444`

**Typography:**
- Font: Inter or DM Sans
- Sizes: 64px (hero), 28px (headings), 16px (body)
- Weights: Bold, Semi-bold, Regular

**Layout:**
- Card-based design
- 12-16px border radius
- Generous whitespace
- Bottom-anchored CTAs

**Style:**
- Native app feel
- Subtle gradients
- Clean but personable
- Professional execution, playful copy

**Vibe:**
- 75% Entertainment, 25% Trust
- Works for 25-50 age range
- "Robinhood meets Apple Health"
- Knowledgeable friend, not corporate tool

---

**End of Brand Guidelines**
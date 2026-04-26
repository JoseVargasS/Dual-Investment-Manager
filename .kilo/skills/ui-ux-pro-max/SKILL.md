---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
license: Complete terms in LICENSE.txt
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web and mobile applications. Contains 50+ styles, 161 color palettes, 57 font pairings, 161 product types with reasoning rules, 99 UX guidelines, and 25 chart types across 10 technology stacks. Searchable database with priority-based recommendations.

The scripts for this skill are located at `.kilo/skills/ui-ux-pro-max/scripts/search.py`

## When to Apply

This Skill should be used when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**.

### Must Use

This Skill must be invoked in the following situations:

- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts, etc.)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for user experience, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making product-level design decisions (style, information hierarchy, brand expression)
- Improving perceived quality, clarity, or usability of interfaces

### Recommended

This Skill is recommended in the following situations:

- UI looks "not professional enough" but the reason is unclear
- Receiving feedback on usability or experience
- Pre-launch UI quality optimization
- Aligning cross-platform design (Web / iOS / Android)
- Building design systems or reusable component libraries

### Skip

This Skill is not needed in the following situations:

- Pure backend logic development
- Only involving API or database design
- Performance optimization unrelated to the interface
- Infrastructure or DevOps work
- Non-visual scripts or automation tasks

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed on Windows:
```powershell
winget install Python.Python.3.12
```

## How to Use This Skill

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: Entertainment, Tool, Productivity, or hybrid
- **Target audience**: C-end consumer users; consider age group, usage context
- **Style keywords**: playful, vibrant, minimal, dark mode, content-first, immersive, etc.
- **Stack**: The project's tech stack

### Step 2: Generate Design System (REQUIRED)

Always start with `--design-system` to get comprehensive recommendations:

```bash
python3 .kilo/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This searches domains in parallel (product, style, color, landing, typography), applies reasoning rules, and returns a complete design system.

### Step 3: Supplement with Detailed Searches (as needed)

```bash
python3 .kilo/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**Available domains:** product, style, color, typography, chart, landing, ux, google-fonts, react, web, icons, prompt

### Step 4: Stack Guidelines

```bash
python3 .kilo/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack>
```

**Available stacks:** react, nextjs, vue, svelte, astro, swiftui, react-native, flutter, nuxtjs, nuxt-ui, html-tailwind, shadcn, jetpack-compose, threejs, angular, laravel

## Common Rules for Professional UI

### Icons & Visual Elements
- **No Emoji as Structural Icons** — Use vector-based icons (Lucide, Heroicons)
- **Vector-Only Assets** — SVG or platform vector icons
- **Stable Interaction States** — No layout-shifting transforms
- **Consistent Icon Sizing** — Define as design tokens
- **Stroke Consistency** — Same stroke width within same layer
- **Touch Target Minimum** — 44×44pt (iOS) / 48×48dp (Android)
- **Icon Contrast** — WCAG 4.5:1 minimum

### Interaction (App)
- **Tap feedback** within 80-150ms
- **Animation timing** 150-300ms
- **Touch targets** >=44×44pt
- **Disabled states** visually clear and non-interactive
- **Gesture conflict prevention** — one primary gesture per region

### Light/Dark Mode Contrast
- **Surface readability** — clear separation from background
- **Text contrast** >=4.5:1 body, >=3:1 secondary
- **Token-driven theming** — semantic color tokens
- **State contrast parity** — equally distinguishable in both themes

### Layout & Spacing
- **Safe-area compliance** for fixed elements
- **8dp spacing rhythm** — consistent 4/8dp system
- **Readable text measure** — avoid edge-to-edge on large devices
- **Adaptive gutters by breakpoint**

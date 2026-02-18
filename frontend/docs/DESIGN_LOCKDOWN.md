# NoteNest Layout — Locked Design Values

This document captures the final visual design achieved through manual transform nudging.
These values will be converted to production CSS.

**Source:** Inline `transform: translate(X, Y) scale(S)` styles from layout control session  
**Target Viewport:** 1440px (Desktop Standard)  
**Date Locked:** 2026-02-16  

---

## Hero Section
> File: `Hero.tsx` — `heroDefaults`

### Section Wrapper
| Property | Value | Notes |
|----------|-------|-------|
| sectionX | `0px` | No horizontal nudge |
| sectionY | `0px` | No vertical nudge |

### Left Column (Text Container)
| Property | Value | Notes |
|----------|-------|-------|
| leftX | `20px` | Shifted right |
| leftY | `0px` | — |
| leftScale | `1` | No scaling |

### Heading
| Property | Value | Notes |
|----------|-------|-------|
| headingX | `0px` | — |
| headingY | `0px` | — |
| headingScale | `1` | — |

### Subtitle
| Property | Value | Notes |
|----------|-------|-------|
| subtitleX | `0px` | — |
| subtitleY | `0px` | — |
| subtitleMaxWidth | `512px` | max-width constraint |

### CTA Button
| Property | Value | Notes |
|----------|-------|-------|
| ctaX | `0px` | — |
| ctaY | `0px` | — |
| ctaScale | `1` | — |

### Social Proof Badge
| Property | Value | Notes |
|----------|-------|-------|
| socialX | `0px` | — |
| socialY | `20px` | Pushed down 20px |

### Right Column (Cards Container)
| Property | Value | Notes |
|----------|-------|-------|
| rightX | `0px` | — |
| rightY | `0px` | — |
| rightScale | `1` | — |
| gridGap | `64px` | Internal card grid gap |

> **DOM Note:** Right column is an `absolute top-0 right-0 w-1/2 h-full` sibling OUTSIDE the Container, giving cards viewport-edge alignment.

### Card 1 — "Real-time Collab"
| Property | Value | Notes |
|----------|-------|-------|
| card1X | `0px` | — |
| card1Y | `0px` | — |
| card1Scale | `3` | 3× scale |
| card1TextX | `10px` | Text nudged right |
| card1TextY | `0px` | — |
| card1TextScale | `1` | — |
| Width | `18rem` (288px) | Tailwind `w-[18rem]` |
| Padding | `p-8` (32px) | Increased from original `p-6` |

### Card 2 — "Syncing..."
| Property | Value | Notes |
|----------|-------|-------|
| card2X | `0px` | — |
| card2Y | `0px` | — |
| card2Scale | `2` | 2× scale |
| card2TextX | `0px` | — |
| card2TextY | `-10px` | Text nudged up |
| card2TextScale | `1` | — |

### Card 3 — "My Notes" (Dark Card)
| Property | Value | Notes |
|----------|-------|-------|
| card3X | `0px` | — |
| card3Y | `0px` | — |
| card3Scale | `2` | 2× scale |
| card3TextX | `20px` | Text nudged right |
| card3TextY | `20px` | Text nudged down |
| card3TextScale | `1` | — |
| Width | `358px` | **Changed from** original `256px` (40% increase) |
| Padding | `py-10 px-8` | Custom padding |
| Min Height | `200px` | `min-h-[200px]` |

### Card 3 Sub-cards
| Property | Value | Notes |
|----------|-------|-------|
| card3Sub1X | `0px` | "Plan for The Day" sub-card |
| card3Sub1Y | `50px` | Pushed down 50px |
| card3Sub2X | `0px` | "Ideas" sub-card |
| card3Sub2Y | `50px` | Pushed down 50px |
| card3Sub1TextX | `5px` | Sub-card 1 text nudge |
| card3Sub1TextY | `0px` | — |
| card3Sub2TextX | `5px` | Sub-card 2 text nudge |
| card3Sub2TextY | `0px` | — |

> **DOM Note:** Sub-cards had fixed `h-36` removed — now size naturally. Padding: `p-5`. Text: `text-base`. Internal: `gap-3`.

---

## Features Section
> File: `Features.tsx` — `featuresDefaults`

### Section Wrapper
| Property | Value | Notes |
|----------|-------|-------|
| sectionX | `0px` | — |
| sectionY | `-26px` | Pulled up 26px |

### Header
| Property | Value | Notes |
|----------|-------|-------|
| headerX | `34px` | Shifted right |
| headerY | `20px` | Pushed down |
| headerScale | `1.06` | 6% scale up |
| headerMaxWidth | `768px` | — |
| Text alignment | `text-left` | **Changed from** `text-center` |
| `mx-auto` | **Removed** | Header flush-left |

### Heading & Subtitle
| Property | Value | Notes |
|----------|-------|-------|
| headingX/Y | `0px / 0px` | At default |
| headingScale | `1` | — |
| subtitleX/Y | `0px / 0px` | At default |

### Grid
| Property | Value | Notes |
|----------|-------|-------|
| gridX/Y | `0px / 0px` | — |
| gridGap | `80px` | — |
| Grid classes | `grid md:grid-cols-3` | `place-items-center` and `w-full` removed by user |

### Feature Cards (Row 1: Cards 1–3)
| Card | X | Y | Scale | Notes |
|------|---|---|-------|-------|
| Card 1 | `38px` | `55px` | `1.12` | Real-time Collaboration (`md:col-span-2` on FeatureCard) |
| Card 2 | `130px` | `55px` | `1.12` | Instant Search |
| Card 3 | `200px` | `55px` | `1.12` | Smart Organization |

### Feature Cards (Row 2: Cards 4–6)
| Card | X | Y | Scale | Notes |
|------|---|---|-------|-------|
| Card 4 | `40px` | `-8px` | `1.12` | Rich Text Editor |
| Card 5 | `115px` | `-8px` | `1.12` | Enterprise Security (`md:col-span-1` on FeatureCard) |
| Card 6 | `200px` | `-8px` | `1.12` | Lightning Fast |

> **DOM Note:** `w-full` removed from all card wrappers by user. `md:col-span-2` moved to FeatureCard className for Card 1.

---

## SocialProof Section
> File: `SocialProof.tsx` — `spDefaults`

### Section Wrapper
| Property | Value | Notes |
|----------|-------|-------|
| sectionX/Y | `0px / 0px` | At default |

### Header ("Trusted by...")
| Property | Value | Notes |
|----------|-------|-------|
| headerX | `0px` | — |
| headerY | `-25px` | Pulled up 25px |
| headerScale | `1.12` | 12% scale up |

### Logo Ticker
| Property | Value | Notes |
|----------|-------|-------|
| tickerX/Y | `0px / 0px` | At default |
| tickerGap | `96px` | Gap between logos |

### Stats Grid
| Property | Value | Notes |
|----------|-------|-------|
| statsX/Y | `0px / 0px` | — |
| statsGap | `32px` | — |

### Individual Stat Cards
All 3 stat cards (Teams, Notes, Uptime) at defaults:
| Property | Value |
|----------|-------|
| statNX/Y | `0px / 0px` |
| statNScale | `1` |

---

## BestPractices Section
> File: `BestPractices.tsx` — `bpDefaults`

### Section Wrapper
| Property | Value | Notes |
|----------|-------|-------|
| sectionX | `0px` | — |
| sectionY | `27px` | Pushed down 27px |
| sectionMinHeight | `650px` | Min height set |
| gridGap | `128px` | Large column gap |

### Left Column (Methodology Text)
| Property | Value | Notes |
|----------|-------|-------|
| leftX | `50px` | Shifted right significantly |
| leftY | `-40px` | Pulled up 40px |
| leftScale | `1.12` | 12% scale up |

### Badge & Heading
| Property | Value | Notes |
|----------|-------|-------|
| badgeX/Y | `0px / 0px` | — |
| headingX/Y | `0px / 0px` | — |
| headingScale | `1` | — |

### Principles List
| Property | Value | Notes |
|----------|-------|-------|
| principlesX/Y | `0px / 32px` | Pushed down 32px |
| principlesGap | `24px` | — |

### Right Column (Comparison)
| Property | Value | Notes |
|----------|-------|-------|
| rightX | `76px` | Shifted right |
| rightY | `16px` | Pushed down |
| rightScale | `1` | — |

### Comparison Card
| Property | Value | Notes |
|----------|-------|-------|
| cardX | `6px` | Slight right nudge |
| cardY | `-2px` | Slight up nudge |
| cardScale | `1` | — |
| cardMaxWidth | `500px` | — |
| cardHeight | `600px` | — |

### Comparison Card Text
| Property | Value | Notes |
|----------|-------|-------|
| badTextX/Y | `0px / 0px` | Weak note text at default |
| goodTextX | `20px` | Strong note text right |
| goodTextY | `20px` | Strong note text down |

> **DOM Note:** `overflow-hidden` removed from both note cards. Padding moved to inner wrapper div that receives the text transform. Card background stays fixed while text moves independently.

---

## FAQ Section
> File: `FAQ.tsx` — `faqDefaults`

### Section Wrapper
| Property | Value | Notes |
|----------|-------|-------|
| sectionX/Y | `0px / 0px` | At default |
| sectionMinHeight | `0px` | Not set |

### Grid
| Property | Value | Notes |
|----------|-------|-------|
| gridGap | `100px` | Column gap |

### Left Column (Header)
| Property | Value | Notes |
|----------|-------|-------|
| leftX | `20px` | Shifted right |
| leftY | `20px` | Pushed down |
| leftScale | `1.12` | 12% scale up |

### Badge ("Support")
| Property | Value | Notes |
|----------|-------|-------|
| badgeX | `20px` | Shifted right |
| badgeY | `0px` | — |

### Heading ("Frequently Asked Questions")
| Property | Value | Notes |
|----------|-------|-------|
| headingX | `20px` | Shifted right |
| headingY | `0px` | — |
| headingScale | `1` | — |

### Subtitle
| Property | Value | Notes |
|----------|-------|-------|
| subtitleX | `20px` | Shifted right |
| subtitleY | `0px` | — |

### Right Column (FAQ List)
| Property | Value | Notes |
|----------|-------|-------|
| rightX | `17px` | Slight right nudge |
| rightY | `0px` | — |
| rightScale | `1` | — |

### FAQ Card Container
| Property | Value | Notes |
|----------|-------|-------|
| faqCardX/Y | `0px / 0px` | — |
| faqCardPadding | `48px` | Internal padding |

---

## Footer
> File: `Footer.tsx` — `ftDefaults`

### Footer Wrapper
| Property | Value | Notes |
|----------|-------|-------|
| footerX | `0px` | — |
| footerY | `53px` | Pushed down 53px |
| footerPaddingY | `80px` | Vertical padding |
| footerMarginTop | `80px` | Top margin |
| gridGap | `40px` | — |

### Brand Column
| Property | Value | Notes |
|----------|-------|-------|
| brandX | `30px` | Shifted right |
| brandY | `0px` | — |
| brandScale | `1` | — |

### Link Columns
| Property | Value | Notes |
|----------|-------|-------|
| linksX/Y | `0px / 0px` | At default |
| linksGap | `40px` | — |

### Bottom Bar
| Property | Value | Notes |
|----------|-------|-------|
| bottomX | `35px` | Shifted right |
| bottomY | `30px` | Pushed down |
| bottomScale | `1` | — |

---

## Summary of Non-Zero Nudges (Requires CSS Conversion)

| Section | Element | X | Y | Scale | Other |
|---------|---------|---|---|-------|-------|
| **Hero** | Left column | 20 | 0 | 1 | — |
| **Hero** | Social proof | 0 | 20 | — | — |
| **Hero** | Card 1 | 0 | 0 | **3** | text: 10,0 |
| **Hero** | Card 2 | 0 | 0 | **2** | text: 0,-10 |
| **Hero** | Card 3 | 0 | 0 | **2** | text: 20,20; width: 358px |
| **Hero** | Sub-cards 1 & 2 | 0 | **50** | — | text: 5,0 |
| **Features** | Section | 0 | -26 | — | — |
| **Features** | Header | 34 | 20 | 1.06 | text-left |
| **Features** | Cards 1–3 | 38–200 | 55 | 1.12 | — |
| **Features** | Cards 4–6 | 40–200 | -8 | 1.12 | — |
| **SocialProof** | Header | 0 | -25 | 1.12 | — |
| **BestPractices** | Section | 0 | 27 | — | minHeight: 650px |
| **BestPractices** | Left col | 50 | -40 | 1.12 | — |
| **BestPractices** | Principles | 0 | 32 | — | — |
| **BestPractices** | Right col | 76 | 16 | 1 | — |
| **BestPractices** | Card | 6 | -2 | 1 | — |
| **BestPractices** | Good text | 20 | 20 | — | — |
| **FAQ** | Left col | 20 | 20 | 1.12 | — |
| **FAQ** | Badge/Heading/Sub | 20 | 0 | 1 | — |
| **FAQ** | Right col | 17 | 0 | 1 | — |
| **Footer** | Wrapper | 0 | 53 | — | — |
| **Footer** | Brand | 30 | 0 | 1 | — |
| **Footer** | Bottom bar | 35 | 30 | 1 | — |

---

## DOM Structure Changes (Non-Transform Modifications)

These changes cannot be captured by simple CSS conversion and must be preserved:

1. **Hero Right Column** — moved outside `Container` as absolute sibling, `absolute top-0 right-0 w-1/2 h-full`
2. **Hero Card 3** — width `256px → 358px`, padding restructured to `py-10 px-8`, min-height `200px`
3. **Hero Card 3 Sub-cards** — fixed `h-36` removed, gap changed, text size `sm → base`
4. **Features Header** — `text-center mx-auto` → `text-left` (no `mx-auto`)
5. **Features Grid** — `place-items-center` and `w-full` removed from grid/wrappers
6. **Features Card 1** — `md:col-span-2` moved to `FeatureCard` className
7. **BestPractices BadNote/GoodNote** — `overflow-hidden` removed, padding moved to inner wrapper for independent text nudging

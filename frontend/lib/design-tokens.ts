// ============================================================================
// Design System Tokens
// ============================================================================
// Single source of truth for spacing, layout, and design values
// Used across all components to ensure consistency
// ============================================================================

/**
 * Layout Constants
 * These define the maximum content width and standardize container sizes
 */
export const LAYOUT = {
    // Primary container width - used for most sections
    // Provides optimal reading width and visual balance at desktop sizes
    CONTAINER_WIDTH: 'max-w-7xl',

    // Consistent horizontal padding for all sections
    // Ensures content never touches viewport edges
    CONTAINER_PADDING: 'px-6 sm:px-8 lg:px-12',

    // Section vertical spacing scale
    // Reduced to prevent excessive stacking between adjacent sections
    // Adjacent sections share edges: pb + pt = total gap
    SECTION_SPACING: {
        small: 'py-12 md:py-16',      // 48-64px each → 96-128px gaps
        medium: 'py-16 md:py-20',     // 64-80px each → 128-160px gaps
        large: 'py-20 md:py-24',      // 80-96px each → 160-192px gaps
    },
} as const;

/**
 * Spacing Scale
 * Consistent gaps and spacing between elements
 * Based on 4px base unit (Tailwind default)
 */
export const SPACING = {
    // Grid and flex gaps
    GAP: {
        xs: 'gap-4',      // 16px - tight element spacing
        sm: 'gap-6',      // 24px - card grid spacing
        md: 'gap-8',      // 32px - section internal spacing
        lg: 'gap-12',     // 48px - major column gaps
        xl: 'gap-16',     // 64px - hero columns, major sections
    },

    // Stack spacing (vertical)
    STACK: {
        xs: 'space-y-4',   // 16px - tight lists
        sm: 'space-y-6',   // 24px - card stacks
        md: 'space-y-8',   // 32px - section content
        lg: 'space-y-12',  // 48px - major content blocks
    },
} as const;

/**
 * Color Tokens
 * Maps semantic names to actual color values
 * Makes theme changes easy - change here, update everywhere
 */
export const COLORS = {
    // Brand colors
    brand: {
        beige: '#F3F0E6',      // Primary background, warm neutral
        dark: '#1A1A1A',       // Primary text, headings
        accent: '#FF6B6B',     // CTAs, emphasis (if needed)
    },

    // Semantic colors
    background: {
        primary: '#F3F0E6',    // Main page background
        card: '#FFFFFF',       // Card backgrounds
    },

    text: {
        primary: '#1A1A1A',    // Body text, headings
        secondary: '#4A4A4A',  // Secondary text, captions
        muted: '#6B6B6B',      // Disabled, placeholder text
    },
} as const;

/**
 * Typography Scale
 * Consistent heading sizes and hierarchy
 */
export const TYPOGRAPHY = {
    heading: {
        h1: 'text-5xl md:text-6xl lg:text-7xl font-serif font-bold',
        h2: 'text-4xl md:text-5xl lg:text-6xl font-serif font-bold',
        h3: 'text-3xl md:text-4xl font-serif font-semibold',
        h4: 'text-2xl md:text-3xl font-serif font-semibold',
    },

    body: {
        large: 'text-lg md:text-xl',
        base: 'text-base md:text-lg',
        small: 'text-sm md:text-base',
    },
} as const;

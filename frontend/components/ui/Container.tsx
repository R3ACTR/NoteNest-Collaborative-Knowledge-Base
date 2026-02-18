// ============================================================================
// Container Component
// ============================================================================
// Reusable max-width container with consistent horizontal padding
// Used by Section component and standalone when needed
// ============================================================================

import { ReactNode } from 'react';
import { LAYOUT } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface ContainerProps {
    children: ReactNode;
    /**
     * Override default max-width if needed
     * Default: 'max-w-7xl' (from design tokens)
     */
    maxWidth?: string;
    /**
     * Additional CSS classes to merge
     */
    className?: string;
    /**
     * Disable horizontal padding (useful for full-bleed child elements)
     * Default: false
     */
    noPadding?: boolean;
}

/**
 * Container component that wraps content with consistent width and padding
 * 
 * Usage:
 *   <Container>
 *     <h1>My Content</h1>
 *   </Container>
 * 
 * With custom width:
 *   <Container maxWidth="max-w-5xl">
 *     <nav>Narrower content</nav>
 *   </Container>
 */
export function Container({
    children,
    maxWidth = LAYOUT.CONTAINER_WIDTH,
    className,
    noPadding = false,
}: ContainerProps) {
    return (
        <div
            className={cn(
                // Center container and set max width
                'mx-auto',
                maxWidth,

                // Apply horizontal padding unless disabled
                !noPadding && LAYOUT.CONTAINER_PADDING,

                // Allow additional classes
                className
            )}
        >
            {children}
        </div>
    );
}

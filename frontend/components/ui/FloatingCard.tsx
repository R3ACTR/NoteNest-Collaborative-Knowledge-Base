// ============================================================================
// FloatingCard Component
// ============================================================================
// Decorative card elements used in Hero section
// Extracted for reusability and maintainability
// ============================================================================

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FloatingCardProps {
    children?: ReactNode;
    className?: string;
    rotate?: number;
    delay?: number;
    xOffset?: number;
    yOffset?: number;
    style?: React.CSSProperties;
}

/**
 * Decorative floating card for visual interest in hero sections
 * 
 * Usage:
 *   <FloatingCard className="row-start-1 col-start-2">
 *      Content
 *   </FloatingCard>
 */
export function FloatingCard({
    children,
    className,
    rotate = 0,
    delay = 0,
    xOffset = 0,
    yOffset = 0,
    style,
}: FloatingCardProps) {
    return (
        <div
            className={cn(
                // Base card styles
                'bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm',
                'transform transition-all duration-500 hover:scale-105 hover:z-50',

                // Animation
                'animate-float',

                // Allow positioning via className
                className
            )}
            style={{
                ...style,
                transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotate}deg)`,
                animationDelay: `${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

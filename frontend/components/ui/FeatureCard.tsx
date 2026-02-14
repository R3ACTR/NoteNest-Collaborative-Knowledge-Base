// ============================================================================
// FeatureCard Component
// ============================================================================
// Reusable card for feature grid/bento layouts
// Ensures consistent card styling across features section
// ============================================================================

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
    /**
     * Card title (feature name)
     */
    title: string;
    /**
     * Feature description
     */
    description: string;
    /**
     * Optional icon component
     */
    icon?: ReactNode;
    /**
     * Background color className
     * Default: bg-gray-50
     */
    background?: string;
    /**
     * Additional CSS classes
     * Use for grid positioning (row-span-2, col-span-2, etc.)
     */
    className?: string;
    /**
     * Optional illustration or image
     */
    illustration?: ReactNode;
}

/**
 * Feature card with consistent styling
 * 
 * Usage:
 *   <FeatureCard
 *     title="Real-time Collaboration"
 *     description="Work together with your team in real-time"
 *     icon={<IconSync />}
 *   />
 * 
 * With grid positioning:
 *   <FeatureCard
 *     title="Advanced Features"
 *     description="..."
 *     className="md:row-span-2"  // Make card taller
 *   />
 */
export function FeatureCard({
    title,
    description,
    icon,
    background = 'bg-gray-50',
    className,
    illustration,
}: FeatureCardProps) {
    return (
        <div
            className={cn(
                // Base card styling
                'rounded-2xl p-8 md:p-10',
                background,

                // Hover effect
                'transition-all duration-300 hover:shadow-lg',

                // Grid positioning via className
                className
            )}
        >
            {/* Icon */}
            {icon && (
                <div className="mb-6" aria-hidden="true">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-gray-900">
                    {title}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Optional illustration */}
            {illustration && (
                <div className="mt-8">
                    {illustration}
                </div>
            )}
        </div>
    );
}

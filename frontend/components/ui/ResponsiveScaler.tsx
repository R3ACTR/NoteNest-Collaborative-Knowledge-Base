"use client";

import { useEffect, useState, useRef } from "react";

interface ResponsiveScalerProps {
    children: React.ReactNode;
}

export const ResponsiveScaler = ({ children }: ResponsiveScalerProps) => {
    const [scale, setScale] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [scaledHeight, setScaledHeight] = useState<number | "auto">("auto");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            const width = window.innerWidth;
            // Breakpoint: 1024px (Tailwind 'lg')
            const mobile = width < 1024;
            setIsMobile(mobile);

            if (!mobile) {
                // Design baseline: 1920px
                const targetWidth = 1920;
                const newScale = width / targetWidth;
                setScale(newScale);
            } else {
                setScale(1);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Effect to update height when scale changes or on resize
    useEffect(() => {
        if (!isMobile && containerRef.current && mounted) {
            const updateHeight = () => {
                if (containerRef.current) {
                    // The container's offsetHeight is the unscaled height.
                    // We need to reserve space for the *scaled* content.
                    setScaledHeight(containerRef.current.offsetHeight * scale);
                }
            };

            // Observe the inner container for size changes (e.g. bolding text, loading images)
            const observer = new ResizeObserver(updateHeight);
            observer.observe(containerRef.current);

            // Also update immediately
            updateHeight();

            return () => observer.disconnect();
        } else {
            setScaledHeight("auto");
        }
    }, [scale, isMobile, mounted]);

    if (!mounted) {
        // Return a hidden version to avoid hydration mismatch, or just null
        return <div className="opacity-0">{children}</div>;
    }

    if (isMobile) {
        return <div className="w-full overflow-x-hidden">{children}</div>;
    }

    return (
        <div
            className="relative w-full overflow-hidden origin-top-left"
            style={{
                height: scaledHeight,
            }}
        >
            <div
                ref={containerRef}
                className="origin-top-left absolute top-0 left-0"
                style={{
                    width: "1920px",
                    transform: `scale(${scale})`,
                }}
            >
                {children}
            </div>
        </div>
    );
};

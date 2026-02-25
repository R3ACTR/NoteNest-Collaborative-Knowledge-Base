"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  size?: "compact" | "default" | "large";
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  size = "default",
}: EmptyStateProps) {
  const isCompact = size === "compact";
  const isLarge = size === "large";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "p-4" : isLarge ? "py-24 px-8" : "py-12 px-6",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn(
        "flex flex-col items-center",
        isCompact ? "gap-2" : "gap-4"
      )}>
        {Icon && (
          <div
            className={cn(
              "flex items-center justify-center rounded-2xl bg-stone-100/50 p-4 text-stone-400 shadow-sm transition-colors group-hover:bg-stone-100",
              isCompact ? "p-3" : "p-6"
            )}
            aria-hidden="true"
          >
            <Icon className={cn(
              "stroke-[1.5]",
              isCompact ? "h-6 w-6" : isLarge ? "h-12 w-12" : "h-10 w-10"
            )} />
          </div>
        )}
        
        <div className="max-w-md">
          <h3
            className={cn(
              "font-display font-bold tracking-tight text-stone-900",
              isCompact ? "text-base" : isLarge ? "text-2xl" : "text-xl"
            )}
          >
            {title}
          </h3>

          {description && (
            <p
              className={cn(
                "mt-2 text-stone-500",
                isCompact ? "text-xs" : "text-sm"
              )}
            >
              {description}
            </p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className={cn(
            "mt-6 flex flex-col items-center gap-3",
            isCompact ? "mt-4" : "mt-8"
          )}>
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: string | number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  headerAction?: React.ReactNode;
}

export function CollapsibleSection({
  title,
  icon,
  badge,
  defaultOpen = true,
  children,
  className,
  headerClassName,
  contentClassName,
  headerAction,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        "bg-gradient-to-b from-gray-850 to-gray-900",
        "border border-gray-800",
        className
      )}
    >
      <div
        className={cn(
          "w-full flex items-center gap-3 p-4",
          "hover:bg-gray-800/30 transition-colors",
          headerClassName
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          {icon && (
            <div className="text-amber-500">{icon}</div>
          )}
          
          <h3 className="flex-1 font-semibold text-gray-200 tracking-wide">
            {title}
          </h3>

          {badge !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-300">
              {badge}
            </span>
          )}
        </button>

        {headerAction && (
          <div className="flex-shrink-0">{headerAction}</div>
        )}

        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className={cn("px-4 pb-4", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

// Simpler section divider for inline sections
interface SectionDividerProps {
  title: string;
  className?: string;
}

export function SectionDivider({ title, className }: SectionDividerProps) {
  return (
    <div className={cn("flex items-center gap-3 my-4", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <span className="text-xs uppercase tracking-widest text-gray-500">{title}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
    </div>
  );
}

// Card wrapper for consistent styling
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4",
        "bg-gradient-to-br from-gray-800/80 to-gray-900/80",
        "border border-gray-700/50",
        "backdrop-blur-sm",
        hover && "hover:border-amber-500/30 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

// Stat display box
interface StatBoxProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatBox({ label, value, subValue, icon, className }: StatBoxProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-lg",
        "bg-gray-900/50 border border-gray-800",
        className
      )}
    >
      {icon && <div className="text-amber-500 mb-1">{icon}</div>}
      <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </span>
      <span className="text-2xl font-bold text-gray-100">{value}</span>
      {subValue && (
        <span className="text-xs text-gray-500 mt-0.5">{subValue}</span>
      )}
    </div>
  );
}

// Grid layout helper
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 3, className }: StatsGridProps) {
  const colClasses = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", colClasses[columns], className)}>
      {children}
    </div>
  );
}

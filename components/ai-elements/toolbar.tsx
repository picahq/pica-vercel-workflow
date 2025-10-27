"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
        "flex items-center gap-1 p-1 bg-background border border-border rounded-lg shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}


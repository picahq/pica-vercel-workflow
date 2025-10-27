"use client";

import * as React from "react";
import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface NodeProps {
  children: React.ReactNode;
  handles?: {
    target?: boolean;
    source?: boolean;
  };
  className?: string;
}

export function Node({ children, handles = { target: true, source: true }, className }: NodeProps) {
  return (
    <div className={cn("relative", className)}>
      {handles.target && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-neutral-400 dark:!bg-neutral-600 !border-3 !border-neutral-200 dark:!border-neutral-800 !w-3 !h-3"
        />
      )}
      <Card className="w-[260px] shadow-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        {children}
      </Card>
      {handles.source && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-neutral-400 dark:!bg-neutral-600 !border-3 !border-neutral-200 dark:!border-neutral-800 !w-3 !h-3"
        />
      )}
    </div>
  );
}

export function NodeHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <CardHeader className={cn("pb-2 pt-3", className)}>{children}</CardHeader>;
}

export function NodeTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <CardTitle className={cn("text-sm font-semibold", className)}>{children}</CardTitle>;
}

export function NodeDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <CardDescription className={cn("text-xs mt-0.5", className)}>{children}</CardDescription>;
}

export function NodeContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <CardContent className={cn("py-2", className)}>{children}</CardContent>;
}

export function NodeFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <CardContent className={cn("pt-0 pb-2 border-t border-neutral-200 dark:border-neutral-800", className)}>{children}</CardContent>;
}


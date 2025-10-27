"use client";

import { Panel as ReactFlowPanel, type PanelPosition } from "@xyflow/react";

export interface PanelProps {
  children: React.ReactNode;
  position?: PanelPosition;
  className?: string;
}

export function Panel({ children, position = "top-left", className }: PanelProps) {
  return (
    <ReactFlowPanel position={position} className={className}>
      {children}
    </ReactFlowPanel>
  );
}


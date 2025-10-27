"use client";

import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  type Edge,
  type Node,
  type ReactFlowProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export interface CanvasProps extends Omit<ReactFlowProps, "nodes" | "edges"> {
  nodes: Node[];
  edges: Edge[];
  children?: React.ReactNode;
}

export function Canvas({ nodes, edges, children, ...props }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-right"
          {...props}
        >
          <Background
            color="#e5e5e5"
            gap={24}
            size={0.5}
            className="bg-neutral-50 dark:!bg-neutral-900"
          />
          {children}
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}


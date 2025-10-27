"use client";

import { BaseEdge, type EdgeProps, getStraightPath } from "@xyflow/react";

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: "#737373", // Subtle gray (Vercel style)
        strokeDasharray: "6, 6", // Dotted line
        opacity: 0.4,
      }}
    />
  );
}

function TemporaryEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: "#d4d4d4", // Very light gray for pending
        strokeDasharray: "6, 6", // Dotted line
        opacity: 0.2,
      }}
    />
  );
}

export const Edge = {
  Animated: AnimatedEdge,
  Temporary: TemporaryEdge,
};


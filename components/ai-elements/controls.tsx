"use client";

import { Controls as ReactFlowControls } from "@xyflow/react";

export function Controls() {
  return (
    <ReactFlowControls
      className="!border !border-neutral-200 dark:!border-neutral-800 !bg-white dark:!bg-neutral-950 !shadow-md [&_button]:!bg-white dark:[&_button]:!bg-neutral-950 [&_button]:!border-neutral-200 dark:[&_button]:!border-neutral-800 [&_button]:!text-neutral-700 dark:[&_button]:!text-neutral-300 [&_button:hover]:!bg-neutral-50 dark:[&_button:hover]:!bg-neutral-900"
      showInteractive={false}
    />
  );
}


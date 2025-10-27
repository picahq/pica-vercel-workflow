/**
 * Workflow State Management
 * Stores real-time workflow execution data and logs
 */

interface StepLog {
  timestamp: string;
  level: "info" | "success" | "error";
  message: string;
}

interface StepState {
  stepId: string;
  stepName: string;
  status: "pending" | "running" | "completed" | "failed" | "waiting";
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  result?: any;
  error?: string;
  logs: StepLog[];
}

interface WorkflowState {
  runId: string;
  status: "running" | "completed" | "failed" | "paused";
  leadData: {
    name: string;
    email: string;
    company: string;
  };
  steps: Map<string, StepState>;
  startedAt: string;
  completedAt?: string;
}

// In-memory store (in production, use Redis or database)
const workflowStore = new Map<string, WorkflowState>();
const emailToRunIdMap = new Map<string, string>();

export function initWorkflow(runId: string, leadData: { name: string; email: string; company: string }) {
  const state: WorkflowState = {
    runId,
    status: "running",
    leadData,
    steps: new Map(),
    startedAt: new Date().toISOString(),
  };
  workflowStore.set(runId, state);
  // Also map email to runId for easy lookup
  emailToRunIdMap.set(leadData.email, runId);
  return state;
}

export function getRunIdByEmail(email: string): string | undefined {
  return emailToRunIdMap.get(email);
}

export function updateStepStatus(
  emailOrRunId: string,
  stepId: string,
  stepName: string,
  status: StepState["status"],
  result?: any,
  error?: string
) {
  // Try to find by runId first, then by email
  let runId = emailOrRunId;
  if (!workflowStore.has(emailOrRunId)) {
    runId = emailToRunIdMap.get(emailOrRunId) || emailOrRunId;
  }

  const workflow = workflowStore.get(runId);
  if (!workflow) {
    console.log(`Workflow not found for: ${emailOrRunId}`);
    return;
  }

  let step = workflow.steps.get(stepId);
  if (!step) {
    step = {
      stepId,
      stepName,
      status: "pending",
      logs: [],
    };
    workflow.steps.set(stepId, step);
  }

  step.status = status;
  
  if (status === "running" && !step.startedAt) {
    step.startedAt = new Date().toISOString();
  }
  
  if (status === "completed" || status === "failed") {
    step.completedAt = new Date().toISOString();
    if (step.startedAt) {
      step.duration = new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime();
    }
  }

  if (result) {
    step.result = result;
  }

  if (error) {
    step.error = error;
  }

  workflowStore.set(runId, workflow);
}

export function addStepLog(emailOrRunId: string, stepId: string, level: StepLog["level"], message: string) {
  // Try to find by runId first, then by email
  let runId = emailOrRunId;
  if (!workflowStore.has(emailOrRunId)) {
    runId = emailToRunIdMap.get(emailOrRunId) || emailOrRunId;
  }

  const workflow = workflowStore.get(runId);
  if (!workflow) return;

  const step = workflow.steps.get(stepId);
  if (!step) return;

  step.logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
  });

  workflowStore.set(runId, workflow);
}

export function getWorkflowState(runId: string): WorkflowState | null {
  return workflowStore.get(runId) || null;
}

export function completeWorkflow(runId: string) {
  const workflow = workflowStore.get(runId);
  if (!workflow) return;

  workflow.status = "completed";
  workflow.completedAt = new Date().toISOString();
  workflowStore.set(runId, workflow);
}


"use client";

import * as React from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  XCircle,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Canvas } from "@/components/ai-elements/canvas";
import { Connection } from "@/components/ai-elements/connection";
import { Controls } from "@/components/ai-elements/controls";
import { Edge } from "@/components/ai-elements/edge";
import {
  Node,
  NodeContent,
  NodeDescription,
  NodeFooter,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Panel } from "@/components/ai-elements/panel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function WorkflowPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const router = useRouter();
  const [selectedNode, setSelectedNode] = React.useState<any>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [workflowData, setWorkflowData] = React.useState<any>(null);
  const [stepResults, setStepResults] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);
  
  // Stable node IDs - NEVER change these! (8 steps now - no approval)
  const nodeIds = React.useRef([
    "start", "research", "decision_makers", "attio", 
    "airtable", "email_gen", "gmail", "notion"
  ]);

  // Clear old step data ONLY when switching to a different workflow
  React.useEffect(() => {
    const lastRunId = sessionStorage.getItem('lastRunId');
    
    // If this is a different runId, clear old data
    if (lastRunId && lastRunId !== runId) {
      console.log(`🧹 New workflow detected: ${lastRunId} → ${runId} - clearing old step data`);
      setStepResults({});
      fetch(`/api/step-update?runId=unknown&clear=true`);
    } else if (!lastRunId) {
      console.log(`🆕 First workflow - clearing any stale data`);
      setStepResults({});
      fetch(`/api/step-update?runId=unknown&clear=true`);
    } else {
      console.log(`♻️ Same workflow (${runId}) - keeping data`);
    }
    
    sessionStorage.setItem('lastRunId', runId);
  }, [runId]);

  // Poll for real workflow data AND step results
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch overall workflow status
        const workflowResponse = await fetch(`/api/workflow/${runId}`);
        if (workflowResponse.ok) {
          const data = await workflowResponse.json();
          setWorkflowData(data);
          setLoading(false);
        }

        // Fetch real-time step results (stored under "unknown" runId)
        const stepsResponse = await fetch(`/api/step-update?runId=unknown`);
        
        if (stepsResponse.ok) {
          const stepsData = await stepsResponse.json();
          
          if (stepsData.steps && stepsData.steps.length > 0) {
            const stepsMap: any = {};
            stepsData.steps.forEach((step: any) => {
              stepsMap[step.stepId] = step;
            });
            // REPLACE (don't merge) - we cleared old data on mount
            setStepResults(stepsMap);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [runId]);

  // BULLETPROOF step rendering - ALWAYS returns exactly 8 steps, NEVER empty!
  const steps = React.useMemo(() => {
    // Workflow data can be in 'result' OR 'output' - check both!
    let result = workflowData?.result || workflowData?.output || {};
    
    // CRITICAL FIX: If result is an array, extract the first element (the actual object)
    if (Array.isArray(result) && result[0] && typeof result[0] === 'object') {
      console.log("🔧 Converting array result to object");
      result = result[0];
    }
    
    const isCompleted = workflowData?.status === "completed";
    const isRunning = workflowData?.status === "running";
    const completedStepCount = Object.keys(stepResults).length;
    
    console.log("🎯 Rendering - Status:", workflowData?.status, "Real-time steps:", completedStepCount, "Result/Output:", !!result.success, "Is Object:", typeof result === 'object' && !Array.isArray(result));
    console.log("🔍 Result keys:", result && typeof result === 'object' ? Object.keys(result) : 'not an object');
    console.log("🔍 stepResults:", stepResults);
    
    // ALWAYS return exactly 8 steps - use stepResults if available, otherwise use workflow result
    const stepsArray = [
      {
        id: "start",
        label: "Start",
        description: "Lead Received",
        status: "completed" as const,
        data: result.leadData || {
          name: workflowData?.input?.[2],
          email: workflowData?.input?.[3],
          company: workflowData?.input?.[4]
        },
        logs: [],
      },
      {
        id: "research",
        label: "Company Research",
        description: "Exa AI Search",
        status: (stepResults.research || result.companyData) ? "completed" : "pending",
        data: stepResults.research?.result || result.companyData || null,
        logs: [],
      },
      {
        id: "decision_makers",
        label: "Decision Makers",
        description: "LinkedIn Search",
        status: (stepResults.decision_makers || result.decisionMakers) ? "completed" : "pending",
        data: stepResults.decision_makers?.result || (result.decisionMakers ? { executives: result.decisionMakers } : null),
        logs: [],
      },
      {
        id: "attio",
        label: "Attio CRM",
        description: "Create Contact",
        status: (stepResults.attio || result.attioResult) ? "completed" : "pending",
        data: stepResults.attio?.result || result.attioResult?.data || result.attioResult || null,
        logs: [],
      },
      {
        id: "airtable",
        label: "Airtable",
        description: "Log Analytics",
        status: (stepResults.airtable || result.airtableResult) ? "completed" : "pending",
        data: stepResults.airtable?.result || result.airtableResult || null,
        logs: [],
      },
      {
        id: "email_gen",
        label: "Generate Email",
        description: "AI Personalization",
        status: (stepResults.email_gen || result.emailContent) ? "completed" : "pending",
        data: stepResults.email_gen?.result || result.emailContent || null,
        logs: [],
      },
      {
        id: "gmail",
        label: "Send Email",
        description: "Gmail (Automatic)",
        status: stepResults.gmail?.status || (result.gmailResult ? "completed" : "pending"),
        data: stepResults.gmail?.result || result.gmailResult || null,
        logs: [],
      },
      {
        id: "notion",
        label: "Notion Report",
        description: "Intelligence",
        status: stepResults.notion?.status || (result.notionResult ? (result.notionResult.error ? "failed" : "completed") : "pending"),
        data: stepResults.notion?.result || result.notionResult || null,
        logs: [],
      },
    ];
    
    console.log("✅ Returning steps array with length:", stepsArray.length);
    return stepsArray;
  }, [workflowData, stepResults]); // Only updates when data changes

  // Helper function to get step descriptions
  function getStepDescription(stepId: string): string {
    const descriptions: Record<string, string> = {
      research: "Exa AI Search",
      decision_makers: "LinkedIn Search",
      attio: "Create Contact",
      airtable: "Log Analytics",
      email_gen: "AI Personalization",
      approval: "Human Review",
      gmail: "Gmail",
      sleep: "Workflow Pause",
      notion: "Intelligence",
    };
    return descriptions[stepId] || "";
  }

  // STABLE nodes - draggable and positioned horizontally
  const nodes = steps.map((step, index) => ({
    id: step.id, // Stable ID from steps
    type: "workflow",
    position: { x: index * 480, y: 200 },
    draggable: true, // Make nodes movable!
    data: {
      ...step,
      onViewDetails: () => {
        setSelectedNode(step);
        setSheetOpen(true);
      },
    },
  }));

  // STABLE edges - animated when completed, dotted when pending
  const edges = steps.slice(0, -1).map((step, index) => ({
    id: `e${index}`,
    source: step.id,
    target: steps[index + 1].id,
    type: "animated", // Always use animated type
    animated: step.status === "completed", // Animate when complete
    style: { 
      stroke: step.status === "completed" ? "#10b981" : "#a3a3a3",
      strokeWidth: 2,
      strokeDasharray: step.status === "completed" ? "0" : "5,5", // Dotted when pending
    },
  }));

  // MEMOIZE nodeTypes to prevent React Flow from unmounting/remounting!
  const nodeTypes = React.useMemo(() => ({
    workflow: ({ data }: { data: any }) => {
      const getStatusIcon = () => {
        switch (data.status) {
          case "completed":
            return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />;
          case "running":
            return <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-500 animate-spin" />;
          case "waiting":
            return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />;
          case "failed":
            return <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-500" />;
          default:
            return <Circle className="h-4 w-4 text-neutral-400 dark:text-neutral-600" />;
        }
      };

      const getStatusBadge = () => {
        const badges = {
          completed: <Badge className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 border-0 font-medium">Complete</Badge>,
          running: <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 border-0 font-medium">Running</Badge>,
          waiting: <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 border-0 font-medium">Waiting</Badge>,
          pending: <Badge className="text-xs bg-neutral-100 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 border-0 font-medium">Pending</Badge>,
          failed: <Badge className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 border-0 font-medium">Failed</Badge>,
        };
        return badges[data.status as keyof typeof badges] || badges.pending;
      };

      return (
        <div className="group">
          <Node handles={{ target: data.id !== "start", source: data.id !== steps[steps.length - 1].id }}>
            <NodeHeader>
              <div className="flex items-center gap-2.5">
                {getStatusIcon()}
                <div className="flex-1 min-w-0">
                  <NodeTitle className="text-neutral-900 dark:text-neutral-100">{data.label}</NodeTitle>
                  <NodeDescription className="text-neutral-500 dark:text-neutral-400">{data.description}</NodeDescription>
                </div>
              </div>
            </NodeHeader>
            <NodeContent>
              {getStatusBadge()}
              {data.data && Object.keys(data.data).length > 0 && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
                  {Object.keys(data.data).length} field{Object.keys(data.data).length > 1 ? "s" : ""} available
                </p>
              )}
            </NodeContent>
            {(data.status === "completed" || data.status === "failed" || data.data) && (
              <NodeFooter className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  size="sm"
                  onClick={data.onViewDetails}
                  className="w-full h-9 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-medium flex items-center justify-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {data.status === "failed" ? "View Error" : "View Details"}
                </Button>
              </NodeFooter>
            )}
          </Node>
        </div>
      );
    },
  }), []); // Empty deps - nodeTypes never changes!

  const edgeTypes = React.useMemo(() => ({
    animated: Edge.Animated,
    temporary: Edge.Temporary,
  }), []); // Empty deps - edgeTypes never changes!

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-neutral-950">
      {/* Enhanced Header with Logos */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back</span>
            </Button>
            
            {/* Logo Avatar Group + Title */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-neutral-950 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm">
                  <Image src="/pica-logo.svg" alt="Pica" width={20} height={20} className="dark:invert" />
                </div>
                <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-neutral-950 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm">
                  <Image src="/vercel-logo.svg" alt="Vercel" width={16} height={16} className="dark:invert" />
                </div>
              </div>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Lead Enrichment Workflow
              </span>
              <Badge className="text-xs font-mono bg-neutral-100 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 border-0">
                {runId}
              </Badge>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Canvas with lighter background */}
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <Canvas
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={Connection}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        >
          <Controls />

          <Panel position="top-left">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push("/")}
                className="bg-white text-neutral-900 hover:bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-md font-medium"
              >
                New Lead
              </Button>
            </div>
          </Panel>

          <Panel position="top-right">
            <Card className="w-[220px] shadow-lg bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Workflow Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">Completed</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-500">
                    {steps.filter(s => s.status === "completed").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">Running</span>
                  <span className="font-bold text-blue-600 dark:text-blue-500">
                    {steps.filter(s => s.status === "running").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">Failed</span>
                  <span className="font-bold text-rose-600 dark:text-rose-500">
                    {steps.filter(s => s.status === "failed").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">Waiting</span>
                  <span className="font-bold text-amber-600 dark:text-amber-500">
                    {steps.filter(s => s.status === "waiting").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 dark:text-neutral-400">Pending</span>
                  <span className="font-bold text-neutral-400 dark:text-neutral-600">
                    {steps.filter(s => s.status === "pending").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Panel>

          {/* No approval needed - workflow runs automatically */}
        </Canvas>
      </div>

      {/* Professional Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[680px] overflow-y-auto bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 p-0"
        >
          <div className="p-8 space-y-8">
            <SheetHeader className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  {selectedNode?.status === "completed" && <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-500" />}
                  {selectedNode?.status === "waiting" && <Clock className="h-7 w-7 text-amber-600 dark:text-amber-500" />}
                  {selectedNode?.status === "pending" && <Circle className="h-7 w-7 text-neutral-400 dark:text-neutral-600" />}
                </div>
                <div className="flex-1 pt-1">
                  <SheetTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {selectedNode?.label}
                  </SheetTitle>
                  <SheetDescription className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {selectedNode?.description}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
            
            {selectedNode && (
              <div className="space-y-8">
                {/* Status Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Status
                  </h4>
                  <div>
                    {selectedNode.status === "completed" && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 border-0 font-semibold">
                        Completed Successfully
                      </Badge>
                    )}
                    {selectedNode.status === "waiting" && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 border-0 font-semibold">
                        Waiting for Action
                      </Badge>
                    )}
                    {selectedNode.status === "pending" && (
                      <Badge className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 border-0 font-semibold">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Email Preview for email generation step */}
                {selectedNode.id === "email_gen" && selectedNode.data?.body && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      📧 Email Preview
                    </h4>
                    <div className="space-y-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">To</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedNode.data.to}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Subject</p>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {selectedNode.data.subject}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Message</p>
                        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                            {selectedNode.data.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Response Data */}
                {selectedNode.data && Object.keys(selectedNode.data).length > 0 && selectedNode.id !== "email_gen" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Response Data
                    </h4>
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5">
                      <pre className="text-xs overflow-x-auto text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                        {JSON.stringify(selectedNode.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {/* Show message if no data */}
                {(!selectedNode.data || Object.keys(selectedNode.data).length === 0) && selectedNode.status === "failed" && (
                  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-4">
                    <p className="text-sm text-red-900 dark:text-red-200">
                      This step failed. Check terminal logs for error details.
                    </p>
                  </div>
                )}
                
                {(!selectedNode.data || Object.keys(selectedNode.data).length === 0) && selectedNode.status === "running" && (
                  <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      This step is running. Data will appear when complete.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      💡 Check your terminal for real-time Pica API responses
                    </p>
                  </div>
                )}
                
                {(!selectedNode.data || Object.keys(selectedNode.data).length === 0) && selectedNode.status === "completed" && (
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-4">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Step completed but detailed data is not available.
                    </p>
                  </div>
                )}

                {/* Execution Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Execution Info
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Pica API Called</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Real data fetched via passthrough</p>
                      </div>
                    </div>
                    {selectedNode.data && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Response Data Available</p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {Object.keys(selectedNode.data).length} field(s) returned
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TimelineItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {icon}
      </div>
      <div className="flex-1 pt-1.5">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

async function approveEmail(runId: string, approved: boolean, email?: string) {
  try {
    // Use email-based token to match what workflow creates
    // Format: email_approval:email_address_cleaned
    const cleanEmail = (email || "unknown").replace(/[^a-zA-Z0-9]/g, "_");
    const token = `email_approval:${cleanEmail}`;
    
    console.log(`📧 Calling webhook with token: ${token}`);
    
    const response = await fetch(`/api/webhook/email-approval/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    
    if (response.ok) {
      alert(approved ? "✅ Email approved! Workflow will send email." : "❌ Email rejected - not sent");
    } else {
      const error = await response.json();
      console.error("Webhook error:", error);
      alert(`⚠️ ${error.error || "Failed to process approval"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error processing approval");
  }
}

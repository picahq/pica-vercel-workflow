"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function LeadForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start workflow");
      }

      console.log("Workflow started:", data);
      router.push(`/workflow/${data.runId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 shadow-2xl">
      <CardHeader className="space-y-4 text-center pb-8">
        {/* Avatar Group with Pica + Vercel logos */}
        <div className="flex justify-center -space-x-4">
          <div className="relative h-16 w-16 rounded-full ring-4 ring-white dark:ring-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-lg">
            <Image
              src="/pica-logo.svg"
              alt="Pica"
              width={40}
              height={40}
              className="dark:invert"
            />
          </div>
          <div className="relative h-16 w-16 rounded-full ring-4 ring-white dark:ring-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-lg">
            <Image
              src="/vercel-logo.svg"
              alt="Vercel"
              width={32}
              height={32}
              className="dark:invert"
            />
          </div>
        </div>
        <div className="space-y-3">
          <CardTitle className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Start Lead Enrichment
          </CardTitle>
          <CardDescription className="text-base text-neutral-600 dark:text-neutral-400">
            Enter lead information below to start the AI-powered enrichment workflow
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Sarah Chen"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-11 text-base bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="sarah@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-11 text-base bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Company Name
            </Label>
            <Input
              id="company"
              name="company"
              type="text"
              placeholder="Acme Corporation"
              value={formData.company}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-11 text-base bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full text-base font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-lg"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting Workflow...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Enrich Lead
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 shadow-sm">
          <h4 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Pipeline Steps:
          </h4>
          <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold">
                1
              </span>
              <span>AI researches company with Exa</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold">
                2
              </span>
              <span>Finds decision makers on LinkedIn</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold">
                3
              </span>
              <span>Creates enriched contact in Attio CRM</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold">
                4
              </span>
              <span>Logs analytics to Airtable</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold">
                5
              </span>
              <span>Generates email</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold">
                6
              </span>
              <span>Creates intelligence report in Notion</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 transition-all hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-lg">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:scale-105 shadow-sm">
      {children}
    </span>
  );
}

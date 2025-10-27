import { LeadForm } from "@/components/lead-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/pica-logo.svg"
              alt="Pica"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              AI Lead Enrichment
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-5xl space-y-20 py-20">
          
          {/* Hero Section */}
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium shadow-sm">
              <div className="flex items-center gap-2">
                <Image
                  src="/pica-logo.svg"
                  alt="Pica"
                  width={16}
                  height={16}
                  className="dark:invert"
                />
                <span className="text-neutral-700 dark:text-neutral-300">+</span>
                <Image
                  src="/vercel-logo.svg"
                  alt="Vercel"
                  width={16}
                  height={16}
                  className="dark:invert"
                />
                <span className="text-neutral-900 dark:text-neutral-100">Powered by Pica + Vercel Workflows</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-6xl lg:text-7xl">
              AI-Powered Lead
              <br />
              Enrichment Pipeline
            </h1>
            
            <p className="mx-auto max-w-2xl text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Automatically research companies, find decision makers, create CRM contacts, 
              and send personalized outreach—powered by AI workflows
            </p>
          </div>

          {/* Lead Form */}
          <LeadForm />

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🔍"
              title="AI Research"
              description="Deep company research with funding data, tech stack, and recent news using Exa AI"
            />
            <FeatureCard
              icon="👥"
              title="Decision Makers"
              description="Automatically discovers key executives and their LinkedIn profiles"
            />
            <FeatureCard
              icon="📊"
              title="CRM Integration"
              description="Creates enriched contacts in Attio with all research data"
            />
            <FeatureCard
              icon="📈"
              title="Analytics"
              description="Logs all enrichment data to Airtable for tracking and reporting"
            />
            <FeatureCard
              icon="✉️"
              title="Smart Email"
              description="Generates personalized outreach emails with human approval before sending"
            />
            <FeatureCard
              icon="📝"
              title="Intelligence Reports"
              description="Creates detailed lead reports in Notion with all findings"
            />
          </div>

          {/* Tech Stack */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-12 shadow-lg">
            <h3 className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Powered By
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <TechBadge>Vercel Workflows</TechBadge>
              <TechBadge>Pica</TechBadge>
              <TechBadge>Exa AI</TechBadge>
              <TechBadge>Attio</TechBadge>
              <TechBadge>Airtable</TechBadge>
              <TechBadge>Gmail</TechBadge>
              <TechBadge>Notion</TechBadge>
              <TechBadge>Next.js 16</TechBadge>
              <TechBadge>shadcn/ui</TechBadge>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-10">
        <div className="container mx-auto max-w-7xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span>Built with</span>
            <span className="text-red-500">❤️</span>
            <span>using</span>
            <Image
              src="/pica-logo.svg"
              alt="Pica"
              width={16}
              height={16}
              className="dark:invert inline"
            />
            <span>Pica and</span>
            <Image
              src="/vercel-logo.svg"
              alt="Vercel"
              width={16}
              height={16}
              className="dark:invert inline"
            />
            <span>Vercel Workflows</span>
          </div>
        </div>
      </footer>
    </div>
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
    <div className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 p-6 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 hover:scale-105">
      {children}
    </span>
  );
}

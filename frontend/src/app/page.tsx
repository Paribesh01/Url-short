import Link from "next/link";
import { BarChart3, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroShortener } from "@/components/landing/hero-shortener";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--brand),transparent_70%)] opacity-[0.12]"
          />

          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-20 pb-24 text-center sm:pt-28">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-brand" />
              Now with referrer &amp; geo analytics
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Short links that tell you the{" "}
              <span className="text-brand">whole story</span>.
            </h1>

            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Shorten any URL in seconds, then watch clicks, referrers, and geography
              roll in on a dashboard built for people who actually want to know what happens next.
            </p>

            <div className="mt-10 flex w-full justify-center">
              <HeroShortener />
            </div>

            <div className="mt-16 flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="size-4" />
              Every click tracked. Every link accountable.
            </div>
          </div>
        </section>

        <FeatureGrid />
        <HowItWorks />

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-border bg-card px-8 py-14 text-center sm:px-16">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Start shortening, start learning.
            </h2>
            <p className="max-w-md text-muted-foreground">
              Jump into the dashboard to create links, set custom codes, and explore
              analytics for everything you&apos;ve shortened.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-lg bg-brand px-6 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              Open the Dashboard
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

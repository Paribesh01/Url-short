"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClicksChart } from "@/components/dashboard/clicks-chart";
import { RankedList } from "@/components/dashboard/ranked-list";
import { RecentClicksTable } from "@/components/dashboard/recent-clicks-table";
import { QrCodeDialog } from "@/components/dashboard/qr-code-dialog";
import { getUrlAnalytics, ApiError } from "@/lib/api";
import { formatExactNumber } from "@/lib/format";
import type { UrlAnalytics } from "@/types";
import { toast } from "sonner";

function LinkAnalyticsContent() {
  const params = useParams<{ code: string }>();
  const shortCode = params.code;

  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shortCode) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await getUrlAnalytics(shortCode);
        if (cancelled) return;
        setAnalytics(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          toast.error("Couldn't load analytics. Is the Flask backend running?");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shortCode]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const shortUrl = `${baseUrl}/${shortCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-56 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </div>
          </div>
        ) : notFound || !analytics ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
            This short link doesn&apos;t exist.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-mono text-2xl font-semibold tracking-tight text-brand">
                  /{analytics.short_code}
                </h1>
                <a
                  href={analytics.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {analytics.original_url}
                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-semibold tracking-tight">
                    {formatExactNumber(analytics.total_clicks)}
                  </p>
                  <p className="text-xs text-muted-foreground">total clicks</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1.5">
                  <Copy className="size-3.5" />
                  Copy
                </Button>
                <QrCodeDialog url={shortUrl} />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clicks over time</CardTitle>
              </CardHeader>
              <CardContent>
                <ClicksChart data={analytics.clicks_over_time} />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top referrers</CardTitle>
                </CardHeader>
                <CardContent>
                  <RankedList
                    entries={analytics.top_referrers}
                    formatLabel={(label) => (label === "Unknown" ? "Direct" : label)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <RankedList entries={analytics.top_countries} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top browsers</CardTitle>
                </CardHeader>
                <CardContent>
                  <RankedList entries={analytics.top_browsers} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <RankedList entries={analytics.top_devices} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentClicksTable clicks={analytics.recent_clicks} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LinkAnalyticsPage() {
  return (
    <RequireAuth>
      <LinkAnalyticsContent />
    </RequireAuth>
  );
}

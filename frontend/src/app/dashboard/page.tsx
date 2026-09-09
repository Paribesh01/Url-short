"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { RequireAuth } from "@/components/require-auth";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CreateUrlForm } from "@/components/dashboard/create-url-form";
import { UrlTable } from "@/components/dashboard/url-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { getDashboardSummary, listShortUrls } from "@/lib/api";
import type { DashboardSummary, ShortUrl } from "@/types";
import { toast } from "sonner";

function DashboardContent() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const [urlList, summaryData] = await Promise.all([
          listShortUrls(),
          getDashboardSummary(),
        ]);
        if (cancelled) return;
        setUrls(urlList);
        setSummary(summaryData);
      } catch {
        if (!cancelled) {
          toast.error("Couldn't reach the API. Is the Flask backend running?");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredUrls = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return urls;
    return urls.filter(
      (url) =>
        url.short_code.toLowerCase().includes(query) ||
        url.original_url.toLowerCase().includes(query) ||
        url.title?.toLowerCase().includes(query)
    );
  }, [urls, search]);

  function handleCreated(url: ShortUrl) {
    setUrls((prev) => [url, ...prev]);
    setSummary((prev) =>
      prev ? { ...prev, total_urls: prev.total_urls + 1 } : prev
    );
  }

  function handleDeleted(shortCode: string) {
    const deleted = urls.find((u) => u.short_code === shortCode);
    setUrls((prev) => prev.filter((u) => u.short_code !== shortCode));
    setSummary((prev) =>
      prev && deleted
        ? {
            ...prev,
            total_urls: Math.max(0, prev.total_urls - 1),
            total_clicks: Math.max(0, prev.total_clicks - deleted.click_count),
          }
        : prev
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your short links, and keep an eye on how they perform.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-8">
            <StatsCards
              totalUrls={summary?.total_urls ?? 0}
              totalClicks={summary?.total_clicks ?? 0}
            />
            <CreateUrlForm onCreated={handleCreated} />
            <div>
              <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="text-lg font-medium">Your links</h2>
                {urls.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search links…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                )}
              </div>
              <UrlTable urls={filteredUrls} onDeleted={handleDeleted} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

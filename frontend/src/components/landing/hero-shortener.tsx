"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createShortUrl, ApiError } from "@/lib/api";
import type { ShortUrl } from "@/types";

export function HeroShortener() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortUrl | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const shortUrl = await createShortUrl({ url: url.trim() });
      setResult(shortUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="url"
          required
          placeholder="Paste a long URL to shorten it…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-12 flex-1 text-base"
        />
        <Button type="submit" size="lg" disabled={loading} className="h-12 gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Shorten it"}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <a
            href={result.short_url}
            target="_blank"
            rel="noreferrer"
            className="truncate font-mono text-sm font-medium text-brand hover:underline"
          >
            {result.short_url}
          </a>
          <Button type="button" size="sm" variant="secondary" onClick={handleCopy} className="gap-1.5 shrink-0">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        No signup needed. Want custom codes and analytics dashboards?{" "}
        <Link href="/dashboard" className="font-medium text-foreground underline underline-offset-2">
          Open the dashboard
        </Link>
        .
      </p>
    </div>
  );
}

import Link from "next/link";
import { Link2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <Link2 className="size-3.5" />
          </span>
          Snip
        </div>
        <p>Short links with real analytics. Built with Next.js, Flask, Postgres, and Redis.</p>
        <Link href="/dashboard" className="transition-colors hover:text-foreground">
          Open Dashboard →
        </Link>
      </div>
    </footer>
  );
}

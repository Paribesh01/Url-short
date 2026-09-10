import { Smartphone } from "lucide-react";
import { ANDROID_APP_URL } from "@/lib/app-links";

export function DownloadApp() {
  return (
    <section id="mobile-app" className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card px-8 py-14 text-center sm:px-16">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Take Snip with you.
          </h2>
          <p className="max-w-md text-muted-foreground">
            Create and track short links on the go with the Snip app for Android.
          </p>
        </div>

        <a
          href={ANDROID_APP_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-3 transition-colors hover:bg-accent"
        >
          <Smartphone className="size-7" />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-xs text-muted-foreground">Download for</span>
            <span className="text-sm font-medium">Android</span>
          </span>
        </a>

        <p className="max-w-md text-xs text-muted-foreground">
          This is an early build, not a Play Store listing yet — Android will
          warn about installing from outside the Play Store. That&apos;s expected.
        </p>
      </div>
    </section>
  );
}

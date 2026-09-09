"use client";

import { Apple, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { IOS_APP_URL, ANDROID_APP_URL } from "@/lib/app-links";

function DownloadButton({
  href,
  icon: Icon,
  eyebrow,
  label,
}: {
  href: string;
  icon: typeof Apple;
  eyebrow: string;
  label: string;
}) {
  function handleClick(e: React.MouseEvent) {
    if (!href) {
      e.preventDefault();
      toast.info("Coming soon", {
        description: `The ${label} isn't published yet — check back soon.`,
      });
    }
  }

  return (
    <a
      href={href || "#"}
      onClick={handleClick}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3 transition-colors hover:bg-accent"
    >
      <Icon className="size-7" />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-xs text-muted-foreground">{eyebrow}</span>
        <span className="text-sm font-medium">{label}</span>
      </span>
    </a>
  );
}

export function DownloadApp() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card px-8 py-14 text-center sm:px-16">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Take Snip with you.
          </h2>
          <p className="max-w-md text-muted-foreground">
            Create and track short links on the go with the Snip app for iOS and Android.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <DownloadButton
            href={IOS_APP_URL}
            icon={Apple}
            eyebrow="Download on the"
            label="App Store"
          />
          <DownloadButton
            href={ANDROID_APP_URL}
            icon={Smartphone}
            eyebrow="Get it on"
            label="Google Play"
          />
        </div>
      </div>
    </section>
  );
}

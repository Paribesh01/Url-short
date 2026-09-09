import { BarChart3, Globe2, Link2, Zap } from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Clean, short links",
    description: "Turn long, messy URLs into short links you can actually read, share, and remember. Custom codes supported.",
  },
  {
    icon: BarChart3,
    title: "Real click analytics",
    description: "See total clicks, daily trends, and recent activity for every link — no third-party tracker required.",
  },
  {
    icon: Globe2,
    title: "Referrer & geo insight",
    description: "Know where traffic comes from: which sites referred it, and which countries and cities it's arriving from.",
  },
  {
    icon: Zap,
    title: "Redis-cached redirects",
    description: "Redirect lookups are cached in Redis, so your links resolve fast even as traffic grows.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to know about your links
        </h2>
        <p className="mt-4 text-muted-foreground">
          Snip doesn&apos;t just shorten URLs — it tells you exactly how they perform.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <feature.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

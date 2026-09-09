const steps = [
  {
    step: "01",
    title: "Paste your long URL",
    description: "Drop any link into the box above. Add a custom code if you want a branded, memorable path.",
  },
  {
    step: "02",
    title: "Share your short link",
    description: "Send it anywhere — social posts, emails, QR codes. Every click is tracked automatically.",
  },
  {
    step: "03",
    title: "Watch the dashboard",
    description: "See clicks over time, top referrers, countries, browsers, and devices update in real time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps. Zero friction.
          </h2>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step}>
              <span className="text-sm font-mono font-semibold text-brand">{item.step}</span>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

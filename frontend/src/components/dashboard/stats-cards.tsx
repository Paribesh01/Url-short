import { BarChart3, Link2, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatExactNumber } from "@/lib/format";

interface StatsCardsProps {
  totalUrls: number;
  totalClicks: number;
}

export function StatsCards({ totalUrls, totalClicks }: StatsCardsProps) {
  const avgClicks = totalUrls > 0 ? Math.round((totalClicks / totalUrls) * 10) / 10 : 0;

  const stats = [
    { label: "Total short links", value: formatExactNumber(totalUrls), icon: Link2 },
    { label: "Total clicks", value: formatExactNumber(totalClicks), icon: MousePointerClick },
    { label: "Avg. clicks per link", value: formatExactNumber(avgClicks), icon: BarChart3 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

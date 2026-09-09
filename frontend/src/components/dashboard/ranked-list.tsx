import { Progress } from "@/components/ui/progress";
import { formatExactNumber } from "@/lib/format";
import type { CountEntry } from "@/types";

interface RankedListProps {
  entries: CountEntry[];
  emptyLabel?: string;
  /** Normalize raw backend labels to a friendlier display string. */
  formatLabel?: (label: string) => string;
}

export function RankedList({ entries, emptyLabel = "No data yet", formatLabel }: RankedListProps) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...entries.map((e) => e.count));

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-foreground">
              {formatLabel ? formatLabel(entry.label) : entry.label}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatExactNumber(entry.count)}
            </span>
          </div>
          <Progress value={(entry.count / max) * 100} className="h-1.5" />
        </li>
      ))}
    </ul>
  );
}

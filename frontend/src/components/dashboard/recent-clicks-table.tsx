import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, referrerLabel } from "@/lib/format";
import type { RecentClick } from "@/types";

interface RecentClicksTableProps {
  clicks: RecentClick[];
}

export function RecentClicksTable({ clicks }: RecentClicksTableProps) {
  if (clicks.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No clicks recorded yet. Share your link to see activity here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Referrer</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Browser</TableHead>
            <TableHead>Device</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clicks.map((click) => (
            <TableRow key={click.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {formatDateTime(click.clicked_at)}
              </TableCell>
              <TableCell className="text-sm">{referrerLabel(click.referrer)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {click.city && click.city !== "Unknown" && click.city !== "Local"
                  ? `${click.city}, ${click.country}`
                  : click.country || "Unknown"}
              </TableCell>
              <TableCell className="text-sm">{click.browser}</TableCell>
              <TableCell>
                <Badge variant="outline">{click.device_type}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

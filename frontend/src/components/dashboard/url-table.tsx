"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, MoreHorizontal, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QrCodeContent } from "@/components/dashboard/qr-code-content";
import { deleteShortUrl, ApiError } from "@/lib/api";
import { formatExactNumber, timeAgo, truncateUrl } from "@/lib/format";
import type { ShortUrl } from "@/types";
import { toast } from "sonner";

interface UrlTableProps {
  urls: ShortUrl[];
  onDeleted: (shortCode: string) => void;
}

export function UrlTable({ urls, onDeleted }: UrlTableProps) {
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  async function handleCopy(shortUrl: string) {
    await navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard");
  }

  async function handleDelete(shortCode: string) {
    setDeletingCode(shortCode);
    try {
      await deleteShortUrl(shortCode);
      onDeleted(shortCode);
      toast.success("Link deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete link.");
    } finally {
      setDeletingCode(null);
    }
  }

  if (urls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No short links yet. Create your first one above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short link</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url) => (
            <TableRow key={url.id}>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/${url.short_code}`}
                      className="font-mono text-sm font-medium text-brand hover:underline"
                    >
                      /{url.short_code}
                    </Link>
                    {url.is_expired && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Expired
                      </Badge>
                    )}
                  </div>
                  {url.title && (
                    <span className="text-xs text-muted-foreground">{url.title}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <a
                  href={url.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {truncateUrl(url.original_url)}
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{formatExactNumber(url.click_count)}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {timeAgo(url.created_at)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCopy(url.short_url)}>
                      <Copy className="size-4" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setQrUrl(url.short_url)}>
                      <QrCode className="size-4" />
                      QR code
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/${url.short_code}`}>
                        <ExternalLink className="size-4" />
                        View analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={deletingCode === url.short_code}
                      onClick={() => handleDelete(url.short_code)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={qrUrl !== null} onOpenChange={(open) => !open && setQrUrl(null)}>
        <DialogContent className="sm:max-w-xs">{qrUrl && <QrCodeContent url={qrUrl} />}</DialogContent>
      </Dialog>
    </div>
  );
}

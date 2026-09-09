"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QrCodeContent } from "@/components/dashboard/qr-code-content";

interface QrCodeDialogProps {
  url: string;
  triggerSize?: "icon" | "sm";
}

export function QrCodeDialog({ url, triggerSize = "sm" }: QrCodeDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerSize === "icon" ? (
          <Button variant="ghost" size="icon" className="size-8" aria-label="Show QR code">
            <QrCode className="size-4" />
          </Button>
        ) : (
          <Button variant="secondary" size="sm" className="gap-1.5">
            <QrCode className="size-3.5" />
            QR code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">{open && <QrCodeContent url={url} />}</DialogContent>
    </Dialog>
  );
}

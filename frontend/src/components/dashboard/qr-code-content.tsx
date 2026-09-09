import { QRCodeSVG } from "qrcode.react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QrCodeContentProps {
  url: string;
}

/** Shared body for a QR-code dialog: a title, the URL, and the code itself
 * on a fixed white background so it stays scannable in dark mode. */
export function QrCodeContent({ url }: QrCodeContentProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Scan to open</DialogTitle>
        <DialogDescription className="font-mono text-xs break-all">{url}</DialogDescription>
      </DialogHeader>
      <div className="flex justify-center rounded-xl border border-border bg-white p-6">
        <QRCodeSVG value={url} size={200} marginSize={0} />
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { Clock, Download } from "lucide-react";

export default function MealQRModal({
  open,
  token,
  expiresIn,
  onClose,
}: {
  open: boolean;
  token: string | null;
  expiresIn: number;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = useState<number>(expiresIn);
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!open) return;

    setRemaining(expiresIn);
    if (expiresIn === 0) return;

    const timer = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, expiresIn]);

  if (!open || !token) return null;

  

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current;
    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "meal-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle>Scan at Mess Counter</DialogTitle>
          <DialogDescription>
            Single-use secure QR
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 flex flex-col items-center gap-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <QRCodeCanvas
              ref={qrRef}
              value={token}
              size={320}
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>

          {expiresIn > 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} />
              Expires in{" "}
              <span className="font-medium">{remaining}s</span>
            </div>
          ) : (
            <div className="text-xs font-medium text-emerald-600">
              Valid until scanned
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleDownloadQR}
              className="flex-1 flex items-center gap-2"
            >
              <Download size={14} />
              Download QR
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

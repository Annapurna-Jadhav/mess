import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  open: boolean;
  onClose: () => void;
  token: string | null;
  expiresIn: number;
};

export default function QRCodeModal({
  open,
  onClose,
  token,
  expiresIn,
}: Props) {
  const [remaining, setRemaining] = useState(expiresIn);

  useEffect(() => {
    if (!open || !token) return;

    setRemaining(expiresIn);

    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, token, expiresIn, onClose]);

  if (!open || !token) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold">
            Meal QR Code
          </h2>

          <div className="flex justify-center bg-white p-4 rounded-xl">
            <QRCodeCanvas value={token} size={200} />
          </div>

          <p className="text-xs text-muted-foreground">
            Expires in <b>{remaining}s</b>
          </p>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

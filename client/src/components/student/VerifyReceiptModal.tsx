import { useState } from "react";
import toast from "react-hot-toast";
import jsQR from "jsqr";

import { verifyReceiptApi } from "@/api/student.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";


interface VerifyReceiptModalProps {
  onSuccess?: () => void; 
}



const VerifyReceiptModal = ({ onSuccess }: VerifyReceiptModalProps) => {
 
  const [file, setFile] = useState<File | null>(null);
  const [qrDetected, setQrDetected] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const scanQRFromImage = async (file: File): Promise<boolean> => {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return Boolean(jsQR(imageData.data, canvas.width, canvas.height));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setQrDetected(false);
    setQrError(null);

    try {
      const detected = await scanQRFromImage(selected);
      setQrDetected(detected);

      if (!detected) {
        setQrError("QR not clearly detected — server will still verify");
      }
    } catch {
      setQrError("Unable to scan QR locally — server will verify");
    }
  };

  /* ---------- Verify ---------- */
  const handleVerify = async () => {
    if (!file) {
      toast.error("Please upload a receipt image");
      return;
    }

    try {
      setVerifying(true);
      await verifyReceiptApi(file);
      toast.success("Receipt verified successfully");

      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Receipt verification failed"
      );
    } finally {
      setVerifying(false);
    }
  };



  return (
    <Card
      className="
        w-full max-w-md
        rounded-2xl
        border border-border
        bg-background
        shadow-xl
        transition
      "
    >
      <CardHeader className="text-center space-y-2">
        <Badge className="mx-auto bg-primary/10 text-primary">
          NITK Smart Mess Card
        </Badge>

        <CardTitle className="text-2xl font-bold tracking-tight">
          Verify Hostel Receipt
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          Upload your hostel receipt to activate mess credits
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload box */}
        <label
          htmlFor="receipt-upload"
          className="
            group flex flex-col items-center justify-center gap-2
            rounded-xl border-2 border-dashed
            p-6 cursor-pointer
            transition-all
            hover:border-primary
            hover:bg-primary/5
            focus-within:ring-2 focus-within:ring-primary/40
          "
        >
          <Upload className="text-primary transition group-hover:scale-105" />

          <p className="text-sm font-medium">
            {file ? "Receipt selected" : "Upload / Capture Receipt"}
          </p>

          <p className="text-xs text-muted-foreground text-center">
            {file ? file.name : "QR code will be scanned automatically"}
          </p>

          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Status */}
        {qrDetected && (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
            <CheckCircle2 size={16} />
            QR detected
          </div>
        )}

        {qrError && (
          <div className="flex items-center justify-center gap-2 text-amber-500 text-xs">
            <AlertTriangle size={14} />
            {qrError}
          </div>
        )}

        {/* Action */}
        <Button
          className="w-full transition active:scale-[0.98]"
          onClick={handleVerify}
          disabled={!file || verifying}
        >
          {verifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            "Verify Receipt"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerifyReceiptModal;

import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import axiosClient from "@/api/axiosClient";

export default function ScanQRPanel({
  onScanSuccess,
}: {
  onScanSuccess: (result: any) => void;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------- IMAGE STATE ---------- */
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  /* ================= CAMERA SCAN ================= */

  const startCameraScan = async () => {
    if (scanning || loading) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    setScanning(true);

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await stopScan();
          await submitToken(decodedText);
        },
        () => {}
      );
    } catch (err) {
      alert("Camera access failed");
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  /* ================= TOKEN SUBMIT ================= */

  const submitToken = async (token: string) => {
    setLoading(true);
    try {
      const res = await axiosClient.post(
        "/mess-manager/scan",
        { token }
      );
      onScanSuccess(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= IMAGE UPLOAD ================= */

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submitImage = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("qrImage", file);

    setLoading(true);

    try {
      const res = await axiosClient.post(
        "/mess-manager/scan-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onScanSuccess(res.data.data);
      clearImage();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "QR not detected in image"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-5">

      {/* CAMERA BUTTON */}
      <Button
        onClick={startCameraScan}
        disabled={scanning || loading}
        className="w-full flex gap-2"
      >
        <Camera size={16} />
        Scan using Camera
      </Button>

      {/* CAMERA VIEW */}
      {scanning && (
        <div className="relative">
          <div
            id="qr-reader"
            className="rounded-lg overflow-hidden border"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={stopScan}
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* IMAGE UPLOAD */}
      <div className="space-y-3">
        <label className="block">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            className="w-full flex gap-2"
            asChild
          >
            <span>
              <Upload size={16} />
              Upload QR Image
            </span>
          </Button>
        </label>

        {/* IMAGE PREVIEW */}
        {preview && (
          <div className="rounded-xl border p-3 space-y-3">
            <img
              src={preview}
              alt="QR Preview"
              className="rounded-lg max-h-64 mx-auto"
            />

            <div className="flex gap-2">
              <Button
                onClick={submitImage}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Scan Image"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={clearImage}
                disabled={loading}
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import axiosClient from "@/api/axiosClient";

export default function ScanQRPanel({
  onScanSuccess,
}: {
  onScanSuccess: (result: any) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);



  const startCamera = async () => {
    try {
      setCameraOn(true); 

      await new Promise((r) => setTimeout(r, 50));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      await videoRef.current.play();
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access failed. Please allow permission.");
      setCameraOn(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("qrImage", blob, "camera-capture.png");

      setLoading(true);
      try {
        const res = await axiosClient.post(
          "/mess-manager/scan-image",
          formData
        );
        onScanSuccess(res.data.data);
        stopCamera();
      } catch (err: any) {
        alert(err.response?.data?.message || "QR not detected");
      } finally {
        setLoading(false);
      }
    });
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        formData
      );
      onScanSuccess(res.data.data);
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Scan failed");
      setFile(null);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center gap-6">

      <div className="w-full max-w-md space-y-4">

        {!cameraOn && !preview && (
          <Button
            onClick={startCamera}
            disabled={loading}
            className="w-full h-12 text-base gap-2"
          >
            <Camera size={18} />
            Start Camera Scan
          </Button>
        )}

        {cameraOn && (
          <div className="space-y-3">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border bg-black shadow-lg">

              {/* LIVE FEED */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* FOCUS FRAME */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-44 border-2 border-white/80 rounded-xl shadow-[0_0_0_2000px_rgba(0,0,0,0.4)]" />
              </div>

              {/* INSTRUCTION */}
              <div className="absolute bottom-3 w-full text-center text-xs text-white/90">
                Place QR inside the box
              </div>
            </div>

            <canvas ref={canvasRef} hidden />

            <div className="flex gap-2">
              <Button
                onClick={captureAndScan}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Capture & Scan"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={stopCamera}
                disabled={loading}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* IMAGE UPLOAD FALLBACK */}
        {!cameraOn && !preview && (
          <label>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              className="w-full h-11 gap-2"
              asChild
            >
              <span>
                <Upload size={16} />
                Upload QR Image
              </span>
            </Button>
          </label>
        )}

        {/* IMAGE PREVIEW */}
        {preview && (
          <div className="rounded-xl border p-3 space-y-3">
            <img
              src={preview}
              alt="QR preview"
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
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                disabled={loading}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

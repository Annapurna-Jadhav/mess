import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import ScanQRPanel from "@/components/mess/ScanQRPanel";
import { ScanResultCard } from "@/components/mess/ScanResultCard";

type ScanResult = {
  studentName: string;
  studentRoll: string;
  mealType: string;
  date: string;
  messId: string;
};

export default function ScanMeal() {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: ScanResult;
  } | null>(null);

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-6">

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Scan Student Meal QR
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <ScanQRPanel
            onScanSuccess={(data) => {
              setResult({
                success: true,
                message: "Meal marked as served",
                data,
              });
            }}
          />
        </CardContent>
      </Card>

      
      {result && <ScanResultCard {...result} />}
    </div>
  );
}

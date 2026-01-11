import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScanResultCard({
  success,
  message,
  data,
  onNextScan,
}: {
  success: boolean;
  message: string;
  data?: any;
  onNextScan?: () => void;
}) {
  return (
    <div
      className={`
        rounded-2xl border p-5 space-y-5 shadow-sm
        transition-all
        ${
          success
            ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
            : "border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
        }
      `}
    >
  
      <div className="flex items-center gap-3">
        {success ? (
          <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={28} />
        ) : (
          <XCircle className="text-red-600 dark:text-red-400" size={28} />
        )}

        <div>
          <p className="font-semibold text-base leading-tight">
            {message}
          </p>
          <p className="text-xs opacity-80">
            {success
              ? "Meal entry recorded successfully"
              : "Scan failed. Please try again."}
          </p>
        </div>
      </div>

   
      {success && data && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <span className="opacity-70">Student</span>
          <span className="font-medium">{data.studentName}</span>

          <span className="opacity-70">Roll No</span>
          <span className="font-medium">{data.studentRoll}</span>

          <span className="opacity-70">Meal</span>
          <span className="font-medium capitalize">{data.mealType}</span>

          <span className="opacity-70">Date</span>
          <span className="font-medium">{data.date}</span>
        </div>
      )}

    
      {success && onNextScan && (
        <Button
          onClick={onNextScan}
          className="
            w-full h-11 mt-2
            flex items-center justify-center gap-2
            text-base font-medium
          "
        >
          Confirm & Scan Next
          <ArrowRight size={18} />
        </Button>
      )}
    </div>
  );
}

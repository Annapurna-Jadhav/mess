import { CheckCircle, XCircle } from "lucide-react";

export function ScanResultCard({
  success,
  message,
  data,
}: {
  success: boolean;
  message: string;
  data?: any;
}) {
  return (
    <div
      className={`
        rounded-xl border p-4
        ${success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}
      `}
    >
      <div className="flex items-center gap-2">
        {success ? (
          <CheckCircle className="text-emerald-600" size={18} />
        ) : (
          <XCircle className="text-red-600" size={18} />
        )}

        <p className="font-medium">{message}</p>
      </div>

      {success && data && (
        <div className="mt-3 text-sm text-muted-foreground space-y-1">
          <p><b>Student:</b> {data.studentName}</p>
          <p><b>Roll:</b> {data.studentRoll}</p>
          <p><b>Meal:</b> {data.mealType}</p>
          <p><b>Date:</b> {data.date}</p>
        </div>
      )}
    </div>
  );
}


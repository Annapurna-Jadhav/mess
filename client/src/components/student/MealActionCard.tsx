import { Button } from "@/components/ui/button";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";
import { MEAL_META } from "@/constants/Meal.constants";
import type { MealType } from "@/types/meal.types";

export default function MealActionCard({
  meal,
  price,
  status,
  canDeclareAbsent,
  canGenerateQR,
  onDeclareAbsent,
  onGenerateQR,
}: {
  meal: MealType;
  price: number;
  status: string;
  canDeclareAbsent: boolean;
  canGenerateQR: boolean;
  onDeclareAbsent: () => void;
  onGenerateQR: () => void; 
}) {
  const { label, time12h, Icon } = MEAL_META[meal];

  const isCompleted =
    status === "SERVED" ||
    status === "DECLARED_ABSENT" ||
    status === "NO_SHOW";

  return (
    <div className="w-full max-w-xl rounded-2xl border bg-card px-5 py-4 transition hover:shadow-md">
      {/* HEADER */}
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 rounded-xl bg-[#6770d2]/10 flex items-center justify-center">
            <Icon size={20} className="text-[#6770d2]" />
          </div>
          <div>
            <p className="font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{time12h}</p>
          </div>
        </div>
        <p className="font-semibold text-sm">₹{price}</p>
      </div>

      {/* STATUS */}
      <div className="mt-3 min-h-[22px]">
        {status === "SERVED" && (
          <div className="flex items-center gap-1 text-emerald-600 text-sm">
            <CheckCircle size={14} /> Served
          </div>
        )}

        {status === "DECLARED_ABSENT" && (
          <div className="flex items-center gap-1 text-blue-600 text-sm">
            <CheckCircle size={14} /> Declared Absent
          </div>
        )}

        {status === "NO_SHOW" && (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <XCircle size={14} /> No Show (Penalty)
          </div>
        )}

        {status === "NONE" &&
          !canDeclareAbsent &&
          !canGenerateQR && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Lock size={14} /> Actions locked
            </div>
          )}
      </div>

      {/* ACTIONS */}
      <div className="mt-4 flex gap-3">
        <Button
          onClick={onDeclareAbsent}
          disabled={!canDeclareAbsent || isCompleted}
          className={`flex-1 h-10 ${
            canDeclareAbsent && !isCompleted
              ? "bg-[#6770d2] hover:bg-[#5660c9] text-white"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {status === "DECLARED_ABSENT"
            ? "Absent Declared"
            : "Declare Absent"}
        </Button>

      <Button
  onClick={onGenerateQR}
  disabled={
    isCompleted || (status === "NONE" && !canGenerateQR)
  }
  className={`flex-1 h-10 flex items-center justify-center gap-2 transition-all ${
    status === "QR_GENERATED"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : canGenerateQR && status === "NONE"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : "bg-muted text-muted-foreground cursor-not-allowed"
  }`}
>
  <QrCode size={16} />

  {status === "QR_GENERATED"
    ? "Show QR"
    : status === "SERVED"
    ? "Served"
    : canGenerateQR
    ? "Generate QR"
    : "QR Locked"}
</Button>

      </div>
    </div>
  );
}

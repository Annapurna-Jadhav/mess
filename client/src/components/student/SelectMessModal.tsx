import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

import { getApprovedMesses } from "@/api/admin.api";
import { selectMess, getMyStudentProfile } from "@/api/student.api";


type Mess = {
  id: string;
  messName: string;
  campusType: "BOYS" | "GIRLS" | "BOTH";
  estimatedCredits: number;
  penaltyPercent: number;
  studentCount?: number;
  isActive: boolean;

  prices: {
    breakfast: number;
    lunch: number;
    snacks: number;
    dinner: number;
    grandDinner: number;
  };

  operation: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
};

interface Props {
  open: boolean;
  onClose: () => void;
}

/* ================= COMPONENT ================= */

export default function SelectMessModal({ open, onClose }: Props) {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loadingMesses, setLoadingMesses] = useState(true);

  const [student, setStudent] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const [selectingId, setSelectingId] = useState<string | null>(null);

  /* ---------- LOAD STUDENT PROFILE ---------- */
  useEffect(() => {
    if (!open) return;

    setLoadingStudent(true);
    getMyStudentProfile()
      .then((res) => setStudent(res.data))
      .finally(() => setLoadingStudent(false));
  }, [open]);

  /* ---------- LOAD MESSES ---------- */
  useEffect(() => {
    if (!open) return;

    setLoadingMesses(true);
    getApprovedMesses()
      .then((res) => setMesses(res.data.messes ?? res.data))
      .finally(() => setLoadingMesses(false));
  }, [open]);

  const handleSelect = async (messId: string) => {
    try {
      setSelectingId(messId);
      await selectMess(messId);
      toast.success("Mess selected successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Selection failed");
    } finally {
      setSelectingId(null);
    }
  };

  const isLoading = loadingMesses || loadingStudent;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl rounded-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between">
  <h2 className="text-2xl font-bold text-[#6770d2]">
    Select Your Mess
  </h2>

  {!isLoading && (
    <span className="text-sm text-muted-foreground">
      {messes.length} mess{messes.length !== 1 && "es"} available
    </span>
  )}
</div>


        {isLoading && (
          <p className="text-muted-foreground mt-6">Loading available messes…</p>
        )}

        {!isLoading && messes.length === 0 && (
          <div className="border border-dashed rounded-xl p-10 text-center text-muted-foreground mt-6">
            No messes available
          </div>
        )}

        {/* MESS LIST */}
        {!isLoading && (
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">


            {messes.map((mess) => {
              const insufficientCredits =
                student &&
                student.initialCredits < mess.estimatedCredits;

              const disabled =
                !mess.isActive || insufficientCredits || selectingId !== null;
                

              return (
                
            <Card
  key={mess.id}
  className="
    group
    rounded-2xl
    border border-muted/40
    bg-background
    transition-all duration-300
    hover:shadow-lg
    hover:border-[#6770d2]/40
  "
>
  <CardContent className="px-6 py-4 text-sm">

   
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold group-hover:text-[#6770d2] transition">
          {mess.messName}
        </h3>
       <p className="text-xs text-muted-foreground">
  {mess.operation
    ? `${mess.operation.startDate} → ${mess.operation.endDate}`
    : "Operation dates not set"}
</p>

      </div>

      <Badge variant="outline">{mess.campusType}</Badge>
    </div>

    <div className="mt-4 grid grid-cols-5 gap-3 text-xs text-center">

      <Meal label="Breakfast" price={mess.prices.breakfast} />
      <Meal label="Lunch" price={mess.prices.lunch} />
      <Meal label="Snacks" price={mess.prices.snacks} />
      <Meal label="Dinner" price={mess.prices.dinner} />
      <Meal label="Grand Dinner" price={mess.prices.grandDinner} />

    </div>

   
    <div className="mt-4 flex items-center justify-between">

      <div className="flex gap-6 text-xs">
        <div>
          <p className="text-muted-foreground">Penalty</p>
          <p className="font-medium">{mess.penaltyPercent}%</p>
        </div>

        <div>
          <p className="text-muted-foreground">Required Credits</p>
          <p className="font-semibold text-[#6770d2]">
            ₹{mess.estimatedCredits}
          </p>
        </div>
      </div>

      <Button
        disabled={disabled}
        onClick={() => handleSelect(mess.id)}
        className="
          min-w-[140px]
          bg-[#6770d2]
          hover:bg-[#5b63c7]
        "
      >
        {selectingId === mess.id ? "Selecting…" : "Apply"}
      </Button>
    </div>

    {insufficientCredits && (
      <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
        Insufficient credits
      </div>
    )}

  </CardContent>
</Card>



              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
const Meal = ({ label, price }: { label: string; price: number }) => (
  <div className="rounded-lg border border-muted/40 py-2 px-1 text-center">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className="font-semibold text-sm">₹{price}</p>
  </div>
);

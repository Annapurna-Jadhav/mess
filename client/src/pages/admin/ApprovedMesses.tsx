import { useEffect, useState } from "react";
import { getApprovedMesses } from "@/api/admin.api";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

/* ================= TYPES ================= */

type FoodType = "VEG" | "NON_VEG" | "BOTH";

type Mess = {
  id: string;
  messName: string;
  campusType: "BOYS" | "GIRLS" | "BOTH";
  foodType: FoodType;

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
  };

  estimatedCredits?: number;
  studentCount?: number;
};

/* ================= STYLES ================= */

const foodBadgeClass: Record<FoodType, string> = {
  VEG: "bg-green-500/10 text-green-700 border border-green-500/30",
  NON_VEG: "bg-red-500/10 text-red-700 border border-red-500/30",
  BOTH: "bg-[#6770d2]/10 text-[#6770d2] border border-[#6770d2]/30",
};

/* ================= COMPONENT ================= */

export default function ApprovedMesses() {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);

  useEffect(() => {
  getApprovedMesses()
    .then((res) => {
      setMesses(res.data?.messes ?? []);
    })
    .catch(() => setMesses([]));
}, []);

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#6770d2]">
          Approved Messes
        </h1>
        <p className="text-muted-foreground text-sm">
          Active messes approved by hostel office
        </p>
      </div>

      {/* EMPTY STATE */}
      {messes.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No approved messes found
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {messes.map((mess) => (
          <Card
            key={mess.id}
            className="
              group relative overflow-hidden
              border border-border
              transition-all duration-300
              hover:-translate-y-1.5
              hover:shadow-2xl
              hover:border-[#6770d2]/40
            "
          >
            {/* Hover glow */}
            <div
              className="
                pointer-events-none absolute inset-0
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                bg-gradient-to-br from-[#6770d2]/5 via-transparent to-transparent
              "
            />

            <CardContent className="relative p-4 space-y-4 text-sm">

              {/* HEADER */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="
                  font-semibold leading-tight
                  transition-colors
                  group-hover:text-[#6770d2]
                ">
                  {mess.messName}
                </h2>

                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {mess.campusType}
                </Badge>
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${foodBadgeClass[mess.foodType]}
                  `}
                >
                  {mess.foodType === "BOTH"
                    ? "VEG & NON-VEG"
                    : mess.foodType}
                </span>

                <Badge variant="secondary" className="text-xs">
                  {mess.studentCount ?? 0} Students
                </Badge>
              </div>

              <Separator className="opacity-60" />

              {/* INFO */}
              <div className="space-y-1 text-muted-foreground">
               <p className="text-xs">
  {mess.operation?.startDate ?? "N/A"} →{" "}
  {mess.operation?.endDate ?? "N/A"}
</p>

                <p className="font-medium text-[#6770d2]">
                  Estimated Credits: ₹{mess.estimatedCredits ?? 0}
                </p>
              </div>

              {/* ACTION */}
              <Button
                variant="outline"
                size="sm"
                className="
                  w-full mt-2
                  border-[#6770d2]/40
                  text-[#6770d2]
                  transition-all
                  hover:bg-[#6770d2]/10
                  hover:border-[#6770d2]
                  hover:scale-[1.02]
                "
                onClick={() => setSelectedMess(mess)}
              >
                View Details →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DETAILS MODAL */}
      <Dialog
        open={!!selectedMess}
        onOpenChange={() => setSelectedMess(null)}
      >
        <DialogContent className="max-w-xl rounded-2xl shadow-2xl">
          {selectedMess && (
            <div className="space-y-6">

              {/* TITLE */}
              <div>
                <h2 className="text-xl font-bold text-[#6770d2]">
                  {selectedMess.messName}
                </h2>

                <div className="flex gap-2 mt-2">
                  <Badge>{selectedMess.campusType}</Badge>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${foodBadgeClass[selectedMess.foodType]}
                    `}
                  >
                    {selectedMess.foodType === "BOTH"
                      ? "VEG & NON-VEG"
                      : selectedMess.foodType}
                  </span>
                </div>
              </div>

              <Separator />

              {/* PRICING */}
              <div>
                <h3 className="font-semibold mb-2">
                  Meal Pricing
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Breakfast: ₹{selectedMess.prices.breakfast}</p>
                  <p>Lunch: ₹{selectedMess.prices.lunch}</p>
                  <p>Snacks: ₹{selectedMess.prices.snacks}</p>
                  <p>Dinner: ₹{selectedMess.prices.dinner}</p>
                  <p className="col-span-2">
                    Grand Dinner: ₹{selectedMess.prices.grandDinner}
                  </p>
                </div>
              </div>

              <Separator />

              {/* META */}
              <div className="text-sm space-y-1">
              <p>
  Validity:{" "}
  {selectedMess.operation?.startDate ?? "N/A"} →{" "}
  {selectedMess.operation?.endDate ?? "N/A"}
</p>

                <p>
                  Students Enrolled: {selectedMess.studentCount ?? 0}
                </p>
                <p className="font-semibold text-[#6770d2]">
                  Estimated Credits: ₹
                  {selectedMess.estimatedCredits ?? 0}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

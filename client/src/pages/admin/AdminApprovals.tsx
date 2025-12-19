// pages/AdminApprovals.tsx
import { useEffect, useState } from "react";
import {
  getPendingMessApps,
  approveMess,
  rejectMess,
} from "@/api/admin.api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle } from "lucide-react";

/* ================= TYPES ================= */

type MessApplication = {
  id: string;
  messName: string;
  email: string;
  campusType: string;
  foodType?: "VEG" | "NON_VEG" | "BOTH";

  prices: {
    breakfast: number;
    lunch: number;
    snacks: number;
    dinner: number;
    grandDinner: number;
  };

  penaltyPercent: number;
  estimatedCredits: number;

  grandDinner?: {
    daysPerMonth: number;
  };

  operation: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
};

type ActionState =
  | "idle"
  | "approving"
  | "approved"
  | "rejecting"
  | "rejected";

/* ================= COMPONENT ================= */

export default function AdminApprovals() {
  const [apps, setApps] = useState<MessApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionState, setActionState] = useState<Record<string, ActionState>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    getPendingMessApps()
      .then((res) => {
        const applications = res.data?.applications ?? [];
        const totalCount = res.data?.total ?? 0;

        setApps(applications);
        setTotal(totalCount);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= ACTIONS ================= */

  const handleApprove = async (id: string) => {
    try {
      setActionState((s) => ({ ...s, [id]: "approving" }));
      await approveMess(id, notes[id]);
      setActionState((s) => ({ ...s, [id]: "approved" }));
    } catch {
      setActionState((s) => ({ ...s, [id]: "idle" }));
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionState((s) => ({ ...s, [id]: "rejecting" }));
      await rejectMess(id, notes[id] || "Rejected by hostel office");
      setActionState((s) => ({ ...s, [id]: "rejected" }));
    } catch {
      setActionState((s) => ({ ...s, [id]: "idle" }));
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#6770d2]">
            Pending Mess Approvals
          </h1>
          <p className="text-sm text-muted-foreground">
            Applications awaiting hostel office approval
          </p>
        </div>

        <Badge className="bg-[#6770d2]/10 text-[#6770d2] border border-[#6770d2]/30">
          {total} Pending
        </Badge>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-muted-foreground">
          Loading applications…
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && apps.length === 0 && (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
          No pending mess applications right now 🎉
        </div>
      )}

      {/* CARDS */}
      {!loading && apps.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {apps.map((app) => {
            const state = actionState[app.id] || "idle";

            return (
              <Card
                key={app.id}
                className="
                  group transition-all duration-300
                  border border-border
                  hover:border-[#6770d2]/40
                  hover:shadow-xl
                  hover:-translate-y-0.5
                "
              >
                <CardContent className="p-5 space-y-4 text-sm">

                  {/* HEADER */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-base text-[#6770d2] group-hover:underline">
                        {app.messName}
                      </h2>
                      <p className="text-muted-foreground text-xs">
                        {app.email}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {app.campusType}
                      </Badge>
                      {app.foodType && (
                        <Badge className="bg-[#6770d2]/10 text-[#6770d2]">
                          {app.foodType === "BOTH"
                            ? "VEG & NON-VEG"
                            : app.foodType}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* PRICES */}
                  <div className="grid grid-cols-2 gap-y-1">
                    <span>Breakfast ₹{app.prices.breakfast}</span>
                    <span>Lunch ₹{app.prices.lunch}</span>
                    <span>Snacks ₹{app.prices.snacks}</span>
                    <span>Dinner ₹{app.prices.dinner}</span>
                    <span className="col-span-2">
                      Grand Dinner ₹{app.prices.grandDinner}
                    </span>
                  </div>

                  <Separator />

                  {/* RULES */}
                  <div className="space-y-1">
                    <p>Penalty: {app.penaltyPercent}%</p>
                    <p>
                      Grand Dinner / Month:{" "}
                      {app.grandDinner?.daysPerMonth ?? 0}
                    </p>
                  </div>

                  <Separator />

                  {/* OPERATION */}
                  <div className="space-y-1">
                    <p>
                      {app.operation.startDate} →{" "}
                      {app.operation.endDate}
                    </p>
                    <p>Total Days: {app.operation.totalDays}</p>
                    <p className="font-semibold text-[#6770d2]">
                      Estimated Credits ₹{app.estimatedCredits}
                    </p>
                  </div>

                  {/* NOTE */}
                  {state === "idle" && (
                    <Textarea
                      placeholder="Approval / rejection note (optional)"
                      value={notes[app.id] || ""}
                      onChange={(e) =>
                        setNotes((n) => ({
                          ...n,
                          [app.id]: e.target.value,
                        }))
                      }
                    />
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">
                    {state === "approved" && (
                      <Button
                        disabled
                        className="bg-green-600 text-white gap-2"
                      >
                        <CheckCircle2 size={16} />
                        Approved
                      </Button>
                    )}

                    {state === "rejected" && (
                      <Button
                        disabled
                        variant="destructive"
                        className="gap-2"
                      >
                        <XCircle size={16} />
                        Rejected
                      </Button>
                    )}

                    {state === "idle" && (
                      <>
                        <Button
                          onClick={() => handleApprove(app.id)}
                          className="
                            bg-[#6770d2]
                            hover:bg-[#5b63c7]
                            text-white
                          "
                        >
                          Approve
                        </Button>

                        <Button
                          variant="outline"
                          className="
                            border-[#6770d2]/40
                            text-[#6770d2]
                            hover:bg-[#6770d2]/10
                          "
                          onClick={() => handleReject(app.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {(state === "approving" ||
                      state === "rejecting") && (
                      <Button disabled>
                        {state === "approving"
                          ? "Approving…"
                          : "Rejecting…"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

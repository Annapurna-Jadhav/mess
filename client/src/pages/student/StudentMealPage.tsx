import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import DateStrip from "@/components/student/DateStrip";
import MealQRModal from "@/components/student/MealQRModal";
import { MealGrid } from "@/components/student/MealGrid";

import type { MealType } from "@/types/meal.types";
import type { StudentMealDay } from "@/types/mess.types";

import { getMyStudentProfile } from "@/api/student.api";
import { getStudentMealDays } from "@/api/student.api";
import { generateMealQR } from "@/api/qr.api";
import axiosClient from "@/api/axiosClient";

/* ================= COMPONENT ================= */

export default function StudentMealPage() {
  const [profile, setProfile] = useState<any>(null);
  const [days, setDays] = useState<StudentMealDay[]>([]);
  const [selectedDay, setSelectedDay] =
    useState<StudentMealDay | null>(null);

  /* ---------- QR STATE ---------- */
  const [qrOpen, setQrOpen] = useState(false);
  const [qrMeal, setQrMeal] = useState<MealType | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrExpires, setQrExpires] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  /* ================= AUTO CLOSE QR WHEN SERVED ================= */
  useEffect(() => {
    if (!selectedDay || !qrMeal) return;

    if (selectedDay.meals[qrMeal].status === "SERVED") {
      setQrOpen(false);
      setQrMeal(null);
      setQrToken(null);
      setQrExpires(0);
    }
  }, [selectedDay, qrMeal]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function load() {
      try {
        const [profileData, daysArray] = await Promise.all([
          getMyStudentProfile(),
          getStudentMealDays(),
        ]);

        setProfile(profileData);
        setDays(daysArray);
        setSelectedDay(daysArray[0] ?? null);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to load meal data"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= ACTIONS ================= */

  const handleDeclareAbsent = async (meal: MealType) => {
    try {
      await axiosClient.post("/student/declare-absent", {
        date: selectedDay!.date,
        mealType: meal,
      });

      toast.success("Absent declared");

      setDays((prev) =>
        prev.map((d) =>
          d.date === selectedDay!.date
            ? {
                ...d,
                meals: {
                  ...d.meals,
                  [meal]: {
                    ...d.meals[meal],
                    status: "DECLARED_ABSENT",
                  },
                },
              }
            : d
        )
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleGenerateQR = async (meal: MealType) => {
    try {
      const res = await generateMealQR(meal);

      setQrMeal(meal);
      setQrToken(res.token);
      setQrExpires(res.expiresIn ?? 0);
      setQrOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "QR failed");
    }
  };

  /* ================= LOADING & SAFETY ================= */
  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
        Loading meals…
      </div>
    );
  }

  if (!profile || !profile.messSelected || !selectedDay) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Mess not selected
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <DateStrip
        days={days}
        selected={selectedDay}
        onSelect={setSelectedDay}
      />

      <MealGrid
        day={selectedDay}
        prices={profile.selectedMess.prices}
        onDeclareAbsent={handleDeclareAbsent}
        onGenerateQR={handleGenerateQR}
      />

      <MealQRModal
        open={qrOpen}
        token={qrToken}
        expiresIn={qrExpires}
        onClose={() => {
          setQrOpen(false);
          setQrMeal(null);
          setQrToken(null);
          setQrExpires(0);
        }}
      />
    </div>
  );
}

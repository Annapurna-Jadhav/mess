import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { getMyStudentProfile } from "@/api/student.api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import VerifyReceiptModal from "@/components/student/VerifyReceiptModal";
import SelectMessModal from "@/components/student/SelectMessModal";

import {
  CheckCircle2,
  Lock,
  Utensils,
  Wallet,
  Mail,
  Calendar,
} from "lucide-react";


type StudentProfile = {
  role: "student";
  exists: boolean;
  roll?: string;
  name?: string;
  receiptId?: string;
  issuedAt?: string;
  validTill?: string;
  receiptVerified: boolean;
  messSelected: boolean;
  initialCredits?: number;
  selectedMess?: {
    messName: string;
    campusType: string;
    foodType: string;
    prices?: {
      breakfast: number;
      lunch: number;
      snacks: number;
      dinner: number;
      grandDinner: number;
    };
    roll: string;
    capacity?: number;
    studentCount?: number;
  };
};

const StudentDashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMessModal, setShowMessModal] = useState(false);

  if (!authLoading && (!user || user.role !== "student")) {
    return <Navigate to="/login" replace />;
  }

  const fetchProfile = async () => {
    setLoading(true);
    const data = await getMyStudentProfile();
    setStudent(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  if (!student) return null;

  const receiptLocked =
    student.receiptVerified && student.validTill
      ? new Date() <= new Date(student.validTill)
      : false;

  const messLocked =
    student.messSelected && student.validTill
      ? new Date() <= new Date(student.validTill)
      : false;

  return (
    <>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="flex flex-col items-center text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome, <span className="text-primary">{student.name}</span>
            </h1>
          </div>

          <Card className="rounded-2xl border-muted/40 hover:border-primary/40 hover:shadow-lg transition">
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-8 text-center md:text-left">
              <Info
                label="Institute Email"
                value={user?.email}
                icon={<Mail size={14} />}
              />
              <Info label="Roll Number" value={student.roll} />
              <Info
                label="Receipt Valid Till"
                value={student.validTill}
                icon={<Calendar size={14} />}
              />
              <Info label="Status" value="Active" />
            </CardContent>
          </Card>

    
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ActionCard
              title="Hostel Receipt"
              description={
                student.receiptVerified
                  ? "Receipt verified"
                  : "Upload & verify hostel receipt"
              }
              status={student.receiptVerified}
              locked={receiptLocked}
              hoverMessage="This receipt has already been used for verification."
              buttonLabel="Verify Receipt"
              onClick={() => setShowReceiptModal(true)}
            />

            <ActionCard
              title="Mess Selection"
              description={
                student.messSelected
                  ? `Selected: ${student.selectedMess?.messName}`
                  : "Choose your preferred mess"
              }
              status={student.messSelected}
              locked={messLocked || !student.receiptVerified}
              hoverMessage="Mess selection is locked until next cycle."
              buttonLabel="Select Mess"
              onClick={() => setShowMessModal(true)}
              disabled={!student.receiptVerified}
            />

            <Card
              className="
    rounded-xl
    border border-border/50
    transition-all
    hover:border-primary/40
    hover:shadow-md
  "
            >
              <CardContent className="p-5 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                  <Wallet size={16} />
                  Initial Credits
                </div>

                <p className="text-3xl font-bold tracking-tight">
                  ₹{student.initialCredits ?? "—"}
                </p>

                <p className="text-[11px] text-muted-foreground">
                  Assigned after receipt verification
                </p>
              </CardContent>
            </Card>
          </div>

          {student.messSelected && student.selectedMess && (
            <Card
              className="
      rounded-lg
      border border-muted/40
      bg-background
      transition-all duration-300
      hover:shadow-md
      hover:border-[#6770d2]/40
    "
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6770d2]/10">
                      <Utensils size={18} className="text-[#6770d2]" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold leading-tight">
                        {student.selectedMess.messName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Active mess subscription
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetaCard
                    label="Campus"
                    value={student.selectedMess.campusType}
                  />
                  <MetaCard
                    label="Food Type"
                    value={student.selectedMess.foodType}
                  />
                  <MetaCard
                    label="Students"
                    value={student.selectedMess.studentCount}
                  />
                  <MetaCard label="Valid Till" value={student.validTill} />
                </div>

                {student.selectedMess.prices && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#6770d2] to-[#4f58c9]" />
                      <p className="text-sm font-semibold text-[#6770d2]">
                        Meal Pricing (₹)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <PriceCard
                        label="Breakfast"
                        price={student.selectedMess.prices.breakfast}
                      />
                      <PriceCard
                        label="Lunch"
                        price={student.selectedMess.prices.lunch}
                      />
                      <PriceCard
                        label="Snacks"
                        price={student.selectedMess.prices.snacks}
                      />
                      <PriceCard
                        label="Dinner"
                        price={student.selectedMess.prices.dinner}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="p-0 bg-transparent border-none">
          <VerifyReceiptModal
            onSuccess={() => {
              setShowReceiptModal(false);
              fetchProfile();
            }}
          />
        </DialogContent>
      </Dialog>

      <SelectMessModal
        open={showMessModal}
        onClose={() => {
          setShowMessModal(false);
          fetchProfile();
        }}
      />
    </>
  );
};

export default StudentDashboard;



const Info = ({ label, value, icon }: any) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1 justify-center md:justify-start">
      {icon} {label}
    </p>
    <p className="font-semibold text-sm">{value || "—"}</p>
  </div>
);

const ActionCard = ({
  title,
  description,
  status,
  locked,
  hoverMessage,
  buttonLabel,
  onClick,
  disabled,
}: any) => (
  <Card
    className={`
      group relative overflow-hidden
      rounded-xl
      border border-border/50
      transition-all duration-300
      ${
        locked
          ? "opacity-70"
          : "hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
      }
    `}
  >
   
    {status && (
      <div
        className="
          absolute inset-0 z-20
          bg-background/90 backdrop-blur-sm
          opacity-0 group-hover:opacity-100
          transition
          flex items-center justify-center
          px-5 text-center
        "
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          {hoverMessage}
        </p>
      </div>
    )}

   
    <CardContent
      className="
        relative z-10
        p-5
        flex flex-col items-center justify-center
        text-center
        gap-3
      "
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        {status ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : locked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground leading-snug max-w-[220px]">
        {description}
      </p>

   
      {!status && (
        <Button
          size="sm"
          className="w-full mt-1"
          onClick={onClick}
          disabled={locked || disabled}
        >
          {buttonLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);


const MetaCard = ({ label, value }: { label: string; value?: any }) => (
  <div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="text-sm font-semibold">{value ?? "—"}</p>
  </div>
);
const PriceCard = ({ label, price }: { label: string; price: number }) => (
  <div className="rounded-xl border border-border/50 bg-background px-4 py-3 text-center transition hover:border-[#6770d2]/40 hover:bg-[#6770d2]/5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-lg font-bold">₹{price}</p>
  </div>
);

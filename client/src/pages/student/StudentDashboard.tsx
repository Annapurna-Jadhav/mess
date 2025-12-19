import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { getMyStudentProfile } from "@/api/student.api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import VerifyReceiptModal from "@/components/VerifyReceiptModal";
import SelectMessModal from "@/components/SelectMessModal";

import {
  CheckCircle2,
  Lock,
  Utensils,
  Wallet,
  Mail,
  Calendar,
} from "lucide-react";

/* ---------- TYPES ---------- */
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
    name: string;
    roll: string;
    capacity?: number;
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
      {/* ================= PAGE WRAPPER ================= */}
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 space-y-12">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome,{" "}
              <span className="text-primary">{student.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Smart Mess Card • Student Dashboard
            </p>
          </div>

          {/* ================= IDENTITY CARD ================= */}
          <Card className="rounded-2xl border-muted/40 hover:border-primary/40 hover:shadow-lg transition">
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-8 text-center md:text-left">
              <Info label="Institute Email" value={user?.email} icon={<Mail size={14} />} />
              <Info label="Roll Number" value={student.roll} />
              <Info label="Receipt Valid Till" value={student.validTill} icon={<Calendar size={14} />} />
              <Info label="Status" value="Active" />
            </CardContent>
          </Card>

          {/* ================= ACTION GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <ActionCard
              title="Hostel Receipt"
              description={
                student.receiptVerified
                  ? "Receipt verified successfully"
                  : "Upload and verify your hostel receipt"
              }
              status={student.receiptVerified}
              locked={receiptLocked}
              hoverMessage="This receipt has already been used once for verification."
              buttonLabel="Verify Receipt"
              onClick={() => setShowReceiptModal(true)}
            />

            <ActionCard
              title="Mess Selection"
              description={
                student.messSelected
                  ? `Selected: ${student.selectedMess?.name}`
                  : "Choose your preferred mess"
              }
              status={student.messSelected}
              locked={messLocked || !student.receiptVerified}
              hoverMessage="Mess selection is locked after confirmation."
              buttonLabel="Select Mess"
              onClick={() => setShowMessModal(true)}
              disabled={!student.receiptVerified}
            />

            <Card className="rounded-2xl border-muted/40 hover:border-primary/40 hover:shadow-xl transition-all">
              <CardContent className="p-8 space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 font-semibold">
                  <Wallet size={18} />
                  Mess Credits
                </div>

                <p className="text-5xl font-bold tracking-tight">
                  ₹{student.initialCredits ?? "—"}
                </p>

                <p className="text-xs text-muted-foreground">
                  Auto-assigned after receipt verification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ================= SELECTED MESS ================= */}
          {student.messSelected && student.selectedMess && (
            <Card className="rounded-2xl border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-2 font-semibold">
                  <Utensils size={18} />
                  Selected Mess
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Info label="Mess Name" value={student.selectedMess.name} />
                  <Info label="Mess Roll" value={student.selectedMess.roll} />
                  <Info label="Valid Till" value={student.validTill} />
                </div>

                <Badge className="bg-primary/15 text-primary w-fit">
                  Locked till {student.validTill}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}
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

      <Dialog open={showMessModal} onOpenChange={setShowMessModal}>
        <DialogContent className="p-0 bg-transparent border-none">
          {/* <SelectMessModal
            onSuccess={() => {
              setShowMessModal(false);
              fetchProfile();
            }}
          /> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentDashboard;

/* ================= REUSABLE UI ================= */

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
      relative overflow-hidden rounded-2xl border-muted/40
      transition-all duration-300 group
      ${locked
        ? "opacity-70"
        : "hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50"}
    `}
  >
    {status && (
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm
                      opacity-0 group-hover:opacity-100 transition
                      flex items-center justify-center text-center px-6 z-20">
        <p className="text-sm text-muted-foreground">{hoverMessage}</p>
      </div>
    )}

    <CardContent className="p-6 space-y-4 relative z-10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        {status ? (
          <CheckCircle2 className="text-green-500" />
        ) : locked ? (
          <Lock size={16} className="text-muted-foreground" />
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>

      {!status && (
        <Button
          className="w-full mt-2"
          onClick={onClick}
          disabled={locked || disabled}
        >
          {buttonLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);

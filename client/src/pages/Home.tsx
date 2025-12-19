
import Navbar from "@/components/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

import {
  
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import HeroFeatureMosaic from "@/components/HeroFeatureMosaic";
import LeftHero from "@/components/LeftHero";


export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (!user) return navigate("/login");

    const redirect = {
      student: "/student/dashboard",
      mess_manager: "/mess/dashboard",
      hostel_office: "/admin/dashboard",
    } as const;

    navigate(redirect[user.role]);
  };

  return (
    <>
      <Navbar />

      {/* ================= HERO ================= */}
     {/* HERO */}
<section className="relative min-h-screen flex items-center overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 pt-36 grid md:grid-cols-2 gap-20 items-center">

    {/* LEFT SIDE — your heading */}
    <LeftHero/>

    {/* RIGHT SIDE — ORBIT SYSTEM */}
    
    <HeroFeatureMosaic/>
  
  </div>
</section>

      {/* ================= ROLE CARDS ================= */}
      <section className="py-32 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center space-y-20">
          <h2 className="text-3xl font-semibold">
            Designed for Campus Stakeholders
          </h2>

          <div className="grid md:grid-cols-3 gap-14">
            {[
              {
                icon: Users,
                title: "Students",
                desc:
                  "Transparent mess usage without physical cards or manual verification.",
              },
              {
                icon: ClipboardList,
                title: "Mess Management",
                desc:
                  "Digitized attendance, menu control, and operational clarity.",
                action: (
                  <Button
                    variant="outline"
                    className="mt-4 border-[#6770d2] text-[#6770d2] hover:bg-[#6770d2]/10"
                    onClick={() => navigate("/apply-mess-manager")}
                  >
                    Apply for Mess Management
                  </Button>
                ),
              },
              {
                icon: ShieldCheck,
                title: "Hostel Office",
                desc:
                  "Centralized oversight with approvals and audit-ready data.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group bg-background border rounded-3xl p-12 shadow-xl
                           transition-all hover:shadow-2xl hover:-translate-y-3"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6770d2]/15 flex items-center justify-center mb-6
                                group-hover:scale-110 transition">
                  <card.icon size={26} className="text-[#6770d2]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.desc}
                </p>
                {card.action}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t py-10 px-6 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-muted-foreground">
            © {new Date().getFullYear()} SmartMessBalance. All rights reserved.
          </span>

          <div className="flex items-center gap-6">
            <button className="hover:text-[#6770d2] transition">
              Contact
            </button>
            <button className="hover:text-[#6770d2] transition">
              Feedback
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}


import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import DashboardNavbar from "@/components/DashboardNavbar";
import HeroFeatureMosaic from "@/components/HeroFeatureMosaic";
import LeftHero from "@/components/LeftHero";

;

export default function Home() {
  const navigate = useNavigate();
  

  return (
    <>
       
<DashboardNavbar />

<section className="relative min-h-screen overflow-hidden pt-30">
  <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-start">
    <LeftHero />
    <HeroFeatureMosaic />
  </div>
</section>



      <section className="py-14 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center space-y-14">
          <h2 className="text-3xl font-semibold">
            Built for Students, Messes, and Administrators
          </h2>

          <div className="grid md:grid-cols-3 gap-14">
            {[
              {
                icon: Users,
                title: "Students",
                desc:
                  "QR-based mess access, wallet savings, analytics, and transparent meal tracking.",
              },
              {
                icon: ClipboardList,
                title: "Mess Management",
                desc:
                  "Digitized attendance, peak-hour insights, menu control, and feedback analysis.",
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
                  "Centralized approvals, audit-ready analytics, billing oversight, and transparency.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group bg-background border rounded-3xl p-12 shadow-xl
                           transition-all hover:shadow-2xl hover:-translate-y-3"
              >
                <div
                  className="w-14 h-14 mx-auto rounded-2xl bg-[#6770d2]/15
                             flex items-center justify-center mb-6
                             group-hover:scale-110 transition"
                >
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
            <a
              href="mailto:jadhavannapurna37@gmail.com"
              className="hover:text-[#6770d2] transition"
            >
              Contact
            </a>

            <button
              onClick={() => navigate("/feedback")}
              className="hover:text-[#6770d2] transition"
            >
              Feedback
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

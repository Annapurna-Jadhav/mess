
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import DashboardNavbar from "@/components/DashboardNavbar";
import HeroFeatureMosaic from "@/components/HeroFeatureMosaic";
import LeftHero from "@/components/LeftHero";






export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <DashboardNavbar />

      {/* HERO */}
     <section className="relative pt-24 pb-12">

  <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-start">
    <LeftHero />
    <HeroFeatureMosaic />
  </div>
</section>
<section id="problem" className="pt-12 pb-16 px-6">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

    {/* LEFT – Visual */}
    <div className="flex justify-center md:justify-start">
      <img
        src="/Money stress-amico.svg"
        alt="Students paying despite skipping meals"
        className="
          w-full
          max-w-[340px]
          md:max-w-[420px]
        "
      />
    </div>

    {/* RIGHT – Core Message */}
    <div className="space-y-5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        The gap today
      </span>

      <h2 className="text-2xl md:text-3xl font-semibold leading-snug">
        Billing is fixed, meals are not
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        In the current system, students are billed a fixed amount
        regardless of whether they attend a meal or skip it.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        This affects students, mess planning, and food utilisation,
        without clearly reflecting actual meal usage.
      </p>
    </div>

  </div>
</section>


    
      {/* QR ENTRY */}
<section id="system">

      <section className="py-16 px-6 bg-muted/20">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-semibold">
        QR-based meal entry
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        Each meal is accessed through a short-lived QR code
        generated for the student.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        This ensures one verified entry per meal
        without manual registers.
      </p>
    </div>

    <img
      src="/qrScan.svg"
      alt="QR based mess entry"
      className="w-full max-w-sm mx-auto"
    />
  </div>
</section>


     <section className="py-16 px-6">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <img
      src="/credits.svg"
      alt="Wallet credit system"
      className="w-full max-w-sm mx-auto"
    />

    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-semibold">
        Usage-linked wallet credits
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        When a student skips a meal, the system automatically
        credits the corresponding amount.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        This keeps billing transparent for students
        and simplifies accounting for the mess.
      </p>
    </div>
  </div>
</section>



    <section className="py-16 px-6 bg-muted/20">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-semibold">
        Feedback for gradual improvement
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        Students provide structured feedback after meals
        in a simple, consistent format.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        Aggregated trends help the mess understand
        recurring issues and improve service quality.
      </p>
    </div>

    <img
      src="/feedback.svg"
      alt="Student feedback"
      className="w-full max-w-sm mx-auto"
    />
  </div>
</section>

<section className="pt-10 pb-14 px-6">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <img
      src="/data.svg"
      alt="Mess data and usage analysis"
      className="w-full max-w-sm mx-auto"
    />

    <div className="space-y-5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Data-driven clarity
      </span>

      <h2 className="text-2xl md:text-3xl font-semibold">
        Using real data to benefit both students and the mess
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        Meal attendance data helps the mess understand
        daily food consumption, peak hours, and student count
        more accurately.
      </p>

      <p className="text-muted-foreground leading-relaxed">
        At the same time, students can see where their money goes,
        how much they spend, and how much is credited back
        when meals are skipped.
      </p>
    </div>
  </div>
</section>
</section>


 
      {/* STAKEHOLDERS */}
     <section id="for-whom" className="py-18 px-6">
  <div className="max-w-7xl mx-auto text-center space-y-10">
    <h2 className="text-2xl md:text-3xl font-semibold">
  Who Smart Mess Card is built for
</h2>


            <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Users,
                title: "Students",
                desc:
                  "Clear meal records, transparent deductions, and wallet credits for skipped meals.",
              },
              {
                icon: ClipboardList,
                title: "Mess Managers",
                desc:
                 "Real-time meal counts, QR-based attendance, and feedback-driven insights to plan food accurately and reduce waste.",
                action: (
                  <Button
                    variant="outline"
                    className="mt-4 border-[#6770d2] text-[#6770d2] hover:bg-[#6770d2]/10"
                    onClick={() => navigate("/apply-mess-manager")}
                  >
                    Apply for Mess-Management
                  </Button>
                ),
              },
              {
                icon: ShieldCheck,
                title: "Hostel Office",
                desc:
                  "Verified records, centralized oversight, and audit-ready reports.",
              },
            ].map((card, index) => (
             <div
  key={index}
  className="
    bg-background
    border
    rounded-3xl
    p-10
    shadow-md
    transition-transform
    duration-300
    hover:-translate-y-1
  "
>

                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6770d2]/15 flex items-center justify-center mb-6">
                  <card.icon size={26} className="text-[#6770d2]" />
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  {card.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>

                {card.action}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 px-6 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-muted-foreground">
            © {new Date().getFullYear()} SmartMessBalance
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
              Give feedback
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}



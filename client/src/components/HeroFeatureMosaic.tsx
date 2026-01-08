import { motion } from "framer-motion";
import {
  QrCode,

  ClipboardCheck,
  
  Wallet,
  BarChart3,
  Brain,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR-Based Authentication",
    desc: "Secure, time-bound QR system for student authentication and mess entry.",
    offset: "translate-y-0",
  },
  {
    icon: ClipboardCheck,
    title: "Automated Meal Attendance",
    desc: "Meal-wise attendance tracking with duplicate scan and time-window control.",
    offset: "-translate-y-6",
  },
  {
    icon: Wallet,
    title: "Smart Wallet & Credits",
    desc: "Automatic wallet credits for missed meals with controlled mess and food court usage.",
    offset: "translate-y-4",
  },
  {
    icon: BarChart3,
    title: "Deep Mess Analytics",
    desc: "Insights on student count, revenue flow, peak hours, and meal-wise distribution.",
    offset: "-translate-y-2",
  },
  {
    icon: MessageSquare,
    title: "Feedback & Sentiment Analysis",
    desc: "Tag-based student feedback analyzed using sentiment analysis for actionable insights.",
    offset: "translate-y-6",
  },
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    desc: "Vertex AI–driven analytics for demand forecasting and food waste reduction.",
    offset: "translate-y-2",
  },
];



export default function HeroFeatureMosaic() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="grid grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6, scale: 1.04 }}
            className={`
              group relative
              ${f.offset}
              bg-background/80 backdrop-blur-xl
              border border-[#6770d2]/20
              rounded-2xl p-5
              shadow-[0_15px_40px_rgba(0,0,0,0.15)]
              hover:shadow-[0_30px_80px_rgba(103,112,210,0.35)]
              transition-all
            `}
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-[#6770d2]/5 opacity-0 group-hover:opacity-100 transition" />

            <div className="relative flex items-start gap-4">
              <div className="
                w-10 h-10 rounded-xl
                bg-[#6770d2]/15
                flex items-center justify-center
                group-hover:scale-110 transition
              ">
                <f.icon size={20} className="text-[#6770d2]" />
              </div>

              <div>
                <h4 className="text-sm font-semibold">{f.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

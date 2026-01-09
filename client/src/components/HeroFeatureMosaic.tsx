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
  <div className="relative w-full max-w-md mx-auto">
    <div className="grid grid-cols-2 gap-4">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -4, scale: 1.03 }}
          className={`
            group relative
            ${f.offset}
            bg-background/80 backdrop-blur-xl
            border border-[#6770d2]/20
            rounded-xl p-4
            shadow-sm
            hover:shadow-[0_18px_40px_rgba(103,112,210,0.25)]
            transition-all
          `}
        >
          <div className="relative flex flex-col items-center text-center gap-3">
            <div
              className="
                w-9 h-9 rounded-xl
                bg-[#6770d2]/15
                flex items-center justify-center
                group-hover:scale-105 transition
              "
            >
              <f.icon size={18} className="text-[#6770d2]" />
            </div>

            <h4 className="text-xs font-semibold leading-snug">
              {f.title}
            </h4>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

}

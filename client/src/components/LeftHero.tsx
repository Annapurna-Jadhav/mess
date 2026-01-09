// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/hooks/useAuth";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import type { Variants } from "framer-motion";


// const container: Variants = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.15,
//     },
//   },
// };
// const item: Variants = {
//   hidden: {
//     opacity: 0,
//     y: 20,
//   },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       ease: [0.22, 1, 0.36, 1], 
//     },
//   },
// };



// const LeftHero = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <motion.div
//       variants={container}
//       initial="hidden"
//       animate="show"
//       className="space-y-10"
//     >
//       {/* Tag */}
//       <motion.span
//         variants={item}
//         className="
//           inline-flex items-center
//           px-4 py-1.5
//           text-xs font-medium
//           rounded-full
//           bg-[#6770d2]/10
//           text-[#6770d2]
//         "
//       >
//         NITK Smart Mess Card System
//       </motion.span>

//       {/* Title */}
//       <motion.h1
//         variants={item}
//         className="text-5xl md:text-6xl font-extrabold leading-tight"
//       >
//         Smart Mess Card
//       </motion.h1>

//       {/* Subtitle */}
//       <motion.h2
//         variants={item}
//         className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl"
//       >
//         A centralized system to manage mess attendance,
//         payments, and records with clear role-based access.
//       </motion.h2>

//       {/* CTA */}
//       {!user && (
//         <motion.div variants={item}>
//           <Button
//             size="lg"
//             onClick={() => navigate("/login")}
//             className="
//               bg-[#6770d2]
//               hover:bg-[#5b63c7]
//               shadow-lg
//               px-8
//             "
//           >
//             Continue to Smart Mess
//           </Button>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// export default LeftHero;


import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState } from "react";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const LINES = [
  "QR-based meal verification.",
  "Automatic wallet credits for skipped meals.",
  "Attendance-linked billing.",
  "Clear records for mess management.",
  "Centralized oversight for hostel office.",
];

const START_DELAY = 1000;   // first start delay
const TYPE_SPEED = 45;      // typing speed
const DELETE_SPEED = 25;    // deleting speed
const HOLD_TIME = 3000;     // stay visible before delete

const LeftHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(false);

 
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, START_DELAY);

    return () => clearTimeout(startTimer);
  }, []);

  // typing loop
 useEffect(() => {
  if (!started) return;

  const currentLine = LINES[lineIndex];
  let timer: ReturnType<typeof setTimeout>;

  if (!isDeleting) {
    if (text.length < currentLine.length) {
      timer = setTimeout(() => {
        setText(currentLine.slice(0, text.length + 1));
      }, TYPE_SPEED);
    } else {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, HOLD_TIME);
    }
  } else {
    if (text.length > 0) {
      timer = setTimeout(() => {
        setText(currentLine.slice(0, text.length - 1));
      }, DELETE_SPEED);
    } else {
      setIsDeleting(false);
      setLineIndex((prev) => (prev + 1) % LINES.length);
    }
  }

  return () => clearTimeout(timer);
}, [text, isDeleting, lineIndex, started]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Tag */}
      <motion.span
        variants={item}
        className="
          inline-flex items-center
          px-4 py-1.5
          text-xs font-medium
          rounded-full
          bg-[#6770d2]/10
          text-[#6770d2]
        "
      >
        NITK • Smart Mess System
      </motion.span>

      {/* Title */}
      <motion.h1
        variants={item}
        className="text-5xl md:text-6xl font-extrabold leading-tight"
      >
        Smart Mess Card
      </motion.h1>

      {/* Typewriter */}
      <div className="h-8">
        <p className="text-lg text-muted-foreground font-medium">
          {text}
          <span className="ml-1 animate-pulse">|</span>
        </p>
      </div>

      {/* CTA */}
      {!user && (
        <motion.div variants={item}>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="
              bg-[#6770d2]
              hover:bg-[#5b63c7]
              shadow-lg
              px-8
            "
          >
            Enter system
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeftHero;

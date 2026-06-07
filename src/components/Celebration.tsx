/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  onComplete: () => void;
  message?: string;
}

export function Celebration({ show, onComplete, message = "Goal Completed!" }: CelebrationProps) {
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 5000); // 5 seconds of celebration
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="bg-white/90 backdrop-blur-sm shadow-soft-hover px-8 py-6 rounded-3xl flex flex-col items-center gap-4 text-center border border-emerald-100"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800">{message}</h2>
            <p className="text-slate-500">Amazing job!</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

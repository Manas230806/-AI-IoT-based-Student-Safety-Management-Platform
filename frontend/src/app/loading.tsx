"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo Image */}
        <div className="relative w-32 h-32 mb-8">
          <Image 
            src="/logo.jpg" 
            alt="EduGuard Logo" 
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Loading Text & Spinner */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-white tracking-wider">EDUGUARD</h2>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-indigo-400/80 tracking-widest uppercase">Initializing System...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

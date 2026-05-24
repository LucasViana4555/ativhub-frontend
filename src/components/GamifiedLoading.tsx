"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

const defaultPhrases = [
  "Carregando missões épicas...",
  "Calculando seu XP...",
  "Afiando espadas virtuais...",
  "Conectando ao servidor global...",
  "Preparando sua jornada..."
];

export function GamifiedLoading({ text, className = "" }: { text?: string, className?: string }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  //aqui eu coloco a frase do loading
  const phrases = text && text !== "Carregando..."
    ? [text, ...defaultPhrases]
    : defaultPhrases;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className={`flex flex-col items-center justify-center gap-8 p-8 ${className}`}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-neon-green"
      >
        <Gamepad2 size={64} />
      </motion.div>

      <div className="w-64 flex flex-col items-center gap-4">
        {/* Loading Bar Container */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-green to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        </div>

        {/* carregando frase */}
        <div className="h-5 overflow-hidden">
          <motion.div
            key={phraseIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-gray-400 text-sm font-medium text-center whitespace-nowrap"
          >
            {phrases[phraseIndex]}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

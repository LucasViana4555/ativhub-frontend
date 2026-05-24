"use client";

import { motion } from "framer-motion";

export function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950">
      
      {/* Orb 1: Roxo */}
      <motion.div
        animate={{
          x: ["0vw", "20vw", "-10vw", "0vw"],
          y: ["0vh", "10vh", "-20vh", "0vh"],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-purple-700/50 rounded-full blur-[100px] mix-blend-screen"
      />

      {/* Orb 2: Verde Neon */}
      <motion.div
        animate={{
          x: ["0vw", "-30vw", "10vw", "0vw"],
          y: ["0vh", "-10vh", "30vh", "0vh"],
          scale: [1, 1.4, 0.8, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vh] bg-neon-green/40 rounded-full blur-[120px] mix-blend-screen"
      />

      {/* Orb 3: Azul Profundo */}
      <motion.div
        animate={{
          x: ["0vw", "30vw", "-20vw", "0vw"],
          y: ["0vh", "-30vh", "-10vh", "0vh"],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] left-[10%] w-[70vw] h-[50vh] bg-blue-600/40 rounded-full blur-[130px] mix-blend-screen"
      />

      {/* Orb 4: Rosa/Magenta */}
      <motion.div
        animate={{
          x: ["0vw", "-20vw", "20vw", "0vw"],
          y: ["0vh", "20vh", "-10vh", "0vh"],
          scale: [1, 1.1, 1.2, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[10%] w-[40vw] h-[60vh] bg-fuchsia-600/30 rounded-full blur-[110px] mix-blend-screen"
      />
      
      {/* Camada superior para suavizar as luzes e adicionar profundidade */}
      <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[60px]" />
    </div>
  );
}

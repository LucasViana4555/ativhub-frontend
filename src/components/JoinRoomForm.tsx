"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useStudent } from "@/store/StudentContext";

interface JoinRoomFormProps {
  message?: string;
  className?: string;
}

export function JoinRoomForm({ 
  message = "Você ainda não está em nenhuma turma. Insira um código de sala para começar.",
  className = ""
}: JoinRoomFormProps) {
  const { joinRoom } = useStudent();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Small artificial delay to show standard gaming transition
      await new Promise((resolve) => setTimeout(resolve, 800));
      await joinRoom(roomCode);
    } catch (err: any) {
      setError(err.message || "Erro ao entrar na sala. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`w-full max-w-md mx-auto glass-panel p-8 rounded-3xl relative overflow-hidden border border-slate-800 ${className}`}
    >
      {/* Background neon blur */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-neon-green/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center text-center relative z-10">
        {/* Animated locked shield badge */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 2.5,
            ease: "easeInOut",
          }}
          className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-purple-500 flex items-center justify-center glow-purple mb-6"
        >
          <Lock className="text-purple-400" size={32} />
        </motion.div>

        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
          Acesso Restrito
        </h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
          {message}
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-left mb-4"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <input
              type="text"
              required
              disabled={loading}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Ex: MAT-123"
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white rounded-xl py-3.5 px-4 pr-10 text-center font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:tracking-normal outline-none transition-all disabled:opacity-50"
            />
            {roomCode && !loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400">
                <Sparkles size={16} className="animate-pulse" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !roomCode.trim()}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar na Sala
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-slate-600 text-[10px] mt-6 font-medium">
          Dica: Peça o código de acesso diretamente para o seu professor.
        </p>
      </div>
    </motion.div>
  );
}

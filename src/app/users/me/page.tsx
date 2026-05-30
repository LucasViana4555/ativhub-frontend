"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Shield, Award, ArrowLeft, Gamepad2 } from "lucide-react";
import { fetchApi, getAuthToken } from "@/lib/api";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: string;
  xp?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const userData = await fetchApi("/users/me");
        setUser(userData);
      } catch (err) {
        console.error("Erro ao carregar perfil", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GamifiedLoading text="Carregando Perfil..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 to-slate-950 pointer-events-none" />
      <div className="absolute -top-[100px] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar Simple for Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <Gamepad2 className="w-6 h-6 text-neon-green" />
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text">
            AtivHub
          </div>
        </div>
        <button onClick={() => router.push("/")} className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-3xl w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-purple-500 flex items-center justify-center glow-purple overflow-hidden mb-4">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=1E293B`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-black text-white">{user.name}</h1>
          <p className="text-neon-green font-bold text-sm tracking-widest">{user.role}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <Mail className="text-slate-400" size={24} />
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <Shield className="text-slate-400" size={24} />
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargo</p>
              <p className="text-white font-medium">{user.role}</p>
            </div>
          </div>
          {user.role === "ALUNO" && (
            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-purple-500/30">
              <Award className="text-neon-green" size={24} />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Experiência (XP)</p>
                <p className="text-neon-green font-black">{user.xp || 0} XP</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}

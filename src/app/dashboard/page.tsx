"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfessorDashboard } from "@/components/ProfessorDashboard";
import { AlunoDashboard } from "@/components/AlunoDashboard";
import { motion } from "framer-motion";
import { fetchApi, getAuthToken } from "@/lib/api";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: string;
  xp?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const loadUser = async () => {
      try {
        const userData = await fetchApi("/users/me");
        setUser(userData);
      } catch (err: any) {
        console.error(err);
        setUser({ id: "error", name: "Erro ao carregar: " + err.message, email: "", role: "ERROR" });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GamifiedLoading text="Carregando Sistema..." />
      </div>
    );
  }

  if (!user) return null;

  const isProfessor = user.role === "PROFESSOR";

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/50 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] -left-[100px] w-[400px] h-[400px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Top Navbar Simple for Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text cursor-pointer">
          AtivHub
        </div>
        <div className="flex gap-4 items-center">
          {!isProfessor && (
            <button onClick={() => router.push("/activities")} className="text-slate-300 hover:text-purple-400 transition-colors font-semibold text-sm">
              Desafios
            </button>
          )}
          <button onClick={() => router.push("/users/me")} className="text-slate-300 hover:text-purple-400 transition-colors font-semibold text-sm">
            Meu Perfil
          </button>
          <button onClick={() => {
            if (typeof window !== "undefined") localStorage.removeItem("ativihub_token");
            router.push("/auth/login");
          }} className="text-red-400 hover:text-red-300 transition-colors font-semibold text-sm">
            Sair
          </button>
        </div>
      </div>

      <motion.div
        key={user.role}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isProfessor ? <ProfessorDashboard user={user} /> : <AlunoDashboard user={user} />}
      </motion.div>
    </main>
  );
}

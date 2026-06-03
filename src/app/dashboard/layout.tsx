"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, getAuthToken } from "@/lib/api";
import { GamifiedLoading } from "@/components/GamifiedLoading";
import { StudentProvider, useStudent } from "@/store/StudentContext";
import { ClassroomSidebar } from "@/components/ClassroomSidebar";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { Gamepad2 } from "lucide-react";

function StudentDashboardWrapper({ children }: { children: React.ReactNode }) {
  const { student, loading } = useStudent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <GamifiedLoading text="Carregando dados do aluno..." />
      </div>
    );
  }

  if (!student) return null;

  const hasNoClassrooms = student.classrooms.length === 0;

  // Se o aluno não tiver sala vinculada, exibe a tela de bloqueio com o JoinRoomForm centralizado
  if (hasNoClassrooms) {
    return (
      <main className="min-h-screen relative overflow-hidden flex flex-col justify-between bg-slate-950">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/40 to-transparent pointer-events-none" />
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] -left-[100px] w-[400px] h-[400px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Navbar */}
        <div className="w-full p-6 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-neon-green" />
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text">
              AtivHub
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <a 
              href="/users/me" 
              className="text-slate-300 hover:text-purple-400 transition-colors font-semibold text-sm cursor-pointer"
            >
              Meu Perfil
            </a>
            <button 
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("ativihub_token");
                window.location.href = "/";
              }} 
              className="text-red-400 hover:text-red-300 transition-colors font-semibold text-sm cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Formulário Centralizado de Acesso */}
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <JoinRoomForm />
        </div>

      </main>
    );
  }

  // Se o aluno tiver sala vinculada, renderiza o layout com a ClassroomSidebar
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      <ClassroomSidebar />
      <main className="flex-1 min-h-screen relative overflow-hidden pt-20 md:pt-0">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const checkUser = async () => {
      try {
        const userData = await fetchApi("/users/me");
        setRole(userData.role);
        
        // Se for professor acessando o painel geral do aluno, redireciona imediatamente
        if (userData.role === "PROFESSOR" && pathname === "/dashboard") {
          router.push("/dashboard/teacher");
        }
      } catch (err) {
        console.error("Erro ao autenticar no DashboardLayout:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <GamifiedLoading text="Sincronizando Sessão..." />
      </div>
    );
  }

  // Se for Professor, deixa renderizar diretamente (ele possui rotas e layouts específicos no painel dele)
  if (role === "PROFESSOR") {
    return <>{children}</>;
  }

  return (
    <StudentProvider>
      <StudentDashboardWrapper>{children}</StudentDashboardWrapper>
    </StudentProvider>
  );
}

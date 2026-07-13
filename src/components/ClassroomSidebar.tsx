"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStudent } from "@/store/StudentContext";
import { 
  LayoutDashboard, 
  Sword, 
  Trophy, 
  User, 
  LogOut, 
  Plus, 
  Menu, 
  X, 
  BookOpen,
  ArrowLeftRight,
  Gamepad2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export function ClassroomSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { student, activeClassroomId, setActiveClassroomId } = useStudent();
  const [isOpen, setIsOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  if (!student) return null;

  const activeRoom = student.classrooms.find(c => c.id === activeClassroomId);

  const navItems = [
    { name: "Painel Geral", path: "/dashboard", icon: LayoutDashboard },
    { name: "Minhas Missões", path: "/dashboard/activities", icon: Sword },
    { name: "Ranking da Turma", path: "/dashboard/ranking", icon: Trophy },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ativihub_token");
    }
    router.push("/");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-xl border-r border-slate-900 text-slate-300 p-6">
      {/* header da marca */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900">
        <div 
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Gamepad2 className="w-6 h-6 text-neon-green" />
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text">
            AtivHub
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
        >
          <X size={20} />
        </button>
      </div>

      {/* detalhes da sala selecionada */}
      {activeRoom ? (
        <div className="mb-8 p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl glow-purple relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">Turma Ativa</p>
          <h4 className="text-white font-black text-lg truncate leading-tight">{activeRoom.name}</h4>
          <p className="text-xs text-slate-400 truncate mb-2">{activeRoom.subject}</p>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
            {activeRoom.code}
          </span>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
          <p className="text-xs text-slate-500 font-medium">Nenhuma turma selecionada</p>
        </div>
      )}

      {/* navegação principal */}
      <div className="space-y-1.5 mb-8">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-3 mb-2">Navegação</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                isActive 
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                  : "hover:bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* lista de salas */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        <div className="flex items-center justify-between px-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Minhas Salas</p>
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            className="text-purple-400 hover:text-purple-300 p-1 hover:bg-slate-900 rounded-lg transition-all"
            title="Entrar em outra sala"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {student.classrooms.map((room) => {
            const isSelected = room.id === activeClassroomId;
            return (
              <button
                key={room.id}
                onClick={() => setActiveClassroomId(room.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all border ${
                  isSelected
                    ? "bg-slate-900 border-neon-green/30 text-white font-bold"
                    : "bg-slate-950/40 border-transparent hover:border-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen size={14} className={isSelected ? "text-neon-green" : "text-slate-600"} />
                  <span className="truncate">{room.name}</span>
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_6px_#10B981]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* perfil e logout */}
      <div className="mt-auto pt-6 border-t border-slate-900 space-y-2">
        <button
          onClick={() => handleNavigate("/users/me")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
            pathname === "/users/me"
              ? "bg-slate-900 text-white"
              : "hover:bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          {student.photoUrl ? (
            <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              <img src={student.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-800 shrink-0">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}&backgroundColor=1E293B`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          )}
          Meu Perfil
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all text-left"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* nav do topo mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 p-4 flex justify-between items-center z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="text-slate-300 hover:text-white p-2 hover:bg-slate-900 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-neon-green" />
            <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text">
              AtivHub
            </div>
          </div>
        </div>
        {activeRoom && (
          <div className="text-xs bg-purple-950/30 border border-purple-500/30 px-3 py-1.5 rounded-xl text-white font-bold flex items-center gap-1.5 max-w-[160px]">
            <BookOpen size={12} className="text-purple-400 shrink-0" />
            <span className="truncate shrink">{activeRoom.name}</span>
          </div>
        )}
      </div>

      {/* sidebar desktop fixa */}
      <div className="hidden md:block w-72 h-screen shrink-0 sticky top-0 sidebar-student-container">
        <div className="h-full sidebar-student">
          {sidebarContent}
        </div>
      </div>

      {/* drawer mobile lateral */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-80 max-w-[85vw] h-full z-10 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* modal de entrar na sala */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md">
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-900 transition-colors z-20"
              >
                <X size={20} />
              </button>
              <JoinRoomForm 
                message="Insira o código fornecido pelo seu professor para fazer parte de uma nova turma." 
                className="shadow-[0_0_50px_rgba(139,92,246,0.25)] border border-slate-700 bg-slate-950" 
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Award } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useStudent, StudentClassroom } from "@/store/StudentContext";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export interface RankingItem {
  id?: string;
  position?: number;
  localPos?: number;
  name?: string;
  level?: number;
  xp?: number;
  answeredActivitiesCount?: number;
  submissionsCount?: number;
  email?: string;
  roomCode?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    xp?: number;
  };
}

export default function DashboardRankingPage() {
  const { student, activeClassroomId } = useStudent();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeRoom = student?.classrooms.find((c: StudentClassroom) => c.id === activeClassroomId);

  useEffect(() => {
    if (!student || !activeClassroomId) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const loadRankingData = async () => {
      setLoading(true);
      setError("");
      try {
        const isUuid = (id: string | null | undefined): boolean => {
          if (!id) return false;
          const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
          return uuidRegex.test(id);
        };

        let rankingArray: RankingItem[] = [];

        if (isUuid(activeClassroomId)) {
          // sala de vdd (uuid): puxa direto do back
          const data = await fetchApi(`/users/ranking?classroomId=${activeClassroomId}`);
          rankingArray = Array.isArray(data) 
            ? data 
            : (data?.content || data?.data || []);
        } else {
          // sala default/mock: puxa global e filtra no client
          const data = await fetchApi(`/users/ranking`);
          const allRanking: RankingItem[] = Array.isArray(data) 
            ? data 
            : (data?.content || data?.data || []);
          
          // filtra pelo codigo da sala ativa
          rankingArray = allRanking.filter((item: RankingItem) => {
            return !!(item.roomCode && item.roomCode.toUpperCase() === activeRoom?.code.toUpperCase());
          });

          // fallback mock se a sala mock nao tiver alunos no banco
          if (rankingArray.length === 0) {
            rankingArray = [
              {
                user: { id: student.id, name: student.name, email: student.email, xp: student.xp || 120 },
                xp: student.xp || 120,
                answeredActivitiesCount: 3,
                roomCode: activeRoom?.code
              },
              {
                user: { id: "mock-1", name: "Ana Silva", email: "ana@example.com", xp: 350 },
                xp: 350,
                answeredActivitiesCount: 8,
                roomCode: activeRoom?.code
              },
              {
                user: { id: "mock-2", name: "Pedro Santos", email: "pedro@example.com", xp: 280 },
                xp: 280,
                answeredActivitiesCount: 6,
                roomCode: activeRoom?.code
              },
              {
                user: { id: "mock-3", name: "Maria Oliveira", email: "maria@example.com", xp: 190 },
                xp: 190,
                answeredActivitiesCount: 4,
                roomCode: activeRoom?.code
              }
            ];
          }
        }

        // recalcula as posicoes locais do ranking da sala
        const ordered = rankingArray
          .sort((a: RankingItem, b: RankingItem) => {
            const xpA = (a.user?.xp ?? a.xp ?? 0);
            const xpB = (b.user?.xp ?? b.xp ?? 0);
            return xpB - xpA;
          })
          .map((item: RankingItem, i: number) => ({
            ...item,
            localPos: i + 1
          }));

        setRanking(ordered);
      } catch (err: unknown) {
        console.error("Erro ao carregar ranking da sala:", err);
        const errMsg = err instanceof Error ? err.message : "Não foi possível carregar o ranking da turma.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    loadRankingData();
  }, [student, activeClassroomId, activeRoom?.code]);

  if (!student) return null;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h3 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <Trophy className="text-yellow-400 font-bold" size={28} />
          Placar de Líderes
        </h3>
        {activeRoom && (
          <p className="text-slate-400 text-xs mt-1">
            Melhores pontuações da turma <span className="text-yellow-400 font-bold">{activeRoom.name}</span>
          </p>
        )}
      </motion.div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-900 min-h-[300px]">
        {loading ? (
          <div className="py-12">
            <GamifiedLoading text="Analisando Desempenho dos Alunos..." className="scale-90" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center text-sm font-bold">
            {error}
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Nenhum aluno classificado nesta sala ainda.
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((item, i) => {
              const rUser = item.user || item;
              const subsCount = item.answeredActivitiesCount ?? item.submissionsCount ?? 0;
              const itemXp = rUser.xp || 0;
              const avatarSeed = rUser.email || rUser.name || 'guest';
              const pos = item.localPos || (i + 1);
              
              // variaveis de estilo pras posicoes
              const isFirst = pos === 1;
              const isSecond = pos === 2;
              const isThird = pos === 3;

              return (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={rUser.id || rUser.name || i}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isFirst 
                      ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
                      : isSecond 
                        ? 'bg-slate-300/10 border-slate-300/40' 
                        : isThird 
                          ? 'bg-amber-700/10 border-amber-700/40' 
                          : 'bg-slate-900/30 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className={`font-black text-xl w-8 text-center ${
                    isFirst ? 'text-yellow-400' : isSecond ? 'text-slate-300' : isThird ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    #{pos}
                  </div>
                  
                  <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 ${
                    isFirst ? 'border-yellow-400 glow-purple' : isSecond ? 'border-slate-300' : isThird ? 'border-amber-600' : 'border-slate-800'
                  }`}>
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=1E293B`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate flex items-center gap-2">
                      {rUser.name}
                      {rUser.email === student.email && (
                        <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90">
                          Você
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {subsCount} missões completadas
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-sm text-neon-green flex items-center gap-1">
                      <Award size={14} className="text-neon-green" />
                      {itemXp} <span className="text-[10px] text-slate-500 font-medium">XP</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

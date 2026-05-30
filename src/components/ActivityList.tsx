"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, CheckCircle2, Send, Clock, Award } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useStudent, StudentClassroom } from "@/store/StudentContext";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export function ActivityList() {
  const { student, activeClassroomId } = useStudent();
  const [activities, setActivities] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Submission Form State
  const [answeringActId, setAnsweringActId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const activeRoom = student?.classrooms.find((c: StudentClassroom) => c.id === activeClassroomId);

  useEffect(() => {
    if (!student || !activeClassroomId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        // Query param compatibility: pass classroomId, classroomCode, and roomCode to handle any backend design
        const queryParams = new URLSearchParams({
          classroomId: activeClassroomId,
          classroomCode: activeRoom?.code || "",
          roomCode: activeRoom?.code || ""
        }).toString();

        const rawActs = await fetchApi(`/activities?${queryParams}`);
        const actsData = Array.isArray(rawActs) 
          ? rawActs 
          : (rawActs?.content || rawActs?.data || []);

        const rawSubs = await fetchApi("/submissions/me");
        const subsData = Array.isArray(rawSubs) 
          ? rawSubs 
          : (rawSubs?.content || rawSubs?.data || []);

        setActivities(actsData);
        setSubmissions(subsData);
      } catch (err: any) {
        console.error("Erro ao carregar dados de atividades da sala:", err);
        setError(err.message || "Não foi possível carregar as atividades da turma.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [student, activeClassroomId, activeRoom?.code]);

  const hasSubmitted = (act: any) => {
    return submissions.some(s => {
      const sActId = s.activityId ?? s.activity?.id;
      if (sActId !== undefined && sActId !== null && String(sActId) === String(act.id)) {
        return true;
      }
      const sActTitle = s.activityTitle ?? s.activity?.title;
      if (sActTitle && sActTitle === act.title) {
        return true;
      }
      return false;
    });
  };

  const getSubmissionStatus = (act: any) => {
    const sub = submissions.find(s => {
      const sActId = s.activityId ?? s.activity?.id;
      if (sActId !== undefined && sActId !== null && String(sActId) === String(act.id)) {
        return true;
      }
      const sActTitle = s.activityTitle ?? s.activity?.title;
      return sActTitle && sActTitle === act.title;
    });

    if (!sub) return null;
    return {
      grade: sub.grade,
      approved: sub.approved,
      isPending: sub.grade === null || sub.grade === undefined || sub.status === 'PENDING' || sub.feedback === null
    };
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringActId || !answerText.trim()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await fetchApi(`/activities/${answeringActId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answer: answerText })
      });
      
      // Update local submissions list
      const newSubmission = {
        activityId: answeringActId,
        activityTitle: activities.find(a => a.id === answeringActId)?.title,
        answer: answerText,
        feedback: null,
        grade: null,
        status: "PENDING",
        submittedAt: new Date().toISOString()
      };
      
      setSubmissions(prev => [...prev, newSubmission]);
      setAnsweringActId(null);
      setAnswerText("");
    } catch (err: any) {
      setSubmitError(err.message || "Falha ao enviar resposta para a missão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeClassroomId) {
    return (
      <div className="text-center py-12 text-slate-500 font-bold glass-panel rounded-3xl">
        Por favor, selecione uma sala para visualizar as missões.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-16">
        <GamifiedLoading text="Escaneando Mural de Missões..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center font-bold">
        {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 text-slate-500 font-bold glass-panel rounded-3xl border border-slate-900"
      >
        Nenhuma missão ativa encontrada para esta turma no momento.
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {activities.map((act) => {
          const subStatus = getSubmissionStatus(act);
          const submitted = subStatus !== null;
          
          return (
            <motion.div 
              key={act.id}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1 }
              }}
              className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between border ${
                submitted 
                  ? "border-slate-800/80 opacity-75" 
                  : "border-purple-500/20 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300"
              }`}
            >
              <div>
                {/* XP Reward Badge */}
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-black text-xs shadow-md uppercase tracking-wider ${
                  submitted 
                    ? "bg-slate-800 text-slate-400 border-l border-b border-slate-700" 
                    : "bg-neon-green text-slate-950 glow-purple"
                }`}>
                  +{act.xpReward} XP
                </div>
                
                <h4 className="text-lg font-black text-white mb-2 pr-16 mt-2 leading-tight">
                  {act.title}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
                  {act.description}
                </p>
              </div>
              
              <div>
                {submitted ? (
                  subStatus.isPending ? (
                    <div className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                      <Clock size={14} className="text-amber-500" />
                      Aguardando Avaliação
                    </div>
                  ) : (
                    <div className="w-full py-2.5 px-4 bg-slate-950 border border-neon-green/20 rounded-xl text-neon-green text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 size={14} />
                      Concluído (Nota: {subStatus.grade})
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => {
                      setAnsweringActId(act.id);
                      setSubmitError("");
                    }}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Sword size={14} className="group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
                    Iniciar Missão
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Answer Submission Modal */}
      <AnimatePresence>
        {answeringActId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAnsweringActId(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-xl relative z-10 shadow-[0_0_50px_rgba(139,92,246,0.2)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                  <Sword size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">Executar Missão</h3>
                  <p className="text-xs text-slate-400">
                    {activities.find(a => a.id === answeringActId)?.title}
                  </p>
                </div>
              </div>
              
              {submitError && (
                <div className="my-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitAnswer} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Sua Resposta / Solução
                  </label>
                  <textarea 
                    required
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[180px] text-sm disabled:opacity-50 outline-none"
                    placeholder="Digite sua resposta detalhada aqui..."
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setAnsweringActId(null)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 group cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
                        Enviar Resposta
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

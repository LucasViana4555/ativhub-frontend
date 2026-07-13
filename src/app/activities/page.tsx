"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, CheckCircle2, Send, ArrowLeft, Gamepad2 } from "lucide-react";
import { fetchApi, getAuthToken } from "@/lib/api";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [answeringActId, setAnsweringActId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        let actsData = [];
        let subsData = [];
        
        try {
          const rawActs = await fetchApi("/activities");
          actsData = Array.isArray(rawActs) ? rawActs : (rawActs?.content || rawActs?.data || []);
        } catch (err: any) {
          console.error("Erro ao carregar atividades", err);
          setFetchError("Não foi possível carregar as missões. " + (err.message || ""));
        }

        try {
          const rawSubs = await fetchApi("/submissions/me");
          subsData = Array.isArray(rawSubs) ? rawSubs : (rawSubs?.content || rawSubs?.data || []);
        } catch (err: any) {
          console.error("Erro ao carregar submissões", err);
        }

        setActivities(actsData);
        setSubmissions(subsData);
      } catch (err) {
        console.error("Erro geral na tela de atividades", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const hasSubmitted = (act: any) => {
    return submissions.some(s => {
      // cruza pelo id se o back retornar
      const sActId = s.activityId ?? s.activity?.id;
      if (sActId !== undefined && sActId !== null && String(sActId) === String(act.id)) {
        return true;
      }
      
      // fallback: cruza pelo titulo se o back retornar so o activitytitle no dto flat
      const sActTitle = s.activityTitle ?? s.activity?.title;
      if (sActTitle && sActTitle === act.title) {
        return true;
      }
      
      return false;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringActId || !answerText.trim()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await fetchApi(`/activities/${answeringActId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answer: answerText })
      });
      
      // att local ou refetch
      setSubmissions(prev => [...prev, { activityId: answeringActId, feedback: null, grade: null }]);
      setAnsweringActId(null);
      setAnswerText("");
    } catch (err: any) {
      setSubmitError(err.message || "Você já enviou essa resposta ou ocorreu um erro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden pt-24 pb-12 px-4">
      {/* decoracao do bg */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/50 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] -left-[100px] w-[400px] h-[400px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

      {/* nav simples pra navegar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <Gamepad2 className="w-6 h-6 text-neon-green" />
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text">
            AtivHub
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Sword className="text-neon-green" size={32} /> Mural de Atividades
        </h3>

        {fetchError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 font-bold text-center">
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="py-12">
            <GamifiedLoading text="Carregando Atividades..." />
          </div>
        ) : activities.length === 0 && !fetchError ? (
          <div className="text-center py-12 text-slate-500 font-bold glass-panel rounded-3xl">
            Nenhuma atividade disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act, i) => {
              const submitted = hasSubmitted(act);
              return (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col ${
                    submitted ? "border-slate-700 opacity-70" : "border-purple-500/30 hover:border-purple-500 transition-colors glow-purple hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  }`}
                >
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-sm shadow-lg ${
                    submitted ? "bg-slate-700 text-slate-300" : "bg-neon-green text-slate-900 glow-purple"
                  }`}>
                    {act.xpReward} XP
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-3 mt-4">{act.title}</h4>
                  <p className="text-slate-400 text-sm flex-1 mb-6">{act.description}</p>
                  
                  {submitted ? (
                    <div className="w-full py-3 px-4 bg-slate-800/50 rounded-xl text-slate-400 font-semibold flex items-center justify-center gap-2 border border-slate-700">
                      <CheckCircle2 size={18} /> Enviado
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnsweringActId(act.id);
                        setSubmitError("");
                      }}
                      className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 group"
                    >
                      <Sword size={18} className="group-hover:-rotate-12 group-hover:scale-125 transition-transform duration-300" /> Responder
                    </button>

                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* modal de resposta */}
      <AnimatePresence>
        {answeringActId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAnsweringActId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl relative z-10 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Executar Missão</h2>
              <p className="text-slate-400 mb-6">
                {activities.find(a => a.id === answeringActId)?.title}
              </p>
              
              {submitError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea 
                    required
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[200px] text-sm disabled:opacity-50"
                    placeholder="Digite sua resposta aqui..."
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setAnsweringActId(null)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                  >
                    {isSubmitting ? "Enviando..." : <><Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /> Enviar Resposta</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

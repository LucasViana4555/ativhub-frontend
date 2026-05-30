"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Award, CheckCircle2, Target, Edit2, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { UserData } from "@/store/StudentContext";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export function AlunoDashboard({ user }: { user: UserData }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States para editar
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editAnswerText, setEditAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const xp = user.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const progressPercentage = xpInCurrentLevel;

  const loadSubmissions = async () => {
    try {
      const rawSubs = await fetchApi("/submissions/me");
      const subs = Array.isArray(rawSubs) ? rawSubs : (rawSubs?.content || rawSubs?.data || []);
      setSubmissions(subs);
    } catch (err) {
      console.error("Erro ao carregar histórico", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar essa resposta?")) return;
    try {
      await fetchApi(`/submissions/${id}`, { method: "DELETE" });
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Erro ao deletar", err);
      alert("Erro ao deletar a submissão.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubId || !editAnswerText.trim()) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await fetchApi(`/submissions/${editingSubId}`, {
        method: "PUT",
        body: JSON.stringify({ answer: editAnswerText })
      });
      await loadSubmissions();
      setEditingSubId(null);
    } catch (err: any) {
      setSubmitError(err.message || "Erro ao editar submissão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (sub: any) => {
    setEditingSubId(sub.id);
    setEditAnswerText(sub.answer || "");
    setSubmitError("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-24 pb-12 px-4">
      {/* Gamer Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl mb-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-neon-green flex items-center justify-center glow-purple overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=1E293B`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-neon-green text-slate-900 font-bold px-4 py-1 rounded-full text-sm shadow-lg border-2 border-slate-900 flex items-center justify-center whitespace-nowrap leading-none">
              Nível {level}
            </div>
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-0">{user.name}</h2>
            <p className="text-slate-400 text-sm mb-2">{user.email}</p>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start text-neon-green font-semibold">
              <Shield size={20} /> Aluno Destaque
            </div>

            <div className="w-full">
              <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Progresso: {xp} XP</span>
                <span>Próximo Nível: {level * 100} XP</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-neon-green glow-purple"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* historico */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Award className="text-purple-400" /> Histórico de Atividades
        </h3>
        <div className="glass-panel rounded-3xl p-6 min-h-[400px]">
          {loading ?
            <div className="py-8"><GamifiedLoading text="Carregando Histórico..." className="scale-75" /></div>
            : submissions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhuma missão completada ainda.</p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                {submissions.map((sub, i) => {
                  const isPending = sub.grade === null || sub.grade === undefined || sub.status === 'PENDING';
                  return (
                    <motion.div
                      key={sub.id || i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${!isPending
                          ? (sub.approved ? "bg-neon-green text-slate-900" : "bg-red-500 text-white")
                          : "bg-slate-700 text-slate-400"
                        }`}>
                        {!isPending ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <div className="bg-slate-800 p-2 rounded-lg">
                              <Target className="text-purple-400" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{sub.activityTitle || sub.activity?.title || "Atividade Desconhecida"}</h4>
                              <p className="text-xs text-slate-500">{new Date(sub.submittedAt || sub.createdAt || Date.now()).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                          {isPending && (
                            <div className="flex gap-2">
                              <button onClick={() => openEditModal(sub)} className="text-purple-400 hover:bg-purple-500/20 p-1.5 rounded-lg transition-colors group">
                                <Edit2 size={16} className="group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
                              </button>
                              <button onClick={() => handleDelete(sub.id)} className="text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition-colors group">
                                <Trash2 size={16} className="group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-400 text-sm font-mono break-words mt-2">
                            {sub.answer || "Sem resposta"}
                          </div>
                        </div>

                        <div className="text-right mt-2">
                          <div className={`text-sm font-bold ${!isPending ? 'text-neon-green' : 'text-slate-400'}`}>
                            {!isPending ? `Nota: ${sub.grade}` : "Aguardando"}
                          </div>
                        </div>
                        {sub.feedback ? (
                          <p className="text-slate-300 text-xs italic border-l-2 border-purple-500 pl-2 mt-2">"{sub.feedback}"</p>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* edit modal */}
      <AnimatePresence>
        {editingSubId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingSubId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl relative z-10 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Editar Resposta</h2>
              {submitError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <textarea
                  required
                  value={editAnswerText}
                  onChange={e => setEditAnswerText(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[200px] font-mono text-sm disabled:opacity-50"
                />
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setEditingSubId(null)} disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors disabled:opacity-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-all disabled:opacity-50">
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

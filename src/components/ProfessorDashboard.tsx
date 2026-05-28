"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, BookOpen, CheckCircle, Clock, Edit2, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { UserData } from "@/app/dashboard/page";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export function ProfessorDashboard({ user }: { user: UserData }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evaluatingSubId, setEvaluatingSubId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState<number>(10);
  const [isCreating, setIsCreating] = useState(false);
  const [editingActId, setEditingActId] = useState<string | null>(null);

  // Submissions State
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [activitySubmissions, setActivitySubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Eval State
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState<number>(100);
  const [approved, setApproved] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [createError, setCreateError] = useState("");
  const [evalError, setEvalError] = useState("");

  const loadDashboardData = async () => {
    try {
      let acts: any[] = [];
      let allSubs: any[] = [];
      
      try {
        const rawActs = await fetchApi("/activities/professor");
        acts = Array.isArray(rawActs) ? rawActs : (rawActs?.content || rawActs?.data || []);
      } catch (err) {
        console.error("Erro atividades:", err);
      }

      // Fetch submissions for all activities to get the real global pending count
      if (acts.length > 0) {
        try {
          const subsPromises = acts.map(act => fetchApi(`/activities/${act.id}/submissions`).catch(() => []));
          const subsResults = await Promise.all(subsPromises);
          
          subsResults.forEach(rawSubs => {
            const actSubs = Array.isArray(rawSubs) ? rawSubs : (rawSubs?.content || rawSubs?.data || []);
            allSubs = [...allSubs, ...actSubs];
          });
        } catch (err) {
          console.error("Erro ao buscar submissões gerais:", err);
        }
      }

      setActivities(acts);
      setSubmissions(allSubs);
      
      if (selectedActivityId) {
        loadSubmissionsForActivity(selectedActivityId);
      }
    } catch (err) {
      console.error("Erro geral no dashboard", err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSubmissionsForActivity = async (activityId: string) => {
    setSelectedActivityId(activityId);
    setLoadingSubmissions(true);
    try {
      const rawSubs = await fetchApi(`/activities/${activityId}/submissions`);
      const subs = Array.isArray(rawSubs) ? rawSubs : (rawSubs?.content || rawSubs?.data || []);
      setActivitySubmissions(subs);
    } catch (err) {
      console.error("Erro ao buscar submissões da atividade", err);
      setActivitySubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const pendingSubmissions = submissions.filter(s => s.grade === null || s.grade === undefined || s.status === 'PENDING' || s.feedback === null);
  const evaluatedSubmissions = submissions.filter(s => !pendingSubmissions.includes(s));

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar essa atividade?")) return;
    try {
      await fetchApi(`/activities/${id}`, { method: "DELETE" });
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Erro ao deletar", err);
      alert("Erro ao deletar a atividade.");
    }
  };

  const openEditActModal = (act: any) => {
    setEditingActId(act.id);
    setTitle(act.title || "");
    setDescription(act.description || "");
    setXpReward(act.xpReward || 10);
    setCreateError("");
  };

  const handleCreateOrEditActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (xpReward < 1) return;
    
    setIsCreating(true);
    setCreateError("");
    try {
      if (editingActId) {
        await fetchApi(`/activities/${editingActId}`, {
          method: "PUT",
          body: JSON.stringify({ title, description, xpReward: Number(xpReward) })
        });
      } else {
        await fetchApi("/activities", {
          method: "POST",
          body: JSON.stringify({ title, description, xpReward: Number(xpReward) })
        });
      }
      
      setTitle("");
      setDescription("");
      setXpReward(10);
      setIsModalOpen(false);
      setEditingActId(null);
      loadDashboardData(); // Refetch
    } catch (err: any) {
      console.error("Erro ao salvar atividade", err);
      setCreateError(err.message || "Erro ao conectar com a API.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingSubId) return;

    setIsEvaluating(true);
    setEvalError("");
    try {
      await fetchApi(`/submissions/${evaluatingSubId}/feedback`, {
        method: "PUT",
        body: JSON.stringify({ feedback, grade: Number(grade), approved })
      });
      setEvaluatingSubId(null);
      setFeedback("");
      setGrade(100);
      setApproved(true);
      loadDashboardData(); // Refetch
    } catch (err: any) {
      console.error("Erro ao avaliar", err);
      setEvalError(err.message || "Erro ao avaliar submissão.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loadingData) {
    return (
      <div className="w-full max-w-6xl mx-auto pt-24 pb-12 px-4 flex justify-center">
        <GamifiedLoading text="Carregando Painel do Mestre..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-24 pb-12 px-4">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-purple-500"
        >
          <div className="bg-purple-500/20 p-4 rounded-xl">
            <BookOpen className="text-purple-400" size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Atividades Criadas</p>
            <h2 className="text-4xl font-bold text-white">{activities.length}</h2>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-neon-green"
        >
          <div className="bg-neon-green/10 p-4 rounded-xl">
            <Clock className="text-neon-green" size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Submissões Pendentes</p>
            <h2 className="text-4xl font-bold text-white">{pendingSubmissions.length}</h2>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full h-full py-6 md:py-0 glass-panel flex flex-col items-center justify-center rounded-2xl gap-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all border-dashed border-2 border-purple-500/30 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <PlusCircle size={40} />
            <span className="text-lg font-semibold uppercase tracking-wider">Nova Atividade</span>
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col: Activities */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BookOpen className="text-purple-500" /> Suas Atividades
          </h3>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhuma atividade criada.</p>
            ) : activities.map((act, i) => (
              <motion.div 
                key={act.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-colors"
              >
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 rounded-bl-xl font-bold text-sm shadow-lg z-10">
                  +{act.xpReward} XP
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">{act.title}</h4>
                    <p className="text-slate-400 text-sm">{act.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 relative z-20">
                    <button onClick={() => loadSubmissionsForActivity(act.id)} className={`p-2 rounded-lg transition-colors ${selectedActivityId === act.id ? "bg-neon-green text-slate-900" : "text-neon-green hover:bg-purple-500/20"}`} title="Ver Submissões">
                      <Clock size={18} />
                    </button>
                    <button onClick={() => { setIsModalOpen(true); openEditActModal(act); }} className="text-purple-400 hover:bg-purple-500/20 p-2 rounded-lg transition-colors" title="Editar Atividade">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteActivity(act.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors" title="Apagar Atividade">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Col: Submissions */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="text-neon-green" /> {selectedActivityId ? "Submissões da Atividade" : "Pendentes (Visão Geral)"}
          </h3>
          <div className="space-y-4">
            {selectedActivityId && loadingSubmissions ? (
              <div className="py-8 flex justify-center"><GamifiedLoading text="Carregando..." className="scale-75" /></div>
            ) : selectedActivityId ? (
              activitySubmissions.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-2 border-slate-700">
                  <CheckCircle className="mx-auto text-slate-500 mb-4" size={48} />
                  <p className="text-slate-400">Ninguém enviou resposta para essa atividade ainda.</p>
                </div>
              ) : (
                activitySubmissions.map((sub, i) => {
                  const isPending = sub.grade === null || sub.grade === undefined || sub.status === 'PENDING';
                  return (
                    <motion.div 
                      key={sub.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass-panel p-6 rounded-2xl border-l-2 transition-colors ${isPending ? "border-l-neon-green/50 hover:border-l-neon-green" : "border-l-purple-500/50"}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white">{sub.activityTitle || sub.activity?.title || "Desafio sem título"}</h4>
                          <p className="text-sm text-slate-400">Aluno: <span className="text-purple-400 font-medium">{sub.studentName || sub.student?.name || "Desconhecido"}</span></p>
                        </div>
                        {isPending ? (
                          <button
                            onClick={() => setEvaluatingSubId(sub.id)}
                            className="bg-neon-green/20 text-neon-green hover:bg-purple-500 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                          >
                            Avaliar
                          </button>
                        ) : (
                          <div className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Nota: {sub.grade}
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl text-slate-300 text-sm font-mono border border-slate-800 break-words">
                        {sub.answer || "Sem resposta em texto"}
                      </div>
                      {!isPending && sub.feedback && (
                        <p className="mt-3 text-sm italic text-purple-400">"{sub.feedback}"</p>
                      )}
                    </motion.div>
                  )
                })
              )
            ) : (
              // Visão Geral
              pendingSubmissions.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-2 border-slate-700">
                  <CheckCircle className="mx-auto text-slate-500 mb-4" size={48} />
                  <p className="text-slate-400">Tudo em dia! Nenhuma submissão pendente na visão geral. Clique em uma atividade para ver todas as submissões.</p>
                </div>
              ) : (
                pendingSubmissions.map((sub, i) => (
                  <motion.div 
                    key={sub.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel p-6 rounded-2xl border-l-2 border-l-neon-green/50 hover:border-l-neon-green transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{sub.activityTitle || sub.activity?.title || "Desafio sem título"}</h4>
                        <p className="text-sm text-slate-400">Aluno: <span className="text-purple-400 font-medium">{sub.studentName || sub.student?.name || "Desconhecido"}</span></p>
                      </div>
                      <button
                        onClick={() => setEvaluatingSubId(sub.id)}
                        className="bg-neon-green/20 text-neon-green hover:bg-purple-500 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                      >
                        Avaliar
                      </button>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl text-slate-300 text-sm font-mono border border-slate-800 break-words">
                      {sub.answer}
                    </div>
                  </motion.div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Activity Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setEditingActId(null); setTitle(""); setDescription(""); setXpReward(10); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
            >
              <h2 className="text-3xl font-bold text-white mb-6">{editingActId ? "Editar Atividade" : "Nova Atividade"}</h2>
              {createError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreateOrEditActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Título</label>
                  <input 
                    required
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isCreating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                    placeholder="Ex: Desafio de Matemática: Tabuada do 7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                  <textarea 
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isCreating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[100px] disabled:opacity-50"
                    placeholder="Descreva a missão do aluno..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Recompensa (XP)</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={xpReward}
                    onChange={e => setXpReward(Number(e.target.value))}
                    disabled={isCreating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-neon-green font-bold focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all disabled:opacity-50"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
                  >
                    {isCreating ? "Criando..." : "Criar Missão"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Evaluate Submission Drawer/Modal */}
      <AnimatePresence>
        {evaluatingSubId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEvaluatingSubId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Avaliar Submissão</h2>
              {evalError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                  {evalError}
                </div>
              )}
              <form onSubmit={handleEvaluate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nota (0 - 100)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    max="100"
                    value={grade}
                    onChange={e => setGrade(Number(e.target.value))}
                    disabled={isEvaluating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Feedback Mágico</label>
                  <textarea 
                    required
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    disabled={isEvaluating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all min-h-[100px] disabled:opacity-50"
                    placeholder="Muito bem, guerreiro!..."
                  />
                </div>
                <div className="flex items-center gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <input 
                    type="checkbox"
                    id="approved"
                    checked={approved}
                    onChange={e => setApproved(e.target.checked)}
                    disabled={isEvaluating}
                    className="w-5 h-5 rounded accent-neon-green cursor-pointer"
                  />
                  <label htmlFor="approved" className="text-white font-medium cursor-pointer">
                    Aprovar e Enviar XP
                  </label>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEvaluatingSubId(null)}
                    disabled={isEvaluating}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isEvaluating}
                    className="flex-1 px-4 py-3 rounded-xl bg-neon-green text-slate-900 font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all disabled:opacity-50"
                  >
                    {isEvaluating ? "Avaliando..." : "Confirmar"}
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

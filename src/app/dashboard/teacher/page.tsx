"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Plus, 
  LogOut, 
  Clock, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  PlusCircle, 
  Search, 
  Award,
  ChevronRight,
  School,
  Sparkles,
  ClipboardList,
  Gamepad2
} from "lucide-react";
import { fetchApi, getAuthToken, removeAuthToken } from "@/lib/api";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: string;
  xp?: number;
  school?: string;
  subject?: string;
  escola?: string;
  disciplina?: string;
}

interface Classroom {
  id: string;
  name: string;
  subject: string;
  code: string;
  studentCount: number;
  avgXp: number;
}

const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: "1", name: "9º Ano A", subject: "Matemática", code: "MAT-9A", studentCount: 14, avgXp: 340 },
  { id: "2", name: "8º Ano B", subject: "Geometria", code: "GEO-8B", studentCount: 18, avgXp: 290 },
  { id: "3", name: "Ensino Médio - 3º A", subject: "Física", code: "FIS-3A", studentCount: 10, avgXp: 120 }
];

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rooms" | "activities" | "reports">("rooms");
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

  // Salas State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomSubject, setNewRoomSubject] = useState("");

  // Atividades State (ported from ProfessorDashboard)
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

  // Relatórios/Ranking State
  const [ranking, setRanking] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [reportSearch, setReportSearch] = useState("");

  // Load user data
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/professor/login");
      return;
    }

    const loadUser = async () => {
      try {
        const userData = await fetchApi("/users/me");
        if (userData.role !== "PROFESSOR") {
          removeAuthToken();
          router.push("/auth/professor/login");
          return;
        }
        setUser(userData);
      } catch (err: any) {
        console.error(err);
        router.push("/auth/professor/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  // Load classrooms from backend
  useEffect(() => {
    if (!user) return;
    const loadClassrooms = async () => {
      try {
        const data = await fetchApi("/classrooms/me");
        setClassrooms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar salas:", err);
        setClassrooms([]);
      }
    };
    loadClassrooms();
  }, [user]);

  // Load activities, submissions and ranking
  const loadDashboardData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      let acts: any[] = [];
      let allSubs: any[] = [];
      
      try {
        const endpoint = selectedClassroomId ? `/activities?classroomId=${selectedClassroomId}` : "/activities";
        const rawActs = await fetchApi(endpoint);
        acts = Array.isArray(rawActs) ? rawActs : (rawActs?.content || rawActs?.data || []);
      } catch (err) {
        console.error("Erro atividades:", err);
      }

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

  const loadRankingData = async () => {
    setLoadingRanking(true);
    try {
      const data = await fetchApi("/users/ranking");
      const rankingArray = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setRanking(rankingArray);
    } catch (err) {
      console.error("Erro ao carregar ranking no painel", err);
    } finally {
      setLoadingRanking(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadRankingData();
    }
  }, [user, selectedClassroomId]);

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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName || !newRoomSubject || !user) return;

    try {
      const createdRoom = await fetchApi("/classrooms", {
        method: "POST",
        body: JSON.stringify({ name: newRoomName, subject: newRoomSubject }),
      });

      setClassrooms(prev => [...prev, createdRoom]);
      setNewRoomName("");
      setNewRoomSubject("");
      setIsRoomModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar sala:", err);
      alert("Erro ao criar sala no servidor.");
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta sala?") || !user) return;
    try {
      await fetchApi(`/classrooms/${id}`, { method: "DELETE" });
      setClassrooms(prev => prev.filter(r => r.id !== id));
      if (selectedClassroomId === id) {
        setSelectedClassroomId(null);
      }
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
      alert("Erro ao excluir sala no servidor.");
    }
  };

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
          body: JSON.stringify({ title, description, xpReward: Number(xpReward), classroomId: selectedClassroomId })
        });
      } else {
        if (!selectedClassroomId) {
          throw new Error("Selecione uma sala de aula primeiro.");
        }
        await fetchApi(`/activities/classrooms/${selectedClassroomId}`, {
          method: "POST",
          body: JSON.stringify({ title, description, xpReward: Number(xpReward) })
        });
      }
      
      setTitle("");
      setDescription("");
      setXpReward(10);
      setIsModalOpen(false);
      setEditingActId(null);
      loadDashboardData(); 
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
      loadDashboardData(); 
      loadRankingData(); 
    } catch (err: any) {
      console.error("Erro ao avaliar", err);
      setEvalError(err.message || "Erro ao avaliar submissão.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push("/auth/professor/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <GamifiedLoading text="Carregando portal do professor..." />
      </div>
    );
  }

  // Mapeador de alunos para salas baseados no ranking
  const getRoomForStudent = (student: any, index: number, rooms: Classroom[]) => {
    // Se houver código da sala atribuído
    if (student.roomCode && rooms.some(c => c.code === student.roomCode)) {
      return student.roomCode;
    }
    // Caso contrário, não mapeia o aluno para nenhuma sala do professor
    return "";
  };

  const getFilteredStudentsForRoom = (roomCode: string) => {
    return ranking.filter((item, index) => getRoomForStudent(item, index, classrooms) === roomCode);
  };

  const getRoomAvgXp = (roomCode: string) => {
    const students = getFilteredStudentsForRoom(roomCode);
    if (students.length === 0) return 0;
    const total = students.reduce((acc, s) => acc + (s.user?.xp || s.xp || 0), 0);
    return Math.round(total / students.length);
  };

  // Sala selecionada
  const selectedClassroom = classrooms.find(c => c.id === selectedClassroomId);

  // Estatísticas calculadas dinamicamente
  const activeRoomStudents = selectedClassroom 
    ? getFilteredStudentsForRoom(selectedClassroom.code) 
    : ranking.filter((student, index) => {
        const studentRoomCode = getRoomForStudent(student, index, classrooms);
        return studentRoomCode !== "";
      });
  const totalStudents = selectedClassroom ? activeRoomStudents.length : classrooms.reduce((acc, c) => acc + getFilteredStudentsForRoom(c.code).length, 0);
  const totalXP = activeRoomStudents.reduce((acc, item) => acc + (item.user?.xp || item.xp || 0), 0);
  const avgXP = activeRoomStudents.length > 0 ? Math.round(totalXP / activeRoomStudents.length) : 0;

  // Submissões filtradas por sala se uma sala estiver selecionada
  const filteredSubmissions = selectedClassroom 
    ? submissions.filter(sub => {
        const studentEmail = sub.student?.email || sub.studentEmail || "";
        const studentIndex = ranking.findIndex(r => (r.user?.email || r.email) === studentEmail);
        if (studentIndex === -1) return true;
        return getRoomForStudent(ranking[studentIndex], studentIndex, classrooms) === selectedClassroom.code;
      })
    : submissions;

  const pendingSubmissions = filteredSubmissions.filter(s => s.grade === null || s.grade === undefined || s.status === 'PENDING' || s.feedback === null);

  // Filtragem de ranking para os relatórios
  const filteredRanking = activeRoomStudents.filter(item => {
    const name = (item.user?.name || item.name || "").toLowerCase();
    const email = (item.user?.email || item.email || "").toLowerCase();
    return name.includes(reportSearch.toLowerCase()) || email.includes(reportSearch.toLowerCase());
  });

  // Auxiliares de renderização para o seletor de salas
  const renderSelectedRoomBanner = () => {
    if (!selectedClassroom) return null;
    return (
      <div className="bg-slate-900 border border-slate-800 px-6 py-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
            <Users className="text-orange-500" size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Turma Selecionada</span>
            <span className="text-sm font-bold text-white">
              {selectedClassroom.name} <span className="text-slate-500">•</span> {selectedClassroom.subject} <span className="text-slate-400 font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 ml-2">{selectedClassroom.code}</span>
            </span>
          </div>
        </div>
        <button 
          onClick={() => setSelectedClassroomId(null)}
          className="text-xs font-bold text-orange-500 hover:text-orange-400 hover:underline transition-all"
        >
          Limpar Seleção / Escolher Outra Sala
        </button>
      </div>
    );
  };

  const renderClassroomSelector = (title: string, subtitle: string) => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        {classrooms.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center border-dashed">
            <Users className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-white mb-2">Nenhuma sala criada</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              Você precisa criar pelo menos uma sala de aula na aba "Suas Salas" antes de gerenciar atividades ou visualizar relatórios.
            </p>
            <button 
              onClick={() => setActiveTab("rooms")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all"
            >
              Ir para Suas Salas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classrooms.map((room) => {
              const students = getFilteredStudentsForRoom(room.code);
              const avgXp = getRoomAvgXp(room.code);
              
              return (
                <div 
                  key={room.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-orange-500/50 transition-all duration-300 relative group"
                >
                  <div>
                    <span className="text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase">
                      {room.subject}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{room.name}</h3>
                    
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Código de Acesso:</span>
                        <span className="font-mono font-bold text-orange-500">{room.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Alunos Matriculados:</span>
                        <span className="font-bold text-white">{students.length} alunos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Média de XP da Turma:</span>
                        <span className="font-bold text-purple-400">{avgXp} XP</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedClassroomId(room.id)}
                    className="mt-6 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20"
                  >
                    Selecionar Turma
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      
      {/* Sidebar Fixa */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6 z-40 sidebar-teacher">
        <div className="space-y-8">
          {/* Logo B2B */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-neon-green" />
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text mb-2 inline-block">
                AtivHub
              </div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Gestão Escolar B2B</p>
          </div>

          {/* Navegação */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab("rooms")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "rooms" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              <Gamepad2 size={18} className={activeTab === "rooms" ? "text-white" : "text-orange-500"} />
              <span>Suas Salas</span>
            </button>
            <button 
              onClick={() => setActiveTab("activities")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "activities" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              <Gamepad2 size={18} className={activeTab === "activities" ? "text-white" : "text-orange-500"} />
              <span>Atividades & Envio</span>
              {pendingSubmissions.length > 0 && (
                <span className="ml-auto bg-orange-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "reports" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              <Gamepad2 size={18} className={activeTab === "reports" ? "text-white" : "text-orange-500"} />
              <span>Relatórios</span>
            </button>
          </nav>

        </div>

        {/* Perfil & Logout */}
        <div className="border-t border-slate-850 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=1E293B`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-500 truncate">{user.disciplina || user.subject || "Professor"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-slate-800 text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-slate-750 hover:border-red-900/50 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen bg-slate-950">
        
        {/* Header */}
        <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-8 py-5 flex justify-between items-center z-30">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">Olá, Prof. {user.name.split(" ")[0]}</h1>
              {classrooms.length > 0 && (
                <select
                  value={selectedClassroomId || ""}
                  onChange={e => setSelectedClassroomId(e.target.value || null)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="">Todas as salas</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <School size={12} /> {user.escola || user.school || "Instituição Associada"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsRoomModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20"
            >
              <Plus size={16} />
              <span>Criar Nova Sala</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                <Users className="text-orange-500" size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Total de Alunos</span>
                <span className="text-2xl font-black text-white">{totalStudents}</span>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                <Award className="text-purple-400" size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Média de XP</span>
                <span className="text-2xl font-black text-white">{avgXP} XP</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                <ClipboardList className="text-orange-500" size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Atividades Criadas</span>
                <span className="text-2xl font-black text-white">{activities.length}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                <Clock className="text-purple-400" size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Pendentes de Avaliação</span>
                <span className="text-2xl font-black text-white">{pendingSubmissions.length}</span>
              </div>
            </div>
          </div>

          {/* Abas Content */}
          <AnimatePresence mode="wait">
            
            {/* TAB SALAS */}
            {activeTab === "rooms" && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-white">Salas de Aula Ativas</h2>
                    <p className="text-xs text-slate-500">Compartilhe o código da sala com seus alunos para que eles possam se matricular</p>
                  </div>
                </div>

                {classrooms.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center border-dashed">
                    <Users className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-white mb-2">Nenhuma sala criada</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                      Comece criando sua primeira sala para gerar códigos exclusivos de convite para os alunos.
                    </p>
                    <button 
                      onClick={() => setIsRoomModalOpen(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all"
                    >
                      Criar Primeira Sala
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {classrooms.map((room) => (
                      <div 
                        key={room.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase">
                              {room.subject}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-2">{room.name}</h3>
                          </div>
                          
                          {/* Botão de Excluir Sala */}
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
                            title="Excluir Sala"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Informações */}
                        <div className="space-y-3 border-t border-slate-800/80 pt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Código de Acesso:</span>
                            <span className="font-mono font-bold text-orange-500 select-all">{room.code}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Alunos Matriculados:</span>
                            <span className="font-bold text-white">{getFilteredStudentsForRoom(room.code).length} alunos</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Média de XP da Turma:</span>
                            <span className="font-bold text-purple-400">{getRoomAvgXp(room.code)} XP</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB ATIVIDADES & SUBMISSÕES */}
            {activeTab === "activities" && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {!selectedClassroomId ? (
                  renderClassroomSelector("Selecionar Turma para Atividades", "Escolha uma de suas salas abaixo para gerenciar as atividades e avaliar respostas correspondentes.")
                ) : (
                  <>
                    {renderSelectedRoomBanner()}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Gerenciamento de Atividades</h2>
                    <p className="text-xs text-slate-500">Crie novas missões de XP ou avalie as respostas recebidas dos alunos</p>
                  </div>
                  <button 
                    onClick={() => { setIsModalOpen(true); setEditingActId(null); setTitle(""); setDescription(""); setXpReward(10); }}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <PlusCircle size={16} className="text-orange-500" />
                    <span>Nova Atividade</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Coluna Esquerda: Listagem de Atividades */}
                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Suas Atividades Criadas</h3>
                    
                    {loadingData ? (
                      <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : activities.length === 0 ? (
                      <p className="text-slate-500 text-sm italic">Nenhuma atividade criada até o momento.</p>
                    ) : (
                      activities.map((act) => (
                        <div 
                          key={act.id}
                          className={`bg-slate-900 border rounded-2xl p-5 relative overflow-hidden transition-all duration-350 ${selectedActivityId === act.id ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]" : "border-slate-800/80 hover:border-slate-700"}`}
                        >
                          <div className="absolute top-0 right-0 bg-slate-800 text-orange-500 px-3 py-1 rounded-bl-xl font-bold text-xs border-l border-b border-slate-750">
                            +{act.xpReward} XP
                          </div>
                          
                          <div className="pr-16">
                            <h4 className="font-bold text-white text-base truncate">{act.title}</h4>
                            <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">{act.description}</p>
                          </div>

                          <div className="flex gap-3 mt-4 border-t border-slate-850 pt-3.5">
                            <button 
                              onClick={() => loadSubmissionsForActivity(act.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedActivityId === act.id ? "bg-orange-500 text-white" : "bg-slate-950 hover:bg-slate-800 text-slate-300"}`}
                            >
                              <Clock size={12} />
                              <span>Submissões</span>
                            </button>
                            <button 
                              onClick={() => { setIsModalOpen(true); openEditActModal(act); }}
                              className="bg-slate-950 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-400 transition-colors flex items-center gap-1.5"
                            >
                              <Edit2 size={12} />
                              <span>Editar</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteActivity(act.id)}
                              className="bg-slate-950 hover:bg-red-950/20 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 size={12} />
                              <span>Apagar</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Coluna Direita: Detalhamento de Submissões */}
                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {selectedActivityId ? "Submissões Recebidas" : "Fila de Avaliação"}
                    </h3>

                    {selectedActivityId && loadingSubmissions ? (
                      <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : selectedActivityId ? (
                       (() => {
                        const visibleSubmissions = selectedClassroom 
                          ? activitySubmissions.filter(sub => {
                              const studentEmail = sub.student?.email || sub.studentEmail || "";
                              const studentIndex = ranking.findIndex(r => (r.user?.email || r.email) === studentEmail);
                              if (studentIndex === -1) return true;
                              return getRoomForStudent(ranking[studentIndex], studentIndex, classrooms) === selectedClassroom.code;
                            })
                          : activitySubmissions;

                        if (visibleSubmissions.length === 0) {
                          return (
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
                              <CheckCircle className="mx-auto text-slate-600 mb-3" size={36} />
                              <p className="text-slate-400 text-sm">Nenhum aluno desta turma respondeu a esta atividade ainda.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {visibleSubmissions.map((sub) => {
                              const isPending = sub.grade === null || sub.grade === undefined || sub.status === 'PENDING';
                              return (
                                <div 
                                  key={sub.id}
                                  className={`bg-slate-900 border rounded-2xl p-5 space-y-3.5 ${isPending ? "border-orange-500/40" : "border-slate-800"}`}
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div>
                                      <h4 className="text-sm font-bold text-white">Aluno: <span className="text-orange-500 font-black">{sub.studentName || sub.student?.name || "Desconhecido"}</span></h4>
                                      <p className="text-[10px] text-slate-500">{new Date(sub.submittedAt || sub.createdAt || Date.now()).toLocaleDateString("pt-BR")}</p>
                                    </div>
                                    {isPending ? (
                                      <button 
                                        onClick={() => setEvaluatingSubId(sub.id)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all"
                                      >
                                        Avaliar
                                      </button>
                                    ) : (
                                      <span className="bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs px-3 py-1 rounded-lg">
                                        Nota: {sub.grade}
                                      </span>
                                    )}
                                  </div>
                                  <div className="bg-slate-950 p-4 rounded-xl text-slate-300 text-xs font-mono border border-slate-850 break-words leading-relaxed">
                                    {sub.answer || "Sem resposta em texto."}
                                  </div>
                                  {!isPending && sub.feedback && (
                                    <p className="text-xs italic text-purple-400 border-l-2 border-purple-500 pl-3">"{sub.feedback}"</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    ) : (
                      // Visão geral das pendentes de todas as atividades
                      pendingSubmissions.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center border-dashed">
                          <CheckCircle className="mx-auto text-slate-600 mb-3" size={36} />
                          <p className="text-slate-400 text-sm">Parabéns! Tudo avaliado por aqui. Clique em uma atividade para conferir o histórico completo.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pendingSubmissions.map((sub) => (
                            <div key={sub.id} className="bg-slate-900 border border-orange-500/20 rounded-2xl p-5 space-y-3.5">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="text-sm font-bold text-white">{sub.activityTitle || sub.activity?.title || "Missão sem título"}</h4>
                                  <p className="text-xs text-slate-400">Aluno: <span className="text-orange-500 font-medium">{sub.studentName || sub.student?.name || "Desconhecido"}</span></p>
                                </div>
                                <button 
                                  onClick={() => setEvaluatingSubId(sub.id)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all"
                                >
                                  Avaliar
                                </button>
                              </div>
                              <div className="bg-slate-950 p-4 rounded-xl text-slate-300 text-xs font-mono border border-slate-850 break-words">
                                {sub.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
                  </>
                )}
              </motion.div>
            )}

            {/* TAB RELATÓRIOS PEDAGÓGICOS */}
            {activeTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {!selectedClassroomId ? (
                  renderClassroomSelector("Selecionar Turma para Relatórios", "Escolha uma de suas salas abaixo para visualizar o relatório pedagógico e o ranking individual da turma.")
                ) : (
                  <>
                    {renderSelectedRoomBanner()}
                <div>
                  <h2 className="text-lg font-bold text-white">Relatórios e Desempenho de Alunos</h2>
                  <p className="text-xs text-slate-500">Métricas consolidadas de XP, ranking e cumprimento de metas pedagógicas</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  {/* Busca e filtros */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text"
                        value={reportSearch}
                        onChange={e => setReportSearch(e.target.value)}
                        placeholder="Buscar aluno por nome ou email..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-bold bg-slate-950 border border-slate-800/80 px-4 py-2 rounded-xl">
                      {filteredRanking.length} alunos listados
                    </span>
                  </div>

                  {loadingRanking ? (
                    <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : filteredRanking.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhum aluno encontrado.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                            <th className="py-4 px-4">Posição</th>
                            <th className="py-4 px-4">Aluno</th>
                            <th className="py-4 px-4">Experiência (XP)</th>
                            <th className="py-4 px-4">Missões Realizadas</th>
                            <th className="py-4 px-4 text-right">Taxa Conclusão</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRanking.map((item, i) => {
                            const rUser = item.user || item;
                            const subsCount = item.answeredActivitiesCount ?? item.submissionsCount ?? 0;
                            const itemXp = rUser.xp || 0;
                            const completionRate = activities.length > 0 ? Math.round((subsCount / activities.length) * 100) : 0;
                            
                            return (
                              <tr key={rUser.id || i} className="border-b border-slate-850 hover:bg-slate-950/40 transition-colors">
                                <td className="py-4 px-4 font-mono font-bold text-slate-500 text-base">
                                  #{i + 1}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rUser.email}&backgroundColor=1E293B`} alt="" />
                                    </div>
                                    <div>
                                      <span className="font-bold text-white block leading-tight">{rUser.name}</span>
                                      <span className="text-[10px] text-slate-500">{rUser.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 font-black text-orange-500">
                                  {itemXp} XP
                                </td>
                                <td className="py-4 px-4 text-slate-300 font-bold">
                                  {subsCount} concluídas
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${completionRate > 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : completionRate > 40 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {completionRate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modal Criar Sala */}
      <AnimatePresence>
        {isRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Criar Nova Sala</h2>
              <p className="text-slate-400 text-xs mb-6">Crie salas para cada turma. Um código exclusivo será gerado para matrículas.</p>
              
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nome da Sala / Turma</label>
                  <input 
                    type="text" 
                    required
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    placeholder="Ex: 9º Ano B"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Disciplina / Matéria</label>
                  <input 
                    type="text" 
                    required
                    value={newRoomSubject}
                    onChange={e => setNewRoomSubject(e.target.value)}
                    placeholder="Ex: Matemática"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsRoomModalOpen(false)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                  >
                    Criar Sala
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Criar/Editar Atividade */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setEditingActId(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-2">{editingActId ? "Editar Atividade" : "Nova Atividade"}</h2>
              <p className="text-slate-400 text-xs mb-6">Cadastre a atividade que será exibida para os alunos realizarem.</p>
              
              {createError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateOrEditActivity} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Título da Atividade</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isCreating}
                    placeholder="Ex: Desafio de Porcentagem"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Descrição / Instruções</label>
                  <textarea 
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isCreating}
                    placeholder="Descreva detalhadamente o desafio..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Recompensa (XP)</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={xpReward}
                    onChange={e => setXpReward(Number(e.target.value))}
                    disabled={isCreating}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-orange-500 font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isCreating}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                  >
                    {isCreating ? "Salvando..." : "Salvar Atividade"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Avaliar Submissão */}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Avaliar Resposta</h2>
              <p className="text-slate-400 text-xs mb-6">Atribua uma nota de 0 a 100 e forneça feedback ao estudante.</p>
              
              {evalError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs">
                  {evalError}
                </div>
              )}

              <form onSubmit={handleEvaluate} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nota (0 a 100)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    required
                    value={grade}
                    onChange={e => setGrade(Number(e.target.value))}
                    disabled={isEvaluating}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Feedback Pedagógico</label>
                  <textarea 
                    required
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    disabled={isEvaluating}
                    placeholder="Excelente trabalho! Parabéns pelo empenho..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-4 rounded-xl">
                  <input 
                    type="checkbox"
                    id="approved"
                    checked={approved}
                    onChange={e => setApproved(e.target.checked)}
                    disabled={isEvaluating}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 accent-orange-500 cursor-pointer"
                  />
                  <label htmlFor="approved" className="text-xs text-slate-200 font-bold cursor-pointer">
                    Aprovar e Liberar XP da Missão
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setEvaluatingSubId(null)}
                    disabled={isEvaluating}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isEvaluating}
                    className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm animate-pulse"
                  >
                    {isEvaluating ? "Gravando..." : "Confirmar Avaliação"}
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

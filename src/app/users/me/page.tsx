"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Shield, 
  Award, 
  ArrowLeft, 
  Gamepad2, 
  Settings, 
  Camera, 
  KeyRound, 
  Building, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Trash2
} from "lucide-react";
import { fetchApi, getAuthToken, removeAuthToken } from "@/lib/api";
import { GamifiedLoading } from "@/components/GamifiedLoading";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: string;
  xp?: number;
  schoolName?: string;
  subject?: string;
  photoUrl?: string;
  emailVerified?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // state do form
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // states da ui
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // states de deletar conta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmEmail.trim().toLowerCase() !== (user?.email || "").toLowerCase()) {
      setDeleteError("O e-mail digitado não corresponde ao seu e-mail cadastrado.");
      return;
    }
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      await fetchApi("/users/me", {
        method: "DELETE"
      });
      removeAuthToken();
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Erro ao deletar conta", err);
      setDeleteError(err.message || "Erro ao deletar conta. Tente novamente mais tarde.");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadData = async () => {
    try {
      const userData = await fetchApi("/users/me");
      setUser(userData);
      
      // inicia campos do form
      setName(userData.name || "");
      setPhotoUrl(userData.photoUrl || "");
      setSchoolName(userData.schoolName || "");
    } catch (err) {
      console.error("Erro ao carregar perfil", err);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <GamifiedLoading text="Carregando Perfil..." />
      </div>
    );
  }

  if (!user) return null;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(user.role === "PROFESSOR" ? "/dashboard/teacher" : "/dashboard");
    }
  };

  // lida c/ upload e compressao da img
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    // valida tamanho (max 5mb antes de comprimir)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("A imagem selecionada é muito grande. Escolha uma imagem menor que 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // cria canvas pra comprimir/redimensionar
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        // calcula tamanho mantendo aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // exporta canvas como jpeg c/ 75% qualidade base64
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          setPhotoUrl(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // validacao
    if (!name.trim()) {
      setErrorMsg("O nome não pode ficar em branco.");
      return;
    }

    if (password) {
      if (password.length < 6) {
        setErrorMsg("A nova senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("As senhas não coincidem.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        name,
        photoUrl: photoUrl.trim() || null,
        schoolName: schoolName.trim() || null,
      };

      if (password) {
        payload.password = password;
      }

      const updatedUser = await fetchApi("/users/me", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setUser(updatedUser);
      setSuccessMsg("Perfil atualizado com sucesso!");
      setPassword("");
      setConfirmPassword("");
      
      // fecha painel dps de um tempinho
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg("");
      }, 1500);

    } catch (err: any) {
      console.error("Erro ao atualizar perfil", err);
      setErrorMsg(err.message || "Erro ao atualizar perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-950">
      {/* decoracao do bg */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 to-slate-950 pointer-events-none" />
      <div className="absolute -top-[100px] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[100px] -left-[10%] w-[400px] h-[400px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

      {/* nav do topo */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleBack}>
          <Gamepad2 className="w-6 h-6 text-neon-green" />
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text">
            AtivHub
          </div>
        </div>
        <button onClick={handleBack} className="text-slate-300 hover:text-white transition-colors font-semibold flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10 pt-16">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            /* card de visualizacao */
            <motion.div
              key="view-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-8 rounded-3xl w-full border border-slate-800"
            >
              <div className="flex flex-col items-center mb-8 relative">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute right-0 top-0 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-purple-600 p-2.5 rounded-2xl transition-all border border-slate-700 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  title="Editar Configurações"
                >
                  <Settings size={20} />
                </button>

                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-purple-500 flex items-center justify-center glow-purple overflow-hidden mb-4 relative">
                  <img 
                    src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=1E293B`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-2xl font-black text-white">{user.name}</h1>
                <p className="text-neon-green font-bold text-sm tracking-widest uppercase">{user.role}</p>
              </div>

              <div className="space-y-4">
                {/* banner de alerta do email */}
                {!user.emailVerified && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-950/20 p-5 rounded-2xl border border-red-500/20 glow-red animate-pulse">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-bold text-white">E-mail Não Verificado</p>
                        <p className="text-xs text-slate-400 mt-0.5">Sua conta de Aluno está ativa, mas você precisa verificar seu e-mail para desbloquear todas as funções.</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await fetchApi("/auth/resend-verification", {
                            method: "POST",
                            requireAuth: false,
                            body: JSON.stringify({ email: user.email }),
                          });
                          router.push(`/auth/verify?email=${encodeURIComponent(user.email)}&sent=true`);
                        } catch (err: any) {
                          alert(err.message || "Erro ao solicitar código de verificação.");
                        }
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all text-xs uppercase text-center whitespace-nowrap glow-red"
                    >
                      Verificar E-mail
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <Mail className="text-slate-400 shrink-0" size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-white font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <Shield className="text-slate-400 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cargo</p>
                    <p className="text-white font-medium">{user.role === "ALUNO" ? "Aluno Mestre" : "Mestre Professor"}</p>
                  </div>
                </div>

                {user.role === "PROFESSOR" && user.subject && (
                  <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <BookOpen className="text-slate-400 shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Disciplina</p>
                      <p className="text-white font-medium">{user.subject}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <Building className="text-slate-400 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {user.role === "ALUNO" ? "Escola / Instituição de Estudo" : "Local de Trabalho / Instituição"}
                    </p>
                    <p className="text-white font-medium">
                      {user.schoolName || <span className="text-slate-500 italic">Não informada</span>}
                    </p>
                  </div>
                </div>

                {user.role === "ALUNO" && (
                  <div className="flex items-center gap-4 bg-purple-950/20 p-4 rounded-2xl border border-purple-500/20 glow-purple">
                    <Award className="text-neon-green shrink-0" size={24} />
                    <div>
                      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Nível & Progresso</p>
                      <p className="text-neon-green font-black">Nível {Math.floor((user.xp || 0) / 100) + 1} ({user.xp || 0} XP)</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* card de edicao */
            <motion.div
              key="edit-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-8 rounded-3xl w-full border border-purple-500/20 relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Settings className="text-purple-500 animate-spin-slow" size={24} /> Configurações de Perfil
                </h2>
                <button 
                  onClick={() => { setIsEditing(false); setErrorMsg(""); setSuccessMsg(""); }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-neon-green/10 border border-neon-green/40 rounded-xl text-neon-green text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {successMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* upload da foto e preview inst */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-purple-500 flex items-center justify-center overflow-hidden mb-2 relative group shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <img 
                      src={photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=1E293B`} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                    <label 
                      htmlFor="avatar-file-input"
                      className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase gap-1"
                    >
                      <Camera size={20} />
                      <span>Alterar Foto</span>
                    </label>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clique no círculo para alterar a foto</span>
                    {photoUrl && (
                      <button 
                        type="button"
                        onClick={() => setPhotoUrl("")}
                        disabled={isSubmitting}
                        className="text-red-400 hover:text-red-300 font-bold text-xs mt-1 transition-colors hover:underline"
                      >
                        Resetar para Avatar Padrão
                      </button>
                    )}
                  </div>
                  
                  {/* input de arquivo escondido */}
                  <input 
                    type="file"
                    id="avatar-file-input"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </div>

                {/* nome */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Seu nome"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* nome da escola */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {user.role === "ALUNO" ? "Escola ou Faculdade" : "Instituição / Local de Trabalho"}
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text"
                      value={schoolName}
                      onChange={e => setSchoolName(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Ex: Escola Estadual Machado de Assis"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 my-2">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-3">Alterar Senha de Segurança (Opcional)</span>
                  
                  {/* senha */}
                  <div className="space-y-3">
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Nova Senha (mín. 6 dígitos)"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* confirmar senha */}
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Confirmar Nova Senha"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* botoes do form */}
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { setIsEditing(false); setErrorMsg(""); setSuccessMsg(""); }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-black hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50 text-xs uppercase flex items-center justify-center gap-1.5"
                  >
                    <Save size={16} /> {isSubmitting ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>

              {/* zona de perigo */}
              <div className="border-t border-red-500/20 pt-6 mt-6">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <AlertCircle size={16} /> Zona de Perigo
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  A exclusão de sua conta é permanente e removerá todas as suas salas, atividades e progresso de XP.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setConfirmEmail("");
                    setDeleteError("");
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 font-bold hover:bg-red-900/30 hover:border-red-500 hover:text-white transition-all disabled:opacity-50 text-xs uppercase flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={16} /> Excluir Conta Permanentemente
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* modal de confirmar delete */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              {/* card do modal */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-slate-900 border border-red-500/30 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.15)] z-10"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 animate-pulse">
                    <Trash2 size={28} />
                  </div>
                  
                  <h3 className="text-xl font-black text-white mb-2">Excluir Conta Permanentemente</h3>
                  
                  <p className="text-sm text-slate-400 mb-6">
                    Esta ação <span className="text-red-400 font-bold">não pode ser desfeita</span>. Todos os seus dados, salas, atividades e XP acumulados serão removidos permanentemente.
                  </p>

                  <div className="w-full text-left space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Digite seu e-mail para confirmar: <span className="text-white italic select-all font-semibold font-mono">{user.email}</span>
                      </label>
                      <input 
                        type="email"
                        value={confirmEmail}
                        onChange={e => {
                          setConfirmEmail(e.target.value);
                          if (deleteError) setDeleteError("");
                        }}
                        placeholder="Digite seu e-mail"
                        disabled={isDeleting}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>

                    {deleteError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" /> {deleteError}
                      </div>
                    )}

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-850 text-slate-300 font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 text-xs uppercase"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50 text-xs uppercase flex items-center justify-center gap-1.5"
                      >
                        {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

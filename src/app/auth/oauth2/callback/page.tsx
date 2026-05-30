"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApi, setAuthToken, removeAuthToken } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, UserPlus, BookOpen, School, Key, Gamepad2 } from "lucide-react";
import { AuthBackground } from "@/components/AuthBackground";

function OAuth2CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STUDENT"); // "STUDENT" ou "PROFESSOR"
  
  // Fields for completion
  const [schoolName, setSchoolName] = useState("");
  const [subject, setSubject] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const tempTok = searchParams.get("tempToken");
    const mailParam = searchParams.get("email") || "";
    const nameParam = searchParams.get("name") || "";

    if (token) {
      // Usuário existente: login direto
      setAuthToken(token);
      fetchApi("/users/me")
        .then((user) => {
          if (user && user.role === "PROFESSOR") {
            router.push("/dashboard/teacher");
          } else {
            router.push("/dashboard");
          }
        })
        .catch((err) => {
          removeAuthToken();
          setError("Erro ao autenticar. Tente novamente.");
          setLoading(false);
        });
    } else if (tempTok) {
      // Novo usuário: precisa completar dados
      setTempToken(tempTok);
      setEmail(mailParam);
      setName(nameParam);
      
      const savedRole = sessionStorage.getItem("oauth_role") || "STUDENT";
      setRole(savedRole);
      setLoading(false);
    } else {
      setError("Parâmetros de autenticação inválidos.");
      setLoading(false);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload: any = {
        tempToken,
        name,
        email,
        role,
      };

      if (role === "PROFESSOR") {
        payload.schoolName = schoolName;
        payload.subject = subject;
      } else {
        payload.roomCode = roomCode;
      }

      const data = await fetchApi("/auth/oauth2/complete-registration", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify(payload),
      });

      if (data && data.token) {
        setAuthToken(data.token);
        if (role === "PROFESSOR") {
          router.push("/dashboard/teacher");
        } else {
          router.push("/dashboard");
        }
      } else {
        throw new Error("Token de login não recebido.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao completar registro.");
      setSubmitting(false);
    }
  };

  const isProfessor = role === "PROFESSOR";

  if (loading) {
    return (
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-neon-green mx-auto mb-4 glow-purple" />
        <h2 className="text-2xl font-bold text-white mb-2">Processando Autenticação...</h2>
        <p className="text-slate-400">Estamos conectando você ao AtivHub</p>
      </div>
    );
  }

  if (error && !tempToken) {
    return (
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center relative z-10">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Falha na Autenticação</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => router.push(isProfessor ? "/auth/professor/login" : "/auth/login")}
          className={`py-3 px-6 rounded-xl font-bold transition-all text-slate-900 ${
            isProfessor ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-neon-green hover:bg-purple-600 text-white"
          }`}
        >
          Voltar para o Login
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl border ${
        isProfessor 
          ? "bg-slate-900 border-orange-500/30" 
          : "glass-panel border-slate-700/50"
      }`}
    >
      <div className="text-center mb-8">
        <div className="flex flex-col items-center justify-center mb-2">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-neon-green" />
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text mb-2 inline-block">
              AtivHub
            </div>
          </div>
        </div>
        <div className="mt-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isProfessor 
              ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
              : "bg-neon-green/10 border-neon-green/30 text-neon-green"
          }`}>
            {isProfessor ? "Completar Registro - Professor" : "Completar Registro - Aluno"}
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-4">Falta pouco! Preencha as informações do seu perfil.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-bold mb-2">Nome Completo</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
              isProfessor 
                ? "bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                : "bg-slate-800/50 border border-slate-700 focus:border-neon-green focus:ring-1 focus:ring-neon-green"
            }`}
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-bold mb-2">E-mail</label>
          <input
            type="email"
            disabled
            value={email}
            className={`w-full rounded-xl px-4 py-3 text-slate-500 border border-slate-800/60 cursor-not-allowed ${
              isProfessor ? "bg-slate-950/50" : "bg-slate-900/50"
            }`}
          />
        </div>

        {isProfessor ? (
          <>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                Nome da Escola
              </label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Nome da sua instituição"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                Disciplina
              </label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Matemática, História"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Código da Sala (Opcional)
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Ex: AB12CD"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">Se você não tiver um código de sala agora, pode inseri-lo depois no painel.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
            isProfessor
              ? "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              : "bg-neon-green text-slate-900 hover:bg-purple-600 hover:text-white glow-purple"
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Finalizando...
            </>
          ) : (
            <>
              <UserPlus size={18} /> Concluir Cadastro
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      <AuthBackground />
      <Suspense fallback={
        <div className="text-center relative z-10">
          <Loader2 className="w-16 h-16 animate-spin text-neon-green mx-auto mb-4 glow-purple" />
          <h2 className="text-2xl font-bold text-white">Carregando...</h2>
        </div>
      }>
        <OAuth2CallbackContent />
      </Suspense>
    </main>
  );
}

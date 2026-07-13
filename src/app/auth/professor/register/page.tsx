"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchApi, setAuthToken } from "@/lib/api";
import Link from "next/link";
import { UserPlus, Eye, EyeOff, Briefcase, School, BookOpen, Gamepad2 } from "lucide-react";
import { AuthBackground } from "@/components/AuthBackground";

export default function ProfessorRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // manda campos em en e pt pra nao quebrar no back
      const data = await fetchApi("/auth/register", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: "PROFESSOR",
          school,
          subject,
          escola: school,
          disciplina: subject
        }),
      });

      if (data && data.token) {
        setAuthToken(data.token);
      }

      // se registrou vai pro verify do email
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta de professor. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center pt-24 pb-12 px-4 overflow-y-auto bg-slate-950">
      {/* bg sobrio pro mestre */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      {/* botao voltar */}
      <button 
        onClick={() => router.push("/professor")}
        className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-semibold z-50 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800/80 backdrop-blur-md hover:bg-slate-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Voltar
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl"
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
          <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold px-3 py-1 rounded-full">
            Cadastro de Professor
          </span>
          <p className="text-slate-400 text-sm mt-3">Crie sua conta para gerenciar turmas e criar missões</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email Profissional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all pr-12 text-sm"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <School size={14} className="text-purple-400" /> Escola / Instituição
              </label>
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                placeholder="Nome da escola"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={14} className="text-purple-400" /> Disciplina
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
                placeholder="Ex: Matemática"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            {loading ? "Criando Conta..." : <><UserPlus size={18} /> Registrar como Professor</>}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Já tem uma conta de professor?{" "}
          <Link href="/auth/professor/login" className="text-orange-400 hover:text-orange-300 transition-colors font-bold">
            Acesse o Painel
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

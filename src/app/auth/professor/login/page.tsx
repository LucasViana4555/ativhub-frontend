"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchApi, setAuthToken, removeAuthToken } from "@/lib/api";
import Link from "next/link";
import { LogIn, Eye, EyeOff, Key, Gamepad2 } from "lucide-react";

export default function ProfessorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oauth_role", "PROFESSOR");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ativhub.chilecentral.cloudapp.azure.com";
      window.location.href = `${apiUrl}/oauth2/authorization/google`;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ email, password }),
      });

      if (data && data.token) {
        setAuthToken(data.token);
        
        // valida se o user e professor msm
        try {
          const user = await fetchApi("/users/me");
          if (user.role === "PROFESSOR") {
            router.push("/dashboard/teacher");
          } else {
            // se for aluno desconecta e avisa
            removeAuthToken();
            setError("Esta conta está registrada como Aluno. Por favor, acesse o portal de alunos.");
          }
        } catch (userErr) {
          removeAuthToken();
          router.push("/");
        }
      } else {
        throw new Error("Token não retornado pela API");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center pt-24 pb-12 px-4 overflow-y-auto bg-slate-950">
      {/* bg decorativo */}
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
        className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl"
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
          <span className="text-xs bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold px-3 py-1 rounded-full">
            Painel do Professor
          </span>
          <p className="text-slate-400 text-sm mt-3">Acesse para gerenciar suas turmas e relatórios</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
              placeholder="seu@email.com"
            />
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
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            {loading ? "Entrando..." : <><LogIn size={18} /> Entrar no Painel</>}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Ou continue com</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold transition-all border border-slate-800 flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Entrar como Professor com Google
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Ainda não tem conta de professor?{" "}
          <Link href="/auth/professor/register" className="text-orange-400 hover:text-orange-300 transition-colors font-bold">
            Registre-se aqui
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchApi, setAuthToken } from "@/lib/api";
import Link from "next/link";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { AuthBackground } from "@/components/AuthBackground";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        
        // Fetch user data to redirect based on role
        try {
          const user = await fetchApi("/users/me");
          router.push("/dashboard");
        } catch (userErr) {
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
    <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Animado */}
      <AuthBackground />

      {/* Back Button */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-semibold z-50 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-md hover:bg-slate-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Voltar
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text mb-2 inline-block">
            AtivHub
          </div>
          <p className="text-slate-400">Entre para continuar sua jornada</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-neon-green text-slate-900 rounded-xl font-bold hover:bg-purple-600 transition-all glow-purple flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : <><LogIn size={20} /> Entrar</>}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Ainda não tem conta?{" "}
          <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 transition-colors font-bold">
            Registre-se
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

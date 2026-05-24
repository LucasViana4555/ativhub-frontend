"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { AuthBackground } from "@/components/AuthBackground";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ALUNO");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await fetchApi("/auth/register", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ name, email, password, role }),
      });

      // Se registrou com sucesso, direciona para o login
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Verifique os dados fornecidos.");
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
          <p className="text-slate-400">Junte-se à plataforma AtivHub</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-12"
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
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Cargo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            >
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-neon-green text-slate-900 rounded-xl font-bold hover:bg-purple-600 transition-all glow-purple flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : <><UserPlus size={20} /> Registrar</>}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="text-neon-green hover:text-green-400 transition-colors font-bold">
            Faça login
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

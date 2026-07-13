"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ShieldCheck, ArrowRight, RefreshCw, Gamepad2, Mail } from "lucide-react";
import { AuthBackground } from "@/components/AuthBackground";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const sentParam = searchParams.get("sent") === "true";

  const [email, setEmail] = useState(emailParam);
  const [emailSent, setEmailSent] = useState(sentParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendEmail = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await fetchApi("/auth/resend-verification", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ email }),
      });

      setEmailSent(true);
      setCountdown(60); // 1 min de countdown
      setSuccess("Um código de verificação foi enviado para o seu e-mail!");
    } catch (err: any) {
      setError(err.message || "Erro ao enviar código de verificação. Verifique o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (code.length !== 6) {
      setError("O código deve ter exatamente 6 dígitos.");
      setLoading(false);
      return;
    }

    try {
      await fetchApi("/auth/verify-email", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ email, code }),
      });

      setSuccess("E-mail verificado com sucesso! Redirecionando para o painel...");

      // busca o profile do user pra ir pro dashboard certo
      try {
        const userData = await fetchApi("/users/me", { requireAuth: true });
        setTimeout(() => {
          if (userData && userData.role === "PROFESSOR") {
            router.push("/dashboard/teacher");
          } else {
            router.push("/dashboard");
          }
        }, 2000);
      } catch (profileErr) {
        setTimeout(() => {
          router.push("/users/me");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Código inválido ou expirado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setSuccess("");
    setResending(true);

    try {
      await fetchApi("/auth/resend-verification", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ email }),
      });

      setSuccess("Um novo código foi enviado para o seu e-mail.");
      setCountdown(60); // 1 min de countdown
    } catch (err: any) {
      setError(err.message || "Erro ao reenviar código. Verifique o e-mail informado.");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 sm:p-8 rounded-3xl w-full max-w-md relative z-10 border border-slate-800"
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
        <h2 className="text-xl font-bold text-white mb-2">
          {emailSent ? "Confirmar Código" : "Confirmar E-mail"}
        </h2>
        <p className="text-slate-400 text-sm">
          {emailSent 
            ? "Insira o código de 6 dígitos enviado para o seu e-mail para ativar sua conta no AtivHub."
            : "Para garantir a segurança da sua conta, confirme o seu endereço de e-mail."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 text-sm text-center font-medium">
          {success}
        </div>
      )}

      {!emailSent ? (
        /* passo 1: receber email ou dps */
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Confirmar E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center font-medium"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/users/me")}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl font-bold transition-all text-sm uppercase text-center border border-slate-700/50"
            >
              Agora não
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={loading || !email}
              className="flex-1 py-3 px-4 bg-neon-green text-slate-900 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all glow-purple flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase"
            >
              {loading ? "Enviando..." : <><Mail size={20} /> Receber E-mail</>}
            </button>
          </div>
        </div>
      ) : (
        /* passo 2: digitar codigo ou dps */
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">E-mail de Cadastro</label>
            <div className="w-full bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3 text-slate-400 text-center text-sm font-medium">
              {email}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Código de 6 dígitos</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 6) setCode(val);
              }}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center text-2xl tracking-widest font-mono font-bold"
              placeholder="000000"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/users/me")}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl font-bold transition-all text-sm uppercase text-center border border-slate-700/50"
            >
              Agora não
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1 py-3 px-4 bg-neon-green text-slate-900 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all glow-purple flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase"
            >
              {loading ? "Verificando..." : <><ShieldCheck size={20} /> Ativar</>}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-center">
        {emailSent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="text-neon-green hover:text-green-400 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-bold flex items-center gap-1 justify-center"
          >
            <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
            {countdown > 0 ? `Reenviar código em ${countdown}s` : "Reenviar código de verificação"}
          </button>
        )}

        {emailSent && (
          <button
            type="button"
            onClick={() => {
              setEmailSent(false);
              setSuccess("");
              setError("");
              setCode("");
            }}
            className="text-purple-400 hover:text-purple-300 font-bold transition-colors mt-1"
          >
            Alterar e-mail / Reenviar para outro endereço
          </button>
        )}

        <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors font-bold flex items-center gap-1 justify-center mt-2">
          Voltar para o Login <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center pt-24 pb-12 px-4 overflow-y-auto bg-slate-950">
      <AuthBackground />
      <Suspense fallback={
        <div className="glass-panel p-8 rounded-3xl w-full max-w-md relative z-10 text-center text-white">
          Carregando...
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </main>
  );
}

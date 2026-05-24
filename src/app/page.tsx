"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Link from "next/link";
import {
  Gamepad2,
  Trophy,
  Target,
  Rocket,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
  GraduationCap
} from "lucide-react";

const loadingPhrases = [
  "Carregando missões épicas...",
  "Calculando seu XP...",
  "Afiando espadas virtuais...",
  "Conectando ao servidor global...",
  "Preparando sua jornada..."
];

function LoadingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % loadingPhrases.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0C10] gap-8">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-neon-green"
      >
        <Gamepad2 size={64} />
      </motion.div>

      <div className="w-64 flex flex-col items-center gap-4">
        {/* Loading Bar Container */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-green to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        </div>

        {/* Loading com frase */}
        <motion.div
          key={phraseIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-gray-400 text-sm font-medium h-5 text-center"
        >
          {loadingPhrases[phraseIndex]}
        </motion.div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Parallax scroll 
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    // redirecionamento inteligente
    const token = typeof window !== "undefined" ? localStorage.getItem("ativihub_token") : null;


    const MIN_LOADING_TIME = 4000;
    const startTime = Date.now();

    const handleCompletion = (callback: () => void) => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
      setTimeout(callback, remainingTime);
    };

    if (token) {
      import("@/lib/api").then(({ fetchApi }) => {
        fetchApi("/users/me")
          .then((user) => {
            handleCompletion(() => router.push("/dashboard"));
          })
          .catch(() => {
            localStorage.removeItem("ativihub_token");
            handleCompletion(() => setIsCheckingAuth(false));
          });
      });
    } else {
      handleCompletion(() => setIsCheckingAuth(false));
    }
  }, [router]);

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  // variação de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { y: 40, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  const floatingVariants: Variants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white selection:bg-neon-green selection:text-black overflow-x-hidden font-sans">

      {/* efeitos do background */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/30 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
        className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-neon-green/20 blur-[120px] pointer-events-none"
      />

      {/* elemento animados do background */}
      <motion.div style={{ y: y1 }} className="absolute top-[20%] left-[5%] opacity-30 hidden lg:block" variants={floatingVariants} animate="animate">
        <Star size={48} className="text-yellow-400" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute top-[40%] right-[10%] opacity-30 hidden lg:block" variants={floatingVariants} animate="animate">
        <Zap size={56} className="text-neon-green" />
      </motion.div>
      <motion.div style={{ y: y1 }} className="absolute top-[70%] left-[15%] opacity-20 hidden lg:block" variants={floatingVariants} animate="animate">
        <Sparkles size={64} className="text-purple-400" />
      </motion.div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
        className="relative z-50 container mx-auto px-6 py-6 flex items-center justify-between"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          {/* logo */}
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text">
            AtivHub
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/auth/login">
            <button className="px-6 py-2.5 rounded-full font-bold text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex items-center gap-2 group shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Entrar como aluno
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </motion.header>

      {/* seção principal */}
      <main className="relative z-10 container mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          whileHover={{ y: -5, scale: 1.05 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-sm mb-10 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        >
          <Rocket size={18} className="animate-bounce" style={{ animationDuration: '2s' }} />
          <span>A nova forma de aprender</span>
        </motion.div>

        <motion.div style={{ opacity }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight max-w-5xl tracking-tight"
          >
            Aprenda <motion.span
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200%" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-yellow-400 to-neon-green"
            >Jogando</motion.span> e Cumpra <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Missões</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-gray-400 text-lg md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transforme sua rotina de estudos em uma aventura épica. Ganhe XP, suba de nível e compita no ranking global enquanto domina novos conhecimentos.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-neon-green to-purple-500 text-white hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto relative overflow-hidden group"
            >
              {/* efeito shine */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
              Dar o Play <Gamepad2 size={28} className="group-hover:rotate-12 transition-transform" />
            </motion.button>
          </Link>
          <Link href="/auth/login">
            <motion.button
              whileHover={{ scale: 1.05, y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-2xl font-bold text-xl bg-white/5 border border-white/10 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-3 group"
            >
              <GraduationCap size={24} className="text-purple-400 group-hover:-translate-y-1 group-hover:rotate-12 transition-transform duration-300" />
              Sou professor
            </motion.button>
          </Link>
        </motion.div>
      </main>

      {/* seção que mostra as features */}
      <section className="relative z-10 container mx-auto px-6 py-32 bg-black/40 border-t border-white/5 rounded-t-[3rem]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Como funciona o <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500">AtivHub</span>?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xl">Um sistema completo de gamificação focado em aumentar seu engajamento e retenção de aprendizado.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -15, scale: 1.02 }}
            className="bg-gradient-to-b from-[#161822] to-[#0d0e14] p-10 rounded-3xl border border-white/5 hover:border-purple-500/50 hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-all" />
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30"
            >
              <Target size={36} className="text-purple-400" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-white">Missões Educacionais</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Receba desafios diários e semanais criados pelos seus professores. Conclua tarefas para desbloquear o próximo nível.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -15, scale: 1.02 }}
            className="bg-gradient-to-b from-[#161822] to-[#0d0e14] p-10 rounded-3xl border border-white/5 hover:border-purple-500/50 hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-all" />
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-neon-green/20 rounded-2xl flex items-center justify-center mb-8 border border-neon-green/30"
            >
              <Star size={36} className="text-neon-green" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-white">Recompensas em XP</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Cada atividade concluída gera pontos de experiência (XP). Acumule pontos para subir de rank e ganhar badges.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -15, scale: 1.02 }}
            className="bg-gradient-to-b from-[#161822] to-[#0d0e14] p-10 rounded-3xl border border-white/5 hover:border-blue-500/50 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] group-hover:bg-blue-500/20 transition-all" />
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30"
            >
              <Trophy size={36} className="text-blue-400" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-white">Ranking Global</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Acompanhe seu progresso em relação aos seus colegas. Um sistema saudável que incentiva a constância nos estudos.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* banner de ação */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-20 mb-20"
      >
        <div className="bg-gradient-to-r from-purple-900/50 to-neon-green/10 rounded-[3rem] p-12 md:p-20 text-center border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">Pronto para começar a sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500">Jornada</span>?</h2>
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-2xl font-black text-xl bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] relative z-10"
            >
              Criar Conta Gratuita
            </motion.button>
          </Link>
        </div>
      </motion.section>



      {/* pro efeito shine funcionar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}

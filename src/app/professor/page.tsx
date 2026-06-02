"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Lock, 
  School, 
  Sparkles,
  ChevronRight,
  Gamepad2
} from "lucide-react";
import { getAuthToken } from "@/lib/api";

export default function TeacherLandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Se já estiver logado, redireciona temporariamente
      import("@/lib/api").then(({ fetchApi }) => {
        fetchApi("/users/me")
          .then((user) => {
            if (user.role === "PROFESSOR") {
              router.push("/dashboard/teacher");
            } else {
              router.push("/dashboard");
            }
          })
          .catch(() => {
            localStorage.removeItem("ativihub_token");
            setLoading(false);
          });
      });
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Carregando portal corporativo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Header */}
      <header className="relative z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-neon-green" />
              <div className="text-xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text mb-1 sm:mb-2 inline-block">
                AtivHub
              </div>
            </div>
            <span className="text-[10px] sm:text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full border border-slate-700">
              Professores
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/auth/professor/login" className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">
              Entrar no Painel
            </Link>
            <Link href="/auth/professor/register" className="hidden sm:block">
              <button className="bg-gradient-to-r from-purple-600 to-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center gap-2 group whitespace-nowrap">
                Criar Conta Gratuita
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs">
            <Sparkles size={14} />
            <span>SaaS B2B para Escolas e Redes</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Engaje seus alunos com <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">Gamificação</span> de Alta Performance.
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Conecte suas metodologias ativas a um gerenciamento pedagógico inteligente. Crie missões, atribua recompensas de XP, gerencie salas de aula e extraia relatórios detalhados com total simplicidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link href="/auth/professor/register">
              <button className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white font-bold text-lg rounded-2xl hover:bg-orange-600 transition-all shadow-[0_4px_20px_rgba(249,115,22,0.25)] flex items-center justify-center gap-3 group">
                Começar como Professor
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/auth/professor/login">
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-slate-200 font-bold text-lg rounded-2xl hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
                Acessar Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-orange-500/10 rounded-3xl blur-2xl" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md"
          >
            {/* Mockup Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <span className="text-orange-500 font-bold text-sm">PR</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Prof. Roberto Silva</h4>
                  <p className="text-xs text-slate-500">Matemática • Colégio Dante</p>
                </div>
              </div>
              <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold px-2 py-0.5 rounded-full">
                Painel do Mestre
              </span>
            </div>

            {/* Mockup Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Total de Alunos</span>
                <span className="text-2xl font-black text-white">42</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Média de XP</span>
                <span className="text-2xl font-black text-orange-500">280 XP</span>
              </div>
            </div>

            {/* Mockup List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Últimas Missões Criadas</div>
              <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Álgebra Linear Basica</span>
                  <span className="text-[10px] text-slate-500">Criado há 2 dias • 12 envios</span>
                </div>
                <span className="text-xs font-black text-purple-400">+50 XP</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Desafio de Logaritmos</span>
                  <span className="text-[10px] text-slate-500">Criado há 5 dias • 38 envios</span>
                </div>
                <span className="text-xs font-black text-purple-400">+100 XP</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 border-t border-slate-900 bg-slate-900/20 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Recursos construídos para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">sucesso pedagógico</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Deixe de lado planilhas complexas. AtivHub automatiza e gamifica todo o engajamento dos seus alunos em uma interface limpa e corporativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gestão de Salas Simplificada</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Crie salas para cada turma escolar com facilidade. Gere códigos de acesso exclusivos para os alunos se conectarem instantaneamente aos seus desafios.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="text-orange-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Controle e Criação de Missões</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Crie atividades e tarefas gamificadas que rendem XP aos alunos. Defina recompensas personalizadas e dê feedbacks detalhados sobre as respostas.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Relatórios de Desempenho</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Monitore o XP acumulado de cada aluno, taxas de conclusão de atividades, ranking geral da sala e exporte dados para avaliações escolares integradas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Planos sob medida para o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">crescimento</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Expanda a gamificação para toda a sua escola ou rede municipal de ensino conforme a sua necessidade.
          </p>

          {/* Plano Free inicial Callout */}
          <div className="mt-8 max-w-2xl mx-auto bg-slate-900/60 border border-orange-500/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-orange-500/20">
                Experimente Sem Custo
              </span>
              <h4 className="text-base font-bold text-white mt-2">Todo professor começa no Plano Free (R$ 0)</h4>
              <p className="text-xs text-slate-400 mt-1">Crie até 1 sala de aula e cadastre até 15 alunos de forma 100% gratuita.</p>
            </div>
            <Link href="/auth/professor/register" className="shrink-0 w-full sm:w-auto">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/10">
                Iniciar Teste Grátis
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Teacher Hero (Individual) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Individual
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 mb-2">Professor Hero</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Ideal para professores autônomos que desejam engajar suas turmas com salas ilimitadas.
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-white">R$ 19,90</span>
                <span className="text-slate-500 text-sm">/ por mês</span>
              </div>

              <div className="space-y-4 border-t border-slate-800/80 pt-6 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span className="font-semibold text-white">Salas de aula ilimitadas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Alunos ilimitados no seu painel</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Criação de Missões de XP ilimitadas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Feedback pedagógico para alunos</span>
                </div>
              </div>
            </div>

            <Link href="/auth/professor/register" className="w-full">
              <button className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm">
                Assinar Professor Hero
              </button>
            </Link>
          </div>

          {/* Plano Escola (Premium) */}
          <div className="bg-slate-900 border-2 border-purple-500 rounded-3xl p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(139,92,246,0.15)] relative transform lg:-translate-y-2">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
              Mais Vendido
            </div>
            
            <div>
              <span className="text-xs bg-purple-500/10 text-purple-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-500/20">
                Institucional
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 mb-2">Escola Ativa</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Para escolas de ensino fundamental ou médio que buscam unificar a gamificação educacional.
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-white">R$ 299,00</span>
                <span className="text-slate-500 text-sm">/ por mês</span>
              </div>

              <div className="space-y-4 border-t border-purple-500/20 pt-6 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span className="font-semibold text-white">Salas de aula ilimitadas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Até 1.500 alunos cadastrados</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Painel Administrativo para Diretores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Relatórios Pedagógicos Consolidados</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Suporte prioritário via WhatsApp/Email</span>
                </div>
              </div>
            </div>

            <Link href="/auth/professor/register" className="w-full">
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all text-sm">
                Assinar Escola Ativa
              </button>
            </Link>
          </div>

          {/* Plano Rede (Enterprise) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Grandes Contas
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 mb-2">Rede de Ensino</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Para redes municipais, estaduais de ensino ou grandes redes de escolas privadas.
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-2xl font-black text-white">A partir de R$ 990,00</span>
                <span className="text-slate-500 text-xs block">/ por mês</span>
              </div>

              <div className="space-y-4 border-t border-slate-800/80 pt-6 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span className="font-semibold text-white">Múltiplas Escolas Integradas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Alunos e Professores ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-350">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Integração via API com Sistemas de Notas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>Treinamentos ao vivo para corpo docente</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-orange-500 shrink-0" />
                  <span>SLA de Suporte de 4h e Gerente dedicado</span>
                </div>
              </div>
            </div>

            <a href="mailto:suporte@ativhub.com.br?subject=Interesse%20no%20Plano%20Rede" className="w-full">
              <button className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm">
                Falar com Consultor
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 mb-20">
        <div className="bg-gradient-to-r from-slate-900 to-purple-950/60 rounded-[3rem] p-12 md:p-20 text-center border border-slate-800/60 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white max-w-3xl mx-auto leading-tight">
            Pronto para transformar o engajamento da sua turma?
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
            Junte-se a centenas de professores que utilizam metodologias de jogo para inspirar seus alunos todos os dias.
          </p>
          <Link href="/auth/professor/register">
            <button className="px-10 py-5 rounded-2xl font-black text-lg bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all">
              Criar Minha Conta de Professor
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}

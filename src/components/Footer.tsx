"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Globe,
  Mail,
  MessageCircle,
  Sparkles,
  Target,
  Zap
} from "lucide-react";

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-10 border-t border-white/10 bg-black/80 pt-16 pb-8 backdrop-blur-lg overflow-hidden mt-auto"
    >
      {/* Animated grid background just for footer */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-purple-500 glow-text mb-4 cursor-default"
            >
              AtivHub
            </motion.div>
            <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
              Gamificando o ensino e transformando a jornada de aprendizado em uma experiência épica e inesquecível.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageCircle, Mail].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, y: -5, color: '#a855f7' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 hover:border-purple-500/50 transition-colors"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-neon-green" /> Plataforma
            </h4>
            <ul className="space-y-3">
              {['Sobre nós', 'Como funciona'].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <Link href="#" className="text-gray-400 hover:text-neon-green transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <Target size={16} className="text-purple-400" /> Legal
            </h4>
            <ul className="space-y-3">
              {['Termos de Uso', 'Privacidade'].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green/50" />
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
            © {new Date().getFullYear()} AtivHub. Todos os direitos reservados.
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 cursor-pointer hover:border-neon-green/30 hover:text-neon-green transition-all"
          >
            <Zap size={14} className="text-yellow-400" /> Status: Todos os sistemas operacionais
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}

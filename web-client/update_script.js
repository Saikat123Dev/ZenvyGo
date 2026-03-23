import fs from "node:fs";
const content = `"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Zap, Layout, Activity, Code, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">AssistPro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">Log in</button>
            <button className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">Get Started</button>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur-[100px] mix-blend-screen" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300">AssistPro V2 is now live</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto mb-6 leading-[1.1]">
            Next-generation platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">modern teams.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Build, scale, and ship faster with our powerful suite of tools designed for the modern web.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform duration-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
              Start Building <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="relative pb-32 px-6">
        <motion.div style={{ opacity, scale }} className="max-w-5xl mx-auto rounded-xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="rounded-lg bg-[#0A0A0B] border border-white/5 overflow-hidden">
            <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
            </div>
            <div className="p-8 flex flex-col md:flex-row items-start gap-8 min-h-[400px]">
              <div className="flex-1 space-y-6 w-full">
                <div className="h-8 w-48 bg-white/5 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (<div key={i} className="h-24 bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-xl" />))}
                </div>
                <div className="h-64 w-full bg-gradient-to-t from-cyan-500/10 to-transparent border border-white/5 rounded-xl" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      
      <section id="features" className="py-24 bg-[#0A0A0B] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed." },
              { icon: Shield, title: "Secure", desc: "Bank-grade encryption." },
              { icon: Layout, title: "Beautiful UI", desc: "Engineered with precision." }
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-cyan-400 mb-4"><f.icon className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`;
fs.writeFileSync("web-client/app/page.tsx", content);

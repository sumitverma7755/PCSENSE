import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import mockupImg from '../assets/dashboard-mockup.png';

export default function Hero() {
  const MotionDiv = motion.div;

  return (
    <section className="max-w-7xl mx-auto px-8 mb-32 pt-32">
      <div className="grid lg:grid-cols-12 gap-16 items-center">
        <MotionDiv 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 space-y-8"
        >
          <span className="inline-block text-primary font-label text-[0.6875rem] font-bold tracking-[0.1em] uppercase bg-primary/10 px-3 py-1 rounded-full">The New Standard of Curation</span>
          <h1 className="text-7xl font-headline font-extrabold tracking-tight text-white leading-[1.05]">
            Command the <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">infinite flow.</span>
          </h1>
          <p className="text-2xl text-slate-300 leading-relaxed max-w-xl">
            Stop drowning in data. Start architecting wisdom. CuratorAI is the premier editorial engine for the world's most demanding thinkers.
          </p>
          <div className="flex flex-wrap gap-5 pt-4">
            <button className="bg-emerald-600 text-white px-10 py-5 rounded-full font-headline font-bold text-lg hover:scale-[1.05] transition-transform duration-300 shadow-xl shadow-emerald-900/40">Start Your Ascent</button>
            <button className="bg-slate-800 text-emerald-400 px-10 py-5 rounded-full font-headline font-bold text-lg hover:bg-slate-700 transition-colors flex items-center gap-2 border border-emerald-500/20">
              <PlayCircle className="w-5 h-5" /> Watch the Vision
            </button>
          </div>
        </MotionDiv>
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-6 relative"
        >
          <div className="relative z-10 rounded-2xl overflow-hidden ghost-border editorial-shadow bg-slate-900">
            <img alt="Dashboard Mockup" className="w-full aspect-[4/3] object-cover opacity-90" src={mockupImg} />
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-700/10 rounded-full blur-3xl -z-10"></div>
        </MotionDiv>
      </div>
    </section>
  );
}

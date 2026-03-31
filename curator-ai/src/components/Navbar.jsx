import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-emerald-950/70 backdrop-blur-xl border-b border-emerald-500/10 shadow-2xl shadow-emerald-950/20 py-4' : 'bg-transparent py-6'}`}>
      <div className="flex justify-between items-center px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <a className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-emerald-600 font-headline tracking-tighter" href="#">CuratorAI</a>
          <div className="hidden md:flex items-center gap-8">
            <a className="font-manrope tracking-tight font-semibold text-emerald-100/60 hover:text-emerald-400 transition-colors" href="#features">Features</a>
            <a className="font-manrope tracking-tight font-semibold text-emerald-100/60 hover:text-emerald-400 transition-colors" href="#methodology">Methodology</a>
            <a className="font-manrope tracking-tight font-semibold text-emerald-100/60 hover:text-emerald-400 transition-colors" href="#pricing">Pricing</a>
            <a className="font-manrope tracking-tight font-semibold text-emerald-100/60 hover:text-emerald-400 transition-colors" href="#faq">FAQ</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="hidden sm:block text-emerald-400 font-manrope font-semibold hover:opacity-90 transition-all duration-300">Sign In</button>
          <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-manrope font-semibold hover:opacity-90 transition-all duration-300 active:scale-95">Get Started</button>
        </div>
      </div>
    </nav>
  );
}

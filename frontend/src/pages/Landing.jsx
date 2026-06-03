import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Shield, Zap, Sparkles, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary selection:text-white font-sans overflow-x-hidden">
      
      {/* Premium Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black shadow-premium neon-glow-primary">
            H
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            HabitFlow
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold hover:text-primary transition"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-xl text-sm font-bold shadow-premium neon-glow-primary transition duration-200"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-primary mb-6">
            <Sparkles size={12} />
            <span>Introducing HabitFlow 1.0</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Master Your Habits,<br />
            <span className="bg-gradient-to-r from-primary via-secondary to-success bg-clip-text text-transparent">
              Elevate Your Life
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            HabitFlow combines beautiful design, dynamic consistency charts, streaks, planners, and achievements to unlock your absolute productivity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary px-8 py-4 rounded-2xl font-bold text-base shadow-premium neon-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 px-8 py-4 rounded-2xl font-bold text-base hover:border-slate-700 transition"
            >
              Explore Features
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-4">Features Designed for Consistency</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Everything you need to automate your routine and achieve your long-term goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-900 hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <CheckSquare size={24} />
            </div>
            <h3 className="text-lg font-bold mb-3">Today Checklists</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Beautiful cards representing your daily habits. Tap once to complete. Track glasses of water, read pages, and minutes of meditation.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-900 hover:border-secondary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold mb-3">Premium Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Get insights with responsive Weekly Progress bars, custom contribution Heatmaps (GitHub style), and historical consistency charts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-900 hover:border-success/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success mb-6">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold mb-3">Gamified Milestones</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Earn and unlock unique badges like "Productivity Master" or "7-Day Warrior" to keep your motivation high.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-4">Sleek Pricing for Everyone</h2>
          <p className="text-slate-400 text-sm">Start tracking today. Upgrade anytime to unlock advanced analytics.</p>
        </div>

        <div className="max-w-md mx-auto rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 shadow-premium text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] uppercase font-black px-4 py-1 rounded-bl-xl">
            Popular
          </div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4">Pro Access</span>
          <div className="flex items-center justify-center gap-1 mb-6">
            <span className="text-5xl font-black">$7</span>
            <span className="text-slate-400 text-sm font-semibold">/ month</span>
          </div>
          <ul className="space-y-3 text-left mb-8 text-sm">
            <li className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              <span>Unlimited Habit tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              <span>Interactive GitHub-style heatmap</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              <span>Dynamic calendar schedule planner</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              <span>Badge rewards & browser alerts</span>
            </li>
          </ul>
          <button 
            onClick={() => navigate('/register')}
            className="w-full bg-primary hover:bg-primary-dark py-3.5 rounded-2xl font-bold shadow-premium neon-glow-primary transition"
          >
            Start 7-Day Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-xs">
            H
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-400">
            HabitFlow
          </span>
        </div>
        <p>© 2026 HabitFlow SaaS. Built with React and Spring Boot. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;

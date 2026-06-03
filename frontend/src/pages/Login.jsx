import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Sparkles, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sessionExpired = window.location.search.includes('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/today');
    } catch (err) {
      setError(err || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-900 backdrop-blur-premium shadow-premium relative"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-2xl shadow-premium neon-glow-primary mb-4">
            H
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">Continue your self-improvement track</p>
        </div>

        {/* Session Expired */}
        {sessionExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-start gap-2.5 text-xs">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-2.5 text-xs">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition shadow-premium neon-glow-primary disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] duration-150"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <span>New to HabitFlow? </span>
          <button 
            onClick={() => navigate('/register')} 
            className="text-primary font-bold hover:underline transition"
          >
            Create an account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

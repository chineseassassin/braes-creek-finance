"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

type LoginState = 'idle' | 'authorizing' | 'scanning' | 'granted';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState('authorizing');
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoginState('idle');
    } else {
      // Successful login -> trigger animation sequence
      setLoginState('scanning');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoginState('granted');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const getGlowStyle = () => {
    switch (loginState) {
      case 'authorizing': return 'bg-blue-900/30';
      case 'scanning': return 'bg-cyan-600/40';
      case 'granted': return 'bg-green-500/40';
      default: return 'bg-cyan-900/10';
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-inter relative overflow-hidden">
      <style>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .bg-stars {
          background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: 0 0, 30px 30px;
        }
      `}</style>
      
      {/* Starry Background */}
      <div className="absolute inset-0 bg-stars pointer-events-none opacity-50" />

      {/* Dynamic Ambient Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] blur-[150px] rounded-full pointer-events-none transition-colors duration-700 ease-in-out ${getGlowStyle()}`} />

      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-10 w-full">
          <img src="/logo.png" alt="Braes Creek Estate" className="h-28 md:h-32 object-contain mb-8 drop-shadow-2xl" />
          
          <div className="px-5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] backdrop-blur-md">
            SYSTEM OS 2026
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#0B1120] border border-white/10 rounded-[32px] py-12 px-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          {/* Scanning Line Overlay */}
          {loginState === 'scanning' && (
            <div className="absolute left-0 right-0 h-1 bg-[#06b6d4] shadow-[0_0_20px_#22d3ee] animate-scan-line z-50" />
          )}
          {/* Success Flash Overlay */}
          {loginState === 'granted' && (
            <div className="absolute inset-0 bg-green-500/10 z-50 pointer-events-none transition-all duration-500" />
          )}

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome</h2>
            <p className="text-white/50 text-sm">Sign in to the Intelligence Hub</p>
          </div>

          <form onSubmit={handleLogin} className="w-full max-w-[320px] space-y-6 flex flex-col">
            {error && (
              <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="w-full space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">ID ACCESS</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  disabled={loginState !== 'idle'}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-all"
                  placeholder="Enter your ID"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">SECURITY PASS</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    disabled={loginState !== 'idle'}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-all tracking-wider"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loginState !== 'idle'}
              className="w-full h-12 mt-2 bg-[#06b6d4] text-black font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-100 disabled:scale-100 relative overflow-hidden flex items-center justify-center"
            >
              <span className="relative z-10">
                {loginState === 'idle' && 'INITIALIZE ACCESS'}
                {loginState === 'authorizing' && 'AUTHORIZING...'}
                {loginState === 'scanning' && 'SCANNING CREDENTIALS'}
                {loginState === 'granted' && 'ACCESS GRANTED'}
              </span>
              
              {/* Button inner pulse when granted */}
              {loginState === 'granted' && (
                <div className="absolute inset-0 bg-green-400 mix-blend-overlay animate-pulse" />
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8 w-full max-w-[320px]">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">OR</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loginState !== 'idle'}
            className="w-full max-w-[320px] h-12 bg-transparent border border-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-3 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-[10px] font-semibold text-white/30 uppercase tracking-[0.3em]">
          © 2026 Braes Creek Estate • Secure Node • V.7.2
        </p>
      </div>
    </div>
  );
}

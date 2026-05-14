"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Activity, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-inter relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[500px] relative z-10">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E5C158] to-[#B8860B] flex items-center justify-center shadow-[0_0_40px_rgba(229,193,88,0.2)]">
            <Activity className="w-10 h-10 text-black" />
          </div>
          
          <div className="mt-6 px-5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] backdrop-blur-md">
            SYSTEM OS 2026
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0B1120] border border-white/10 rounded-[32px] p-10 md:p-12 shadow-2xl relative">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Welcome</h2>
            <p className="text-white/50 text-sm">Sign in to the Intelligence Hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-widest pl-1">ID ACCESS</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-4 text-base text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-all"
                  placeholder="Enter your ID"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-widest pl-1">SECURITY PASS</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 text-base text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-all tracking-wider"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 mt-8 bg-[#06b6d4] text-black font-black rounded-xl text-sm uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {isLoading ? 'Processing...' : 'INITIALIZE ACCESS'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">OR</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-14 bg-white text-black font-bold rounded-xl text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-12 text-[10px] font-semibold text-white/30 uppercase tracking-[0.3em]">
          © 2026 Braes Creek Estate • Secure Node • V.7.2
        </p>
      </div>
    </div>
  );
}

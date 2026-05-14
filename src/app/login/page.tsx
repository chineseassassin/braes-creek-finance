"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 font-inter relative overflow-hidden">
      <div className="w-full max-w-[600px] min-w-[360px] md:min-w-[420px] relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-24 h-24 rounded-3xl bg-[#bef264] flex items-center justify-center shadow-[0_0_60px_rgba(190,242,100,0.4)] mb-10 animate-pulse">
            <Activity className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white font-outfit tracking-tighter uppercase mb-4 text-center">Braes Creek HQ</h1>
          <p className="text-[#a3a3a3] text-sm font-black tracking-[0.4em] uppercase text-center">Unified Intelligence Access</p>
        </div>

        {/* Glow behind card */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#bef264]/10 blur-[100px] rounded-[40px] pointer-events-none scale-105" />
          
          {/* Login Card */}
          <div className="bg-[#1c1c1c] border border-white/20 rounded-[40px] p-10 md:p-14 shadow-2xl relative overflow-hidden z-10">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Lock className="w-48 h-48 text-white" />
            </div>

            <form onSubmit={handleLogin} className="space-y-10 relative z-20">
              {error && (
                <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-black text-[#a3a3a3] uppercase tracking-widest px-2">Personnel Email</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#888888]" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@braescreek.hq"
                      className="w-full h-[56px] md:h-[64px] bg-[#111111] border border-white/20 rounded-2xl pl-16 pr-6 text-lg font-bold text-white placeholder-[#777777] focus:outline-none focus:border-[#bef264] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-[#a3a3a3] uppercase tracking-widest px-2">Security Cipher</label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#888888]" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-[56px] md:h-[64px] bg-[#111111] border border-white/20 rounded-2xl pl-16 pr-6 text-lg font-bold text-white placeholder-[#777777] focus:outline-none focus:border-[#bef264] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-[60px] md:h-[70px] bg-[#bef264] text-black rounded-2xl font-black text-base md:text-lg uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(190,242,100,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-6"
              >
                {isLoading ? 'Decrypting Access...' : 'Authorize Entry'}
                {!isLoading && <ArrowRight className="w-6 h-6" />}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-12 text-xs font-black text-[#666666] uppercase tracking-[0.5em]">
          Secure Sentinel Gateway v4.2.0
        </p>
      </div>
    </div>
  );
}

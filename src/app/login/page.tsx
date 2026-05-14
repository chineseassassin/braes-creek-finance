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
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 font-inter">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-[#bef264] flex items-center justify-center shadow-[0_0_30px_rgba(190,242,100,0.2)] mb-6 animate-pulse">
            <Activity className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-black text-white font-outfit tracking-tighter uppercase mb-2">Braes Creek HQ</h1>
          <p className="text-[#3d3d3d] text-[10px] font-black tracking-[0.4em] uppercase">Unified Intelligence Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] border border-white/[0.04] rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <Lock className="w-32 h-32 text-white" />
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#444444] uppercase tracking-widest px-1">Personnel Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#222222]" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@braescreek.hq"
                    className="w-full bg-[#080808] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder-[#222222] focus:outline-none focus:border-[#bef264]/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#444444] uppercase tracking-widest px-1">Security Cipher</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#222222]" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080808] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder-[#222222] focus:outline-none focus:border-[#bef264]/30 transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#bef264] text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(190,242,100,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? 'Decrypting Access...' : 'Authorize Entry'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-[9px] font-black text-[#222222] uppercase tracking-[0.5em]">
          Secure Sentinel Gateway v4.2.0
        </p>
      </div>
    </div>
  );
}

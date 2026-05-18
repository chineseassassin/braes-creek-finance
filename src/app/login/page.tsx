'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginState, setLoginState] = useState<'idle' | 'authorizing' | 'scanning' | 'granted'>('idle');
  const [scanStep, setScanStep] = useState(0);

  const scanMessages = [
    'VERIFYING ID ACCESS...',
    'CHECKING SECURITY PASS...',
    'SYNCING BRAES CREEK NODE...',
    'ACCESS GRANTED'
  ];

  useEffect(() => {
    // Safely clear any existing Supabase session when hitting the login page
    supabase.auth.signOut();
  }, []);

  useEffect(() => {
    if (loginState === 'scanning') {
      let step = 0;
      setScanStep(step);
      
      const interval = setInterval(() => {
        step++;
        if (step < scanMessages.length) {
          setScanStep(step);
          if (step === scanMessages.length - 1) {
            setLoginState('granted');
          }
        } else {
          clearInterval(interval);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [loginState]);

  useEffect(() => {
    if (loginState === 'granted') {
      const timeout = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [loginState, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState('authorizing');
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      setLoginState('scanning');

    } catch (err: any) {
      setError(err.message || 'Access Denied');
      setLoginState('idle');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isScanningMode = loginState === 'scanning' || loginState === 'granted';

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-6 font-sans selection:bg-[#16dff3]/30 overflow-hidden relative">
      
      {/* Subtle star/dot background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle,white_0.5px,transparent_0.5px)] bg-[length:40px_40px] opacity-30" />
      </div>

      {/* Centered vertical stack */}
      <div 
        className="relative z-10 flex flex-col items-center w-full my-auto py-8"
        style={{ maxWidth: '460px' }}
      >
        
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img 
            src="/bc-logo.png" 
            alt="Braes Creek Estate" 
            className="object-contain"
            style={{ width: '240px', filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.15))' }}
          />
        </div>

        {/* SYSTEM OS 2026 pill */}
        <div 
          className="rounded-full border border-[#16dff3]/30 bg-[#16dff3]/5 font-black text-[#16dff3] uppercase backdrop-blur-md"
          style={{ 
            marginBottom: '32px',
            padding: '6px 16px',
            fontSize: '9px',
            letterSpacing: '0.3em',
            boxShadow: '0 0 15px rgba(22,223,243,0.1)'
          }}
        >
          SYSTEM OS 2026
        </div>

        {/* Dark navy login card */}
        <div 
          className={`w-full bg-[#0b1220] flex flex-col relative overflow-hidden transition-all duration-700
          ${isScanningMode ? 'shadow-[0_0_60px_rgba(22,223,243,0.15)]' : 'shadow-[0_40px_120px_rgba(0,0,0,0.9),0_0_40px_rgba(22,223,243,0.03)]'}`}
          style={{
            padding: '44px',
            borderRadius: '34px',
            border: isScanningMode ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
            animation: isScanningMode ? 'borderPulse 3s infinite' : 'none'
          }}
        >
          <style>{`
            @keyframes borderPulse {
              0% { border-color: #16dff3; box-shadow: 0 0 30px rgba(22,223,243,0.15); }
              25% { border-color: #14b8a6; box-shadow: 0 0 30px rgba(20,184,166,0.15); }
              50% { border-color: #0b1220; box-shadow: 0 0 30px rgba(11,18,32,0.15); }
              75% { border-color: #d4af37; box-shadow: 0 0 30px rgba(212,175,55,0.15); }
              100% { border-color: #16dff3; box-shadow: 0 0 30px rgba(22,223,243,0.15); }
            }
            @keyframes scan {
              0% { transform: translateY(-100%); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(500px); opacity: 0; }
            }
          `}</style>
          
          {/* Scanning Line overlay */}
          {isScanningMode && (
            <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#16dff3] to-transparent shadow-[0_0_30px_#16dff3] animate-[scan_2s_infinite_linear] z-50 pointer-events-none" />
          )}

          {/* Heading Section */}
          <div className="flex flex-col text-center relative z-10" style={{ marginBottom: '32px' }}>
            <h1 className="text-white font-bold tracking-tight leading-none" style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome</h1>
            <p className="text-[#8e9bb0] font-medium tracking-wide" style={{ fontSize: '13px' }}>Sign in to the Intelligence Hub</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col w-full relative z-10">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-center" style={{ marginBottom: '20px', padding: '14px', fontSize: '12px' }}>
                {error}
              </div>
            )}

            <div className="flex flex-col" style={{ gap: '20px' }}>
              {/* ID ACCESS field */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label className="font-bold text-[#8e9bb0] uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em', marginLeft: '4px' }}>ID ACCESS</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  disabled={loginState !== 'idle'}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#060a13] border rounded-xl text-white placeholder-white/20 focus:outline-none font-medium transition-all duration-300
                    ${isScanningMode ? 'border-[#16dff3]/40 shadow-[inset_0_0_15px_rgba(22,223,243,0.1)]' : 'border-white/10 focus:border-[#16dff3]/50'}`}
                  placeholder="admin@braescreek.com"
                  style={{ height: '48px', paddingLeft: '16px', paddingRight: '16px', fontSize: '15px' }}
                />
              </div>

              {/* SECURITY PASS field */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label className="font-bold text-[#8e9bb0] uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em', marginLeft: '4px' }}>SECURITY PASS</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    disabled={loginState !== 'idle'}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-[#060a13] border rounded-xl text-white placeholder-white/20 focus:outline-none tracking-widest font-black transition-all duration-300
                      ${isScanningMode ? 'border-[#16dff3]/40 shadow-[inset_0_0_15px_rgba(22,223,243,0.1)]' : 'border-white/10 focus:border-[#16dff3]/50'}`}
                    placeholder="••••••••"
                    style={{ height: '48px', paddingLeft: '16px', paddingRight: '48px', fontSize: '15px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginState !== 'idle'}
                    className="absolute top-1/2 -translate-y-1/2 text-[#8e9bb0] hover:text-white transition-colors disabled:opacity-50"
                    style={{ right: '16px' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Cyan INITIALIZE ACCESS button */}
            <button 
              type="submit"
              disabled={loginState !== 'idle'}
              className={`w-full font-black rounded-xl uppercase transition-all duration-300 flex items-center justify-center
                ${isScanningMode 
                  ? 'bg-transparent border border-[#16dff3] text-[#16dff3] shadow-[0_0_20px_rgba(22,223,243,0.3)]' 
                  : 'bg-[#16dff3] text-[#0b1220] hover:brightness-110 active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(22,223,243,0.6)] disabled:opacity-70 disabled:scale-100'}`}
              style={{ height: '52px', marginTop: '32px', fontSize: '14px', letterSpacing: '0.15em' }}
            >
              {loginState === 'idle' && 'INITIALIZE ACCESS'}
              {loginState === 'authorizing' && (
                <div className="flex items-center gap-3 text-[#0b1220]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AUTHORIZING</span>
                </div>
              )}
              {isScanningMode && (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>SCANNING ACCESS...</span>
                </div>
              )}
            </button>

            {/* Status text under button */}
            <div 
              className={`flex items-center justify-center transition-opacity duration-300 ${isScanningMode ? 'opacity-100' : 'opacity-0'}`}
              style={{ height: '24px', marginTop: '12px' }}
            >
              <p 
                className={`font-black uppercase
                  ${loginState === 'granted' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-[#16dff3] drop-shadow-[0_0_8px_rgba(22,223,243,0.5)] animate-pulse'}`}
                style={{ fontSize: '10px', letterSpacing: '0.2em' }}
              >
                {scanMessages[scanStep]}
              </p>
            </div>
          </form>

          {/* OR Divider */}
          <div 
            className={`flex items-center w-full transition-opacity duration-300 ${isScanningMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ gap: '16px', marginBottom: '24px' }}
          >
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="font-bold text-[#8e9bb0] uppercase" style={{ fontSize: '10px', letterSpacing: '0.2em' }}>OR</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* Dark Google button */}
          <div className="relative">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loginState !== 'idle'}
              className={`w-full bg-transparent border border-white/10 text-white/90 font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all duration-300 disabled:opacity-50
                ${isScanningMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              style={{ height: '48px', fontSize: '14px' }}
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
        </div>

        {/* Footer */}
        <p 
          className="font-bold text-[#8e9bb0] uppercase text-center opacity-60"
          style={{ marginTop: '40px', fontSize: '10px', letterSpacing: '0.15em' }}
        >
          © 2026 Braes Creek Estate • Secure Node • v.7.2
        </p>
      </div>
    </div>
  );
}

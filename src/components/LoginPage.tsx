'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

import { supabase } from '@/lib/supabase';

interface LoginProps {
  onLogin: (role: 'admin' | 'manager') => void;
}

export default function LoginPage({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const USERS = [
    { email: 'admin@braescreek.com', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
    { email: 'manager@braescreek.com', password: 'mgr123', role: 'manager' as const, name: 'Farm Manager' },
  ];

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase() === 'admin' ? 'admin@braescreek.com' : email;
    const user = USERS.find(u => u.email === normalizedEmail && u.password === password);
    
    if (user) {
      onLogin(user.role);
    } else {
      setError('Invalid credentials. Tip: Use "admin" as the email!');
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 10%, hsla(160, 100%, 10%, 1) 0%, transparent 50%), radial-gradient(circle at 50% 120%, hsla(160, 100%, 15%, 1) 0%, hsla(160, 100%, 5%, 0.8) 40%, transparent 80%), #020406',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* ATMOSPHERIC SPACE */}
      <div style={{ position: 'fixed', top: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '0', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1, animation: 'visionPop 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/logo-transparent.png"
              alt="Braes Creek Estate"
              width={260}
              height={260}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 25px rgba(16, 185, 129, 0.3)) brightness(1.1)' }}
            />
          </div>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 900, border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-block', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.4em', marginTop: '4px', opacity: 0.6 }}>SYSTEM OS 2026</p>
        </div>

        {/* Luminous Login Card (Obsidian Glass) */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '40px',
          padding: '48px',
          boxShadow: '0 80px 160px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05) inset',
          position: 'relative',
          overflow: 'hidden'
        }}>
           {/* Subtle Scanning Line */}
           <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.5), transparent)', animation: 'visionSweep 4s infinite linear', pointerEvents: 'none' }} />

          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.04em' }}>Welcome</h2>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 800, marginBottom: '44px', textAlign: 'center', opacity: 0.3 }}>Enterprise Intelligence Access</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#fff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3 }}>IDENTIFICATION</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@braescreek.com"
                required
                className="vision-input"
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#fff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3 }}>PASSKEY</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="vision-input"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    opacity: 0.3,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '16px', padding: '14px 20px', marginBottom: '24px', color: '#fca5a5', fontSize: '13px', fontWeight: 900, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="vision-btn-primary">
              Initialize Access
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 900, opacity: 0.2 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="vision-btn-google"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Authenticating...' : 'Corporate Login'}
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
           <p style={{ fontSize: '11px', color: '#fff', fontWeight: 900, opacity: 0.2 }}>© 2026 Braes Creek Estate · Secure Node · V.7.2</p>
        </div>
      </div>

      <style jsx>{`
        .vision-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 16px 20px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          outline: none;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vision-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #10b981;
          box-shadow: 0 0 20px rgba(16,185,129,0.15);
        }
        .vision-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .vision-btn-primary {
          width: 100%;
          padding: 20px;
          font-size: 16px;
          font-weight: 900;
          color: white;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 16px 32px rgba(16,185,129,0.3);
          letter-spacing: 0.1em;
        }
        .vision-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(16,185,129,0.4);
          filter: brightness(1.1);
        }
        .vision-btn-google {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 14px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s;
          opacity: 0.5;
        }
        .vision-btn-google:hover {
          background: rgba(255, 255, 255, 0.08);
          opacity: 1;
        }
        @keyframes visionPop {
          from { opacity: 0; transform: translateY(80px) scale(0.95); filter: blur(30px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes visionSweep {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}


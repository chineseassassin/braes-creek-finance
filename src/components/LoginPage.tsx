'use client';
import { useState } from 'react';
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeField, setActiveField] = useState<string | null>(null);

  // 3D Parallax Tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

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
    <div 
      onMouseMove={handleMouseMove}
      className="vision-bg-shift"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative'
      }}
    >
      {/* GENERATIVE NEURAL BACKGROUND */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            background: '#00F5FF',
            boxShadow: '0 0 15px #00F5FF',
            borderRadius: '50%',
            opacity: 0.5,
            transform: `translate(${mousePos.x * (i%4)}px, ${mousePos.y * (i%4)}px)`,
            transition: 'transform 0.4s ease-out'
          }} />
        ))}
      </div>

      {/* ATMOSPHERIC SPACE */}
      <div style={{ 
        position: 'fixed', 
        top: '10%', 
        right: '10%', 
        width: '600px', 
        height: '600px', 
        background: 'radial-gradient(circle, rgba(0, 245, 255, 0.04) 0%, transparent 70%)', 
        transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
        filter: 'blur(100px)', 
        pointerEvents: 'none' 
      }} />

      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        position: 'relative', 
        zIndex: 1, 
        animation: 'visionPop 1s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: `perspective(1000px) rotateX(${mousePos.y * -0.05}deg) rotateY(${mousePos.x * 0.05}deg) translateZ(20px)`
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo-transparent.png"
              alt="Braes Creek Estate"
              width={260}
              height={260}
              style={{ 
                objectFit: 'contain', 
                filter: 'drop-shadow(0 0 40px rgba(0, 245, 255, 0.15))',
                transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`
              }}
            />
          </div>
          <p style={{ color: '#00F5FF', fontSize: '11px', fontWeight: 900, border: '1px solid rgba(0, 245, 255, 0.2)', display: 'inline-block', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.4em', marginTop: '4px', opacity: 0.6 }}>SYSTEM OS 2026</p>
        </div>

        {/* Luminous Login Card (Hynex Obsidian) */}
        <div style={{
          background: 'rgba(20, 24, 33, 0.75)',
          backdropFilter: 'blur(60px) saturate(160%)',
          WebkitBackdropFilter: 'blur(60px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '40px',
          padding: '48px',
          boxShadow: activeField ? '0 80px 160px rgba(0, 245, 255, 0.1), 0 0 0 1px rgba(255,255,255,0.05) inset' : '0 80px 160px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
           {/* Subtle Scanning Beam */}
           <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.02), transparent)', animation: 'visionSweep 6s infinite linear', pointerEvents: 'none' }} />

          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.04em' }}>Welcome</h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 800, marginBottom: '44px', textAlign: 'center' }}>Portal Status: {activeField ? 'ACTIVE ENTRY' : 'STBY'}</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: activeField === 'email' ? '#00F5FF' : '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', transition: '0.3s' }}>ID ACCESS</label>
              <input
                type="text"
                value={email}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField(null)}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@braescreek.com"
                required
                className="vision-input"
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: activeField === 'pass' ? '#00F5FF' : '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', transition: '0.3s' }}>SECURITY PASS</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onFocus={() => setActiveField('pass')}
                  onBlur={() => setActiveField(null)}
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
                    color: activeField === 'pass' ? '#00F5FF' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.3s'
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
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 900, opacity: 0.3 }}>OR</span>
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
            {loading ? 'Authenticating...' : 'Continue with Google'}
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
           <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 900, opacity: 0.6 }}>© 2026 Braes Creek Estate · Secure Node · V.7.2</p>
        </div>
      </div>

      <style jsx>{`
        .vision-bg-shift {
          background: #0B0E14;
          animation: chromaShift 24s infinite linear;
        }

        @keyframes chromaShift {
          0%, 100% { background-color: #0B0E14; }
          33% { background-color: #080D1A; }
          66% { background-color: #091612; }
        }

        .vision-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
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
          background: rgba(0, 245, 255, 0.05);
          border-color: #00F5FF;
          box-shadow: 0 0 30px rgba(0, 245, 255, 0.2);
        }
        .vision-input::placeholder {
          color: rgba(255,255,255,0.1);
        }
        .vision-btn-primary {
          width: 100%;
          padding: 20px;
          font-size: 16px;
          font-weight: 900;
          color: #000;
          background: #00F5FF;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 16px 32px rgba(0, 245, 255, 0.2);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .vision-btn-primary:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 20px 40px rgba(0, 245, 255, 0.3);
          filter: brightness(1.1);
        }
        .vision-btn-google {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
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


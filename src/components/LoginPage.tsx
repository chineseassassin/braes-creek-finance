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
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user.role);
    } else {
      setError('Invalid credentials. Try admin@braescreek.com / admin123');
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
      background: 'radial-gradient(ellipse at 30% 20%, #0f2447 0%, #0a0d14 60%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Decorative orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ margin: '0 auto 0px', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/logo-transparent.png"
              alt="Braes Creek Estate"
              width={260}
              height={260}
              style={{
                objectFit: 'contain'
              }}
            />
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '-8px' }}>Farm & Business Finance Platform</p>
        </div>

        {/* Login card */}
        <div style={{
          background: '#151e2d',
          border: '1px solid #1e2d45',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: 'var(--shadow-premium)',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.02em' }}>Welcome Back</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>Enter your credentials to access your dashboard</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@braescreek.com"
                required
                className="login-input"
              />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-input"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '13px', display: 'flex', gap: '8px' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              Sign In
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1e2d45' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#1e2d45' }} />
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: '#ffffff',
              color: '#1f2937',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseOut={e => (e.currentTarget.style.background = '#ffffff')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Demo credentials */}
          <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.1)' }}>
            <p style={{ fontSize: '10px', color: '#60a5fa', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sandbox Accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Admin: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>admin@braescreek.com</span></p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Manager: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>manager@braescreek.com</span></p>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '32px' }}>
          © 2026 Braes Creek Estate · Secure Enterprise Access
        </p>
      </div>

      <style jsx>{`
        .login-input {
          width: 100%;
          background: #0a0d14;
          border: 1px solid #1e2d45;
          border-radius: 12px;
          padding: 12px 16px;
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: all 0.2s;
        }
        .login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
          background: #0f172a;
        }
      `}</style>
    </div>
  );
}


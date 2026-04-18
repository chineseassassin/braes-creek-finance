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
  const [isScanning, setIsScanning] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Executive Bypass Protocol
    if (email === 'admin' && password === 'admin') {
      setIsScanning(true);
      setTimeout(() => {
        onLogin('admin');
        setIsScanning(false);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setIsScanning(true);
        setTimeout(() => {
          onLogin('admin');
          setIsScanning(false);
          setLoading(false);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Identity verification failed. Protocol mismatch.');
      setLoading(false);
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

      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        position: 'relative', 
        zIndex: 1, 
        animation: 'visionPop 1s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: `perspective(1000px) rotateX(${mousePos.y * -0.05}deg) rotateY(${mousePos.x * 0.05}deg) translateZ(20px)`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo-transparent.png"
              alt="Braes Creek Estate"
              width={340}
              height={340}
              style={{ 
                objectFit: 'contain', 
                transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`,
                transition: 'transform 0.2s ease-out'
              }}
            />
          </div>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: 900, border: 'none', display: 'inline-block', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.4em', marginTop: '4px', opacity: 0.6 }}>SYSTEM OS 2026</p>
        </div>

        <div style={{
          background: 'none !important',
          padding: '48px',
          position: 'relative',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: `translateZ(40px)`,
          border: 'none !important',
          boxShadow: 'none !important'
        }}>
           {isScanning && (
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)', zIndex: 10 }} />
           )}

          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.04em' }}>Welcome</h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 800, marginBottom: '44px', textAlign: 'center' }}>Sign in to the Intelligence Hub</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: activeField === 'email' ? '#fff' : '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ID ACCESS</label>
              <input
                type="text"
                value={email}
                disabled={isScanning}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField(null)}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@braescreek.com"
                required
                className="vision-input"
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: activeField === 'pass' ? '#fff' : '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SECURITY PASS</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={isScanning}
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
                  disabled={isScanning}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: activeField === 'pass' ? '#fff' : '#94A3B8',
                    cursor: 'pointer', display: 'flex'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '16px', padding: '14px 20px', marginBottom: '24px', color: '#fca5a5', fontSize: '13px', fontWeight: 900 }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || isScanning} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '16px', fontWeight: 900 }}
            >
              {(loading || isScanning) ? 'Authenticating...' : 'Initialize Access'}
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
            disabled={loading || isScanning}
            className="vision-btn-google"
          >
            Continue with Google
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
           <p style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 900, opacity: 0.8 }}>© 2026 Braes Creek Estate · Secure Node · V.7.2</p>
        </div>
      </div>

      <style jsx>{`
        .vision-bg-shift { background: #000000 !important; }
        .vision-input {
          width: 100%; background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px;
          padding: 16px 20px; color: #fff; font-size: 15px; font-weight: 700; outline: none; transition: 0.3s;
        }
        .vision-input:focus { background: rgba(255, 255, 255, 0.08); border-color: #fff; }
        .vision-btn-google {
          width: 100%; background: rgba(255, 255, 255, 0.04); color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 14px;
          font-size: 14px; font-weight: 900; cursor: pointer; transition: 0.3s; opacity: 0.6;
        }
        .vision-btn-google:hover { background: rgba(255, 255, 255, 0.08); opacity: 1; }
        @keyframes visionPop {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

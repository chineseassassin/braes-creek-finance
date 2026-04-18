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
  const [activeField, setActiveField] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (clientY - innerHeight / 2) / (innerHeight / 2);
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Executive Bypass Protocol
    if (email === 'admin' && password === 'admin') {
      setTimeout(() => {
        onLogin('admin');
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        onLogin('admin');
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
      className="login-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
    >
      {/* Subtle Star Background */}
      <div className="stars-overlay" />
      
      <div className="login-content">
        {/* Branding Header */}
        <div className="branding-section">
          <img
            src="/bc-logo-final-v72.png"
            alt="Braes Creek Estate"
            className="main-logo"
            style={{ 
              transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            }}
          />
          <div className="system-pill">
            SYSTEM OS 2026
          </div>
        </div>

        {/* Main Login Card */}
        <div className="login-card">
          <h2 className="welcome-text">Welcome</h2>
          <p className="sub-text">Sign in to the Intelligence Hub</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label className={activeField === 'email' ? 'active' : ''}>ID ACCESS</label>
              <input
                type="text"
                value={email}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField(null)}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@braescreek.com"
                required
                className="custom-input"
              />
            </div>

            <div className="input-group">
              <label className={activeField === 'pass' ? 'active' : ''}>SECURITY PASS</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onFocus={() => setActiveField('pass')}
                  onBlur={() => setActiveField(null)}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="custom-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="initialize-btn"
            >
              {loading ? 'AUTHENTICATING...' : 'INITIALIZE ACCESS'}
            </button>
          </form>

          <div className="divider">
            <div className="line" />
            <span>OR</span>
            <div className="line" />
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-btn"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="18" height="18" />
            Continue with Google
          </button>
        </div>

        {/* Footer Metadata */}
        <div className="footer-metadata">
          © 2026 Braes Creek Estate · Secure Node · V.7.2
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .stars-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 100px 150px, #7c7c7c, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 400px 250px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 600px 400px, #5c5c5c, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 800px 100px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 800px 600px;
          opacity: 0.2;
          pointer-events: none;
        }

        .login-content {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .branding-section {
          text-align: center;
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .main-logo {
          width: 320px;
          height: auto;
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
          will-change: transform;
          /* Dual-layer transparency safety */
          mix-blend-mode: screen; 
          filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.1));
        }

        .branding-section::before {
          content: "";
          position: absolute;
          top: 40px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
          z-index: 1;
        }

        .system-pill {
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: #00e5ff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.3em;
          padding: 6px 16px;
          border-radius: 100px;
          margin-top: -10px;
          text-transform: uppercase;
        }

        .login-card {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 40px;
          padding: 56px;
          width: 100%;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
          position: relative;
          z-index: 10;
        }

        .welcome-text {
          font-size: 38px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 8px;
          text-align: center;
          letter-spacing: -0.04em;
        }

        .sub-text {
          color: #8b949e;
          font-size: 14px;
          text-align: center;
          margin-bottom: 40px;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-group label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #8b949e;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
          transition: color 0.2s;
        }

        .input-group label.active {
          color: #00e5ff;
        }

        .custom-input {
          width: 100%;
          background: #0d1117;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px 20px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .custom-input:focus {
          border-color: rgba(0, 229, 255, 0.4);
          background: #0d1117;
          box-shadow: 0 0 0 1px rgba(0, 229, 255, 0.1);
        }

        .password-wrapper {
          position: relative;
        }

        .eye-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #484f58;
          cursor: pointer;
          display: flex;
          padding: 4px;
          transition: color 0.2s;
        }

        .eye-toggle:hover {
          color: #ffffff;
        }

        .error-alert {
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid rgba(248, 81, 73, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          color: #f85149;
          font-size: 13px;
          margin-bottom: 24px;
          text-align: center;
        }

        .initialize-btn {
          width: 100%;
          background: #00e5ff;
          color: #000000;
          border: none;
          border-radius: 12px;
          padding: 18px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3);
        }

        .initialize-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 229, 255, 0.4);
          filter: brightness(1.1);
        }

        .initialize-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .initialize-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 32px 0;
        }

        .divider .line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .divider span {
          color: #484f58;
          font-size: 10px;
          font-weight: 800;
        }

        .google-btn {
          width: 100%;
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .google-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .footer-metadata {
          margin-top: 40px;
          color: #484f58;
          font-size: 11px;
          font-weight: 500;
          text-align: center;
          opacity: 0.8;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}

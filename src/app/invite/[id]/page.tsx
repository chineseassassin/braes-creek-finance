'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2, ShieldCheck, ShieldAlert, ArrowRight, Activity, MessageSquare, Lock, User, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function InvitePage() {
  const router = useRouter();
  const { id } = useParams();
  const { pendingInvites, addPendingInvite, acceptInvite, setCurrentUser } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptState, setAcceptState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [provisionStep, setProvisionStep] = useState(0);
  const [encodedData, setEncodedData] = useState<string | null>(null);

  const provisionMessages = [
    'VALIDATING INVITATION KEY...',
    'INITIALIZING SECURE CREDENTIALS...',
    'REGISTERING PROFILE NODE...',
    'ESTABLISHING ACCESS PERMISSIONS...',
    'SYNC COMPLETE. REDIRECTING...'
  ];

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setEncodedData(params.get('d'));
    }
  }, []);

  // Look up invite
  const inviteIdStr = typeof id === 'string' ? id : '';
  
  // Try to decode invite data if query param exists
  let decodedInvite: any = null;
  if (encodedData) {
    try {
      const binString = window.atob(encodedData);
      const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0));
      const decodedStr = new TextDecoder().decode(bytes);
      decodedInvite = JSON.parse(decodedStr);
    } catch (e) {
      console.error('Failed to decode invite data:', e);
    }
  }

  const invite = pendingInvites.find(i => i.id === inviteIdStr) || decodedInvite;

  useEffect(() => {
    if (invite) {
      setFullName(invite.fullName || '');
    }
  }, [invite]);

  // Provisioning steps animation
  useEffect(() => {
    if (acceptState === 'processing') {
      let step = 0;
      setProvisionStep(step);
      
      const interval = setInterval(() => {
        step++;
        if (step < provisionMessages.length) {
          setProvisionStep(step);
        } else {
          clearInterval(interval);
          setAcceptState('success');
        }
      }, 900);

      return () => clearInterval(interval);
    }
  }, [acceptState]);

  useEffect(() => {
    if (acceptState === 'success') {
      const timeout = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [acceptState, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#030712] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-[#16dff3] animate-spin mb-4" />
        <p className="text-[#8e9bb0] text-xs font-bold tracking-widest uppercase">ESTABLISHING SECURE CONNECTION...</p>
      </div>
    );
  }

  // Error: Invite not found, expired, or revoked
  const isInvalid = !invite || invite.status === 'Revoked';
  const isAlreadyAccepted = invite && invite.status === 'Accepted';

  if (isInvalid || isAlreadyAccepted) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-6 font-sans relative selection:bg-[#16dff3]/30">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle,white_0.5px,transparent_0.5px)] bg-[length:40px_40px] opacity-10" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-[480px] text-center">
          <div className="mb-6">
            <img src="/bc-logo.png" alt="Braes Creek Estate" className="w-[180px] object-contain opacity-80" />
          </div>

          <div className="w-full bg-[#0b1220] border border-white/5 shadow-2xl rounded-[28px] p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-white text-xl font-bold tracking-tight mb-3">
              {isAlreadyAccepted ? 'Invitation Already Accepted' : 'Invalid or Expired Invitation'}
            </h1>
            <p className="text-[#8e9bb0] text-sm leading-relaxed mb-8">
              {isAlreadyAccepted 
                ? 'This invitation has already been accepted. You can sign in using your registered credentials.'
                : 'The invitation link you used is invalid, has expired, or was revoked by the administrator. Please contact your estate administrator.'
              }
            </p>

            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              style={{ height: '48px' }}
            >
              Return to Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get mapped role titles & description
  const getRoleDetails = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return {
          title: 'Administrator',
          color: '#8b5cf6', // purple
          glow: 'rgba(139, 92, 246, 0.15)',
          permissions: [
            'Full configuration and settings access',
            'Approve capital expenditures and payroll',
            'Manage and audit system users',
            'Full P&L and financial control analysis'
          ]
        };
      case 'Data Entry':
        return {
          title: 'Data Entry Operator',
          color: '#10b981', // green
          glow: 'rgba(16, 185, 129, 0.15)',
          permissions: [
            'Add agricultural expense entries',
            'Log livestock updates and records',
            'Update crop status and planting fields',
            'Draft payroll payments for review'
          ]
        };
      default:
        return {
          title: 'Viewer Mode',
          color: '#3b82f6', // blue
          glow: 'rgba(59, 130, 246, 0.15)',
          permissions: [
            'View financial analytics & reports',
            'Check operational alerts & notifications',
            'Inspect crop & livestock logs',
            'No editing or approval authorization'
          ]
        };
    }
  };

  const roleDetails = getRoleDetails(invite.role);

  // Password strength checker
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: 'No Password Entered', color: '#6b7280' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { level: 1, text: 'WEAK', color: '#ef4444' };
      case 2:
      case 3:
        return { level: 2, text: 'MEDIUM', color: '#f59e0b' };
      case 4:
      default:
        return { level: 3, text: 'SECURE', color: '#10b981' };
    }
  };

  const strength = getPasswordStrength();

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setAcceptState('processing');

    try {
      // 1. Sign up the user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) throw signUpError;

      const userId = data.user?.id;
      const roleKey = invite.role === 'Admin' ? 'admin' : invite.role === 'Data Entry' ? 'data-entry' : 'viewer';

      if (userId) {
        // 2. Create the profile record in the database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: invite.email,
            full_name: fullName,
            role: roleKey
          });

        if (profileError) {
          console.warn('Profile database insert failed, fallback to local login:', profileError.message);
        }

        // 3. Mark the invite accepted and set current user in state
        const exists = pendingInvites.some(i => i.id === invite.id);
        if (exists) {
          acceptInvite(invite.id);
        } else {
          addPendingInvite({ ...invite, status: 'Accepted' });
        }
        setCurrentUser({
          id: userId,
          name: fullName,
          role: roleKey
        });
      } else {
        // Fallback for offline / dev test
        const exists = pendingInvites.some(i => i.id === invite.id);
        if (exists) {
          acceptInvite(invite.id);
        } else {
          addPendingInvite({ ...invite, status: 'Accepted' });
        }
        setCurrentUser({
          id: `user-${Date.now()}`,
          name: fullName,
          role: roleKey
        });
      }

      toast.success('Invitation accepted successfully!');
    } catch (err: any) {
      console.error('Accept invite error:', err);
      toast.error(err.message || 'Failed to complete registration.');
      setAcceptState('idle');
    }
  };

  const isProcessingMode = acceptState === 'processing' || acceptState === 'success';

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-6 font-sans relative selection:bg-[#16dff3]/30 overflow-y-auto">
      
      {/* Subtle star/dot background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle,white_0.5px,transparent_0.5px)] bg-[length:40px_40px] opacity-10" />
      </div>

      <div 
        className="relative z-10 flex flex-col items-center w-full my-auto py-8"
        style={{ maxWidth: '840px' }}
      >
        
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img 
            src="/bc-logo.png" 
            alt="Braes Creek Estate" 
            className="object-contain"
            style={{ width: '200px', filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.15))' }}
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
          SECURE PROTOCOL INTERCEPT
        </div>

        {/* Main invitation card */}
        <div 
          className={`w-full bg-[#0b1220] flex flex-col relative overflow-hidden transition-all duration-700
          ${isProcessingMode ? 'shadow-[0_0_60px_rgba(22,223,243,0.15)]' : 'shadow-[0_40px_120px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.02)]'}`}
          style={{
            padding: '40px',
            borderRadius: '34px',
            border: isProcessingMode ? '1px solid transparent' : '1px solid rgba(255,255,255,0.06)',
            animation: isProcessingMode ? 'borderPulse 3s infinite' : 'none'
          }}
        >
          <style>{`
            @keyframes borderPulse {
              0% { border-color: #16dff3; box-shadow: 0 0 30px rgba(22,223,243,0.15); }
              25% { border-color: #10b981; box-shadow: 0 0 30px rgba(16,185,129,0.15); }
              50% { border-color: #0b1220; box-shadow: 0 0 30px rgba(11,18,32,0.15); }
              75% { border-color: #8b5cf6; box-shadow: 0 0 30px rgba(139,92,246,0.15); }
              100% { border-color: #16dff3; box-shadow: 0 0 30px rgba(22,223,243,0.15); }
            }
            @keyframes scan {
              0% { transform: translateY(-100%); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(600px); opacity: 0; }
            }
          `}</style>
          
          {/* Scanning Line overlay */}
          {isProcessingMode && (
            <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#16dff3] to-transparent shadow-[0_0_30px_#16dff3] animate-[scan_2s_infinite_linear] z-50 pointer-events-none" />
          )}

          {isProcessingMode ? (
            <div className="flex flex-col items-center justify-center py-20 relative z-10 text-center">
              <Loader2 className="w-12 h-12 text-[#16dff3] animate-spin mb-6" />
              <h2 className="text-white text-xl font-bold tracking-wider mb-2 uppercase">PROVISIONING SECURE NODE</h2>
              <p className="text-[#16dff3] font-black uppercase text-xs tracking-[0.2em] animate-pulse">
                {provisionMessages[provisionStep]}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
              
              {/* Left Column: Form */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <h1 className="text-white font-bold tracking-tight text-2xl mb-2">Initialize Credentials</h1>
                  <p className="text-[#8e9bb0] font-medium text-xs mb-8">Establish your security signature for command node access.</p>

                  <form onSubmit={handleAcceptInvite} className="flex flex-col gap-6">
                    
                    {/* Full Name input */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-[#8e9bb0] uppercase text-[9px] tracking-wider ml-1">FULL NAME</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#060a13] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none font-medium h-[48px] pl-11 pr-4 text-[14px] focus:border-[#16dff3]/50 transition-colors"
                          placeholder="Jane Doe"
                        />
                      </div>
                    </div>

                    {/* Email input (read-only) */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-[#8e9bb0] uppercase text-[9px] tracking-wider ml-1">ASSIGNED EMAIL</label>
                      <div className="relative opacity-60">
                        <Mail className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email" 
                          disabled
                          value={invite.email}
                          className="w-full bg-[#060a13] border border-white/5 rounded-xl text-white/50 h-[48px] pl-11 pr-4 text-[14px] cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Password input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="font-bold text-[#8e9bb0] uppercase text-[9px] tracking-wider">CHOOSE PASSWORD</label>
                        <span 
                          className="font-bold text-[9px]" 
                          style={{ color: strength.color }}
                        >
                          {strength.text}
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#060a13] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none tracking-widest font-black h-[48px] pl-11 pr-11 text-[14px] focus:border-[#16dff3]/50 transition-colors"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 -translate-y-1/2 text-[#8e9bb0] hover:text-white right-4 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Password strength meter bars */}
                      <div className="flex gap-1.5 px-1 mt-1">
                        <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${password.length > 0 ? (strength.level >= 1 ? 'bg-red-500' : 'bg-white/10') : 'bg-white/10'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${password.length > 0 ? (strength.level >= 2 ? 'bg-amber-500' : 'bg-white/10') : 'bg-white/10'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${password.length > 0 ? (strength.level >= 3 ? 'bg-emerald-500' : 'bg-white/10') : 'bg-white/10'}`} />
                      </div>
                    </div>

                    {/* Confirm Password input */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-[#8e9bb0] uppercase text-[9px] tracking-wider ml-1">CONFIRM PASSWORD</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#060a13] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none tracking-widest font-black h-[48px] pl-11 pr-11 text-[14px] focus:border-[#16dff3]/50 transition-colors"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute top-1/2 -translate-y-1/2 text-[#8e9bb0] hover:text-white right-4 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#16dff3] text-[#0b1220] hover:brightness-110 active:scale-[0.98] transition-all font-black rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-4 shadow-[0_10px_30px_-10px_rgba(22,223,243,0.6)]"
                      style={{ height: '52px' }}
                    >
                      Authorize Entry & Access Node <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Roles & Messages */}
              <div className="md:col-span-5 flex flex-col gap-6">
                
                {/* Active Role card */}
                <div 
                  className="rounded-[20px] p-6 border flex flex-col gap-4 relative overflow-hidden"
                  style={{ 
                    borderColor: roleDetails.color,
                    background: `linear-gradient(180deg, ${roleDetails.glow} 0%, transparent 100%), #0d1627`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Level</span>
                    <ShieldCheck className="w-5 h-5 animate-pulse" style={{ color: roleDetails.color }} />
                  </div>
                  
                  <div>
                    <h2 className="text-white text-lg font-bold" style={{ textShadow: `0 0 15px ${roleDetails.glow}` }}>{roleDetails.title}</h2>
                    <p className="text-[#8e9bb0] text-xs font-semibold mt-1">Granted Capabilities</p>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2 border-t border-white/5 pt-4">
                    {roleDetails.permissions.map((p, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-[#8e9bb0] text-xs font-medium leading-relaxed">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message card (if message is defined) */}
                {invite.message && (
                  <div className="bg-white/3 border border-white/5 rounded-[20px] p-6 flex flex-col gap-3">
                    <div className="flex gap-2 items-center text-[#8e9bb0]">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Note from Estate Control</span>
                    </div>
                    <p className="text-[#8e9bb0] text-xs leading-relaxed italic">
                      &ldquo;{invite.message}&rdquo;
                    </p>
                  </div>
                )}

                {/* System Audit Information */}
                <div className="bg-white/3 border border-white/5 rounded-[20px] p-6 flex flex-col gap-3">
                  <div className="flex gap-2 items-center text-[#8e9bb0]">
                    <Activity className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-wider">SECURE CONNECTION INFO</span>
                  </div>
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-[#8e9bb0]">IP SECURITY:</span>
                      <span className="text-emerald-400">ACTIVE LOG</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-[#8e9bb0]">NODE SIGNATURE:</span>
                      <span className="font-mono text-[#8e9bb0]">{invite.id.slice(0, 14)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

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

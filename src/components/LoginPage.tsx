import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { loginUser, setPassword, verifyOtp } from '../services/api';
import type { User } from '../types/rorr';

interface Props {
  onLoginSuccess: (user: User) => void;
  revocationMessage?: string | null;
}

const BACKGROUND_IMAGES = [
  '/assets/bg_telemetry.jpg',
  '/assets/bg_neural.jpg',
  '/assets/bg_matrix.jpg',
];

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, revocationMessage }) => {
  // Mode: 'login' | 'activation-otp' | 'activation-password'
  const [mode, setMode] = useState<'login' | 'activation-otp' | 'activation-password'>('login');

  // Standard Login Fields
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('ottynenty@hotmail.com');
  const [password, setPasswordInput] = useState<string>('RorrSuperAdmin2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Activation Fields
  const [inviteIdentifier, setInviteIdentifier] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [verifiedFullName, setVerifiedFullName] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState<number>(0);

  // Auto-cycle moving background imagery
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Check URL query parameters for invitation links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isInvite = params.get('invite') === 'true' || params.get('action') === 'invite';
    const emailParam = params.get('email');
    const userParam = params.get('username');

    if (isInvite || emailParam || userParam) {
      setMode('activation-otp');
      const identifier = emailParam || userParam || '';
      setInviteIdentifier(identifier);
      setSuccessNotice('Invitation link detected! Please enter the 6-digit OTP code sent to your email.');
    }
  }, []);

  // Standard Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });

      // If user is in first-time activation state
      if (res.mustChangePassword) {
        setInviteIdentifier(res.username || usernameOrEmail.trim());
        if (res.verifiedOtp) {
          setOtpCode(res.verifiedOtp);
          setMode('activation-password');
          setSuccessNotice('OTP verified! Please create your permanent confidential password.');
        } else {
          setMode('activation-otp');
          setErrorMsg('First-time staff activation required. Please verify your invitation OTP code.');
        }
        return;
      }

      if (res.id) {
        onLoginSuccess(res as unknown as User);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setErrorMsg(
        err?.response?.data?.message || 'Invalid username/email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    if (!inviteIdentifier.trim() || !otpCode.trim()) {
      setErrorMsg('Please provide your Username/Email and the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({
        usernameOrEmail: inviteIdentifier.trim(),
        otp: otpCode.trim(),
      });

      setVerifiedFullName(res.fullName || res.username);
      setMode('activation-password');
      setSuccessNotice('Identity verified via OTP! Now set your confidential permanent password.');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Invalid or expired OTP code. Please check your invitation email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set Permanent Password & Enter Dashboard
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const user = await setPassword({
        usernameOrEmail: inviteIdentifier.trim(),
        otp: otpCode.trim(),
        newPassword: newPassword.trim(),
      });

      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (emailVal: string, passVal: string) => {
    setUsernameOrEmail(emailVal);
    setPasswordInput(passVal);
    setErrorMsg(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const res = await loginUser({
        usernameOrEmail: emailVal,
        password: passVal,
      });

      if (res.id) {
        onLoginSuccess(res as unknown as User);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background imagery */}
      {BACKGROUND_IMAGES.map((imgSrc, idx) => (
        <div
          key={imgSrc}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
            idx === bgIndex ? 'opacity-35' : 'opacity-0'
          }`}
        >
          <img
            src={imgSrc}
            alt="System Telemetry Background"
            className="w-full h-full object-cover animate-pan-zoom"
          />
        </div>
      ))}

      {/* Dark Vignette Overlay & Grid Mesh */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-[#09090b]/90 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />

      {/* Floating Ambient Data Nodes */}
      <div className="absolute top-12 left-12 p-3 rounded-2xl bg-[#121215]/80 border border-[#27272a] backdrop-blur-md hidden xl:flex items-center gap-3 shadow-2xl animate-drift-1">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <div>
          <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Live Telemetry Ingestion</p>
          <p className="text-[9px] font-mono text-zinc-400">1.2 TB/s • 99.98% Uptime</p>
        </div>
      </div>

      <div className="absolute bottom-16 right-16 p-3 rounded-2xl bg-[#121215]/80 border border-[#27272a] backdrop-blur-md hidden xl:flex items-center gap-3 shadow-2xl animate-drift-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <div>
          <p className="text-[10px] font-mono font-bold text-white uppercase">Powered by Neotro Ltd</p>
          <p className="text-[9px] font-mono text-zinc-400">Enterprise PBAC Access Security</p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-md relative z-10 animate-float">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)] mb-3 backdrop-blur-xl">
            <Activity className="w-7 h-7 text-emerald-400" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-wider flex items-center justify-center gap-2 drop-shadow-md">
            <span>RORR</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30 uppercase tracking-widest">
              v1.2.0
            </span>
          </h1>
          <p className="text-xs text-zinc-300 font-mono mt-1 max-w-xs mx-auto drop-shadow-sm">
            System Error Intelligence, Low-Overhead Telemetry &amp; Access Governance
          </p>
        </div>

        {/* Revocation Warning Alert if evicted */}
        {revocationMessage && (
          <div className="mb-4 p-3.5 bg-rose-950/90 border border-rose-500/60 rounded-2xl text-rose-200 text-xs flex items-center gap-3 font-mono shadow-xl animate-shake">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-rose-300">Session Revoked</p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">{revocationMessage}</p>
            </div>
          </div>
        )}

        {/* Elevated Floating Glass Card */}
        <div className="bg-[#121215]/90 border border-[#27272a]/90 rounded-3xl p-7 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-5">
          {/* Status Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center justify-between font-mono">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 font-bold text-sm cursor-pointer ml-2">
                &times;
              </button>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* VIEW 1: STANDARD SIGN IN */}
          {mode === 'login' && (
            <>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Sign In to Telemetry Deck</span>
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Enter your provisioned staff credentials</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">Username or Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ottynenty@hotmail.com"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#09090b]/80 border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-[#09090b]/80 border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs font-mono rounded-xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Rorr Dashboard'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Onboarding Invitation Link Helper */}
              <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Received an email invite?</span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessNotice(null);
                    setMode('activation-otp');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Activate with OTP &rarr;</span>
                </button>
              </div>

              {/* Quick Demo Login Preset Buttons */}
              <div className="pt-3 border-t border-[#27272a]">
                <p className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider mb-2 text-center flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>One-Click Credential Presets</span>
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ottynenty@hotmail.com', 'RorrSuperAdmin2026!')}
                    className="p-2 bg-[#18181b]/90 hover:bg-[#27272a] border border-[#27272a] hover:border-emerald-500/40 rounded-xl text-left transition group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Admin</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 font-mono truncate mt-0.5">Otty Nenty</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('engineer@rorr.dev', 'RorrEngineer2026!')}
                    className="p-2 bg-[#18181b]/90 hover:bg-[#27272a] border border-[#27272a] hover:border-emerald-500/40 rounded-xl text-left transition group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-[11px]">
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Engineer</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 font-mono truncate mt-0.5">Systems Dev</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('viewer@rorr.dev', 'RorrViewer2026!')}
                    className="p-2 bg-[#18181b]/90 hover:bg-[#27272a] border border-[#27272a] hover:border-emerald-500/40 rounded-xl text-left transition group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-zinc-300 font-bold font-mono text-[11px]">
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Viewer</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono truncate mt-0.5">QA Auditor</p>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* VIEW 2: STEP 1 - VERIFY ONBOARDING OTP */}
          {mode === 'activation-otp' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase mb-1 border border-emerald-500/20">
                    Step 1 of 2
                  </div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Staff Invitation Activation</span>
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">Enter your One-Time Password (OTP)</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessNotice(null);
                    setMode('login');
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white transition flex items-center text-xs font-mono"
                  title="Back to Sign In"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" />
                  <span>Back</span>
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                    Username or Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. staff@company.com"
                      value={inviteIdentifier}
                      onChange={(e) => setInviteIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#09090b]/80 border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition shadow-inner font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                    6-Digit Invitation OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 482910"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b]/90 border border-emerald-500/40 rounded-xl text-base text-center font-mono tracking-widest text-emerald-400 font-bold placeholder-zinc-700 focus:outline-none focus:border-emerald-400 transition shadow-inner"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    The 6-digit code provided in your administrator email invitation.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs font-mono rounded-xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Configure Password'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}

          {/* VIEW 3: STEP 2 - SET PERMANENT PASSWORD */}
          {mode === 'activation-password' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold uppercase mb-1 border border-indigo-500/20">
                    Step 2 of 2
                  </div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Set Permanent Password</span>
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {verifiedFullName ? `Welcome, ${verifiedFullName}` : 'Create your confidential staff password'}
                  </p>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OTP Verified</span>
                </div>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                    New Permanent Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-[#09090b]/80 border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1">
                    Confirm Permanent Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#09090b]/80 border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Strength Checklist */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-[10px] font-mono">
                  <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span>•</span>
                    <span>At least 8 characters in length</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span>•</span>
                    <span>Passwords match exactly</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs font-mono rounded-xl transition shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{loading ? 'Activating Account...' : 'Set Password & Enter Dashboard'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-zinc-400 font-mono text-center mt-5 drop-shadow">
          Protected by Rorr Identity Governance &amp; PBAC Access Control
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const { login, loginAsDemo, userProfile } = useGrade();
  const { themeColor } = useTheme();

  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('กรุณากรอกอีเมลโรงเรียน');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    login(email, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="rounded-3xl max-w-md w-full p-6 sm:p-7 border shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto box-border"
        style={{
          background: 'var(--theme-glass, rgba(255, 255, 255, 0.88))',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderColor: 'var(--theme-glass-border, rgba(255, 255, 255, 0.85))',
          boxShadow: 'var(--theme-glow, 0 24px 60px -12px rgba(var(--app-primary-rgb, 219, 39, 119), 0.25))',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-white/70 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div
            id="login-header-icon-container"
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--theme-accent-soft, rgba(var(--app-primary-rgb, 219, 39, 119), 0.16))',
              border: '1.5px solid var(--theme-accent-border, rgba(var(--app-primary-rgb, 219, 39, 119), 0.40))',
              boxShadow: '0 8px 24px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.24), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <GraduationCap
              className="w-8 h-8 drop-shadow-xs"
              style={{
                color: 'var(--theme-icon, var(--theme-primary, #db2777))',
                strokeWidth: 2.3,
              }}
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--theme-text-primary, #0f172a)' }}>
            เข้าสู่ระบบ MyGrade 🫧
          </h2>
          <p className="text-xs sm:text-sm font-semibold mt-1" style={{ color: 'var(--theme-text-secondary, #334155)' }}>
            ยินดีต้อนรับกลับมา! พร้อมจัดการเกรดและเป้าหมายวันนี้
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              อีเมลโรงเรียน หรือ อีเมลส่วนตัว
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="student@school.ac.th"
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-white/90 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white shadow-2xs focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                รหัสผ่าน
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-white/80 border border-white/90 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white shadow-2xs focus:ring-2 focus:ring-pink-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer"
              />
              <span>จดจำการเข้าสู่ระบบ</span>
            </label>
            <button
              type="button"
              onClick={loginAsDemo}
              className="text-pink-600 hover:text-pink-700 font-extrabold cursor-pointer"
            >
              โหมดทดลองใช้?
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl text-white font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 hover:brightness-105"
            style={{
              background: 'linear-gradient(135deg, var(--app-primary, #db2777) 0%, var(--app-primary-gradient-end, #c084fc) 100%)',
              boxShadow: '0 6px 20px rgba(var(--app-primary-rgb, 219, 39, 119), 0.4)',
            }}
          >
            <span>เข้าสู่ระบบ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest Demo Login shortcut */}
        <div className="mt-4 pt-4 border-t border-white/80 text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              loginAsDemo();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl text-slate-800 text-xs font-extrabold border border-white/90 shadow-2xs hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer bg-white/70"
          >
            <UserCheck className="w-4 h-4 text-pink-600" />
            <span>เข้าใช้งานด่วนด้วยบัญชีตัวอย่าง (Demo Student) ✨</span>
          </button>

          <p className="text-xs text-slate-600 font-semibold">
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-pink-600 hover:text-pink-700 font-black cursor-pointer underline"
            >
              สมัครสมาชิกฟรีที่นี่
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

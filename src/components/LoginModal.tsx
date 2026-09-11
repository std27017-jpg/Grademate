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
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';

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

  const [email, setEmail] = useState(userProfile.email || 'std27017@phichai.ac.th');
  const [password, setPassword] = useState('MyGrade2026!');
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

  const handleFillDemo = () => {
    setEmail('std27017@phichai.ac.th');
    setPassword('MyGrade2026!');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 border border-pink-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto box-border">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 via-purple-500 to-indigo-500 text-white shadow-md shadow-pink-500/20 mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">เข้าสู่ระบบ MyGrade 🌸</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            เข้าถึงข้อมูลเกรด ตารางสอบ และเป้าหมายอนาคตของคุณ
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              อีเมลโรงเรียน (School Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="std27017@phichai.ac.th"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">รหัสผ่าน (Password)</label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-pink-600 hover:underline font-semibold"
              >
                ใส่ข้อมูลตัวอย่าง
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="รหัสผ่านของคุณ"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500"
              />
              <span>จำฉันไว้ในระบบ</span>
            </label>
            <span className="text-[11px] text-slate-400">ปลอดภัย ข้อมูลบันทึกในเครื่อง</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>เข้าสู่ระบบ</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Direct Demo Login Button */}
          <button
            type="button"
            onClick={() => {
              loginAsDemo();
              onClose();
            }}
            className="w-full py-2 px-4 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>เข้าใช้งานด่วนด้วยบัญชีทดลอง (ชญาภา)</span>
          </button>

          {/* Switch to Register */}
          <div className="pt-2 text-center text-xs text-slate-500">
            <span>ยังไม่มีบัญชีใช่ไหม? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              สมัครบัญชีใหม่ที่นี่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

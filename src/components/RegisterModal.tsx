import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  School,
  Calendar,
  GraduationCap,
  Target,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import {
  CUTE_AVATARS,
  CAREER_PRESETS,
  UNIVERSITY_PRESETS,
  FACULTY_PRESETS,
} from '../data/defaultData';
import { GradeLevel, NumericGrade } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { register } = useGrade();

  // Step 1: Account & Profile, Step 2: Future Goals
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [email, setEmail] = useState('std27017@phichai.ac.th');
  const [password, setPassword] = useState('MyGrade2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('ชญาภา สุขสมบูรณ์');
  const [nickname, setNickname] = useState('น้ำหวาน');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('ม.5');
  const [room, setRoom] = useState('1');
  const [studentNumber, setStudentNumber] = useState('17');
  const [schoolName, setSchoolName] = useState('โรงเรียนพิชัย');
  const [academicYear, setAcademicYear] = useState<number>(2568);
  const [avatar, setAvatar] = useState('🌸');

  // Goals Fields (Step 2)
  const [targetGpa, setTargetGpa] = useState<NumericGrade>(3.5);
  const [dreamCareer, setDreamCareer] = useState('สัตวแพทย์');
  const [dreamUniversity, setDreamUniversity] = useState('มหาวิทยาลัยเชียงใหม่');
  const [dreamFaculty, setDreamFaculty] = useState('คณะสัตวแพทยศาสตร์');

  // Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: 'กรุณากรอกรหัสผ่าน', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) || /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { level: 1, text: 'ความปลอดภัย: ง่าย', color: 'bg-rose-400' };
    if (score <= 4) return { level: 2, text: 'ความปลอดภัย: ปานกลาง', color: 'bg-amber-400' };
    return { level: 3, text: 'ความปลอดภัย: ปลอดภัยดี ✨', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  // Email validation
  const validateEmail = (val: string) => {
    setEmail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('รูปแบบอีเมลไม่ถูกต้อง ตัวอย่าง: std27017@phichai.ac.th');
    } else if (!val.includes('.ac.th') && !val.includes('.edu') && !val.includes('school')) {
      setEmailError('แนะนำให้ใช้อีเมลโรงเรียน เช่น @...ac.th หรือโดเมนโรงเรียน');
    } else {
      setEmailError('');
    }
  };

  const handleNextStep = () => {
    if (!email) {
      setEmailError('กรุณากรอกอีเมลโรงเรียน');
      return;
    }
    if (!password || password.length < 6) {
      setPasswordError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (!fullName.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({
      email,
      fullName: fullName.trim(),
      nickname: nickname.trim(),
      gradeLevel,
      room: room.trim(),
      studentNumber: studentNumber.trim(),
      studentClass: `${gradeLevel}/${room || '1'}`,
      schoolName: schoolName.trim(),
      academicYear: Number(academicYear) || 2568,
      avatar,
      targetGpa,
      dreamCareer,
      dreamUniversities: [
        {
          id: `u_${Date.now()}`,
          universityName: dreamUniversity,
          faculty: dreamFaculty,
          major: dreamFaculty.replace('คณะ', 'สาขา'),
          priority: 1,
        },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-pink-100 shadow-2xl relative my-auto max-h-[94vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 via-purple-500 to-indigo-500 text-white shadow-md shadow-pink-500/20 mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'สมัครบัญชี MyGrade 🌸' : 'ตั้งค่าเป้าหมายของฉัน 🎯'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {step === 1
              ? 'ขั้นตอนที่ 1/2: ข้อมูลส่วนตัวและบัญชีผู้ใช้'
              : 'ขั้นตอนที่ 2/2: เกรดเป้าหมาย คณะ และอาชีพในฝัน'}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              step === 1 ? 'w-8 bg-pink-500' : 'w-2 bg-pink-200'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all ${
              step === 2 ? 'w-8 bg-pink-500' : 'w-2 bg-pink-200'
            }`}
          />
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 text-left">
          {step === 1 ? (
            <>
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เลือกรูปโปรไฟล์ / ตัวการ์ตูนประจำตัว
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-pink-50/50 rounded-2xl border border-pink-100">
                  {CUTE_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        avatar === av
                          ? 'bg-white shadow-sm ring-2 ring-pink-500 scale-110 font-bold'
                          : 'hover:bg-white/60 text-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลโรงเรียน (School Email) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    placeholder="เช่น std27017@phichai.ac.th"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 ${
                      emailError ? 'border-amber-300 focus:ring-amber-400' : 'border-slate-200 focus:ring-pink-400'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="ความยาว 6 ตัวอักษรขึ้นไป"
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
                {/* Strength bar */}
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all ${
                        strength.level >= 1 ? strength.color : 'bg-transparent'
                      } w-1/3`}
                    />
                    <div
                      className={`h-full transition-all ${
                        strength.level >= 2 ? strength.color : 'bg-transparent'
                      } w-1/3`}
                    />
                    <div
                      className={`h-full transition-all ${
                        strength.level >= 3 ? strength.color : 'bg-transparent'
                      } w-1/3`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 shrink-0">
                    {strength.text}
                  </span>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-rose-500 mt-1">{passwordError}</p>
                )}
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น ชญาภา สุขสมบูรณ์"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อเล่น (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น น้ำหวาน"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              {/* Class & Room & Number */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                  >
                    <option value="ม.4">ม.4</option>
                    <option value="ม.5">ม.5</option>
                    <option value="ม.6">ม.6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เลขที่</label>
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="17"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              {/* School & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">โรงเรียน</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="โรงเรียนพิชัย"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ปีการศึกษา</label>
                  <input
                    type="number"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    placeholder="2568"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Target Grade */}
              <div className="bg-pink-50/60 p-4 rounded-3xl border border-pink-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-pink-800 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-pink-600" />
                    <span>เป้าหมายเกรดที่อยากได้ (Target GPA)</span>
                  </label>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-pink-600 text-white shadow-2xs">
                    {targetGpa.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  เลือกเกรดที่คุณตั้งใจทำให้ได้ ระบบจะคำนวณคะแนนที่ต้องทำเพิ่มให้อัตโนมัติ (เปลี่ยนได้ตลอดเวลา)
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
                  {([4, 3.5, 3, 2.5, 2, 1.5, 1, 0] as NumericGrade[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTargetGpa(g)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        targetGpa === g
                          ? 'bg-pink-600 text-white shadow-xs scale-105'
                          : 'bg-white text-slate-700 hover:bg-pink-100 border border-slate-200/80'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dream Career */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  อาชีพหรือสิ่งที่อยากเป็น (Dream Career) 💼
                </label>
                <input
                  type="text"
                  value={dreamCareer}
                  onChange={(e) => setDreamCareer(e.target.value)}
                  placeholder="เช่น สัตวแพทย์, แพทย์, วิศวกร"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CAREER_PRESETS.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setDreamCareer(c.name)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
                        dreamCareer === c.name
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80'
                      }`}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dream University & Faculty */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    มหาวิทยาลัยในฝัน (Dream University) 🎓
                  </label>
                  <input
                    type="text"
                    value={dreamUniversity}
                    onChange={(e) => setDreamUniversity(e.target.value)}
                    placeholder="เช่น มหาวิทยาลัยเชียงใหม่, จุฬาลงกรณ์มหาวิทยาลัย"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {UNIVERSITY_PRESETS.slice(0, 4).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setDreamUniversity(u)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คณะในฝัน (Faculty) 📚
                  </label>
                  <input
                    type="text"
                    value={dreamFaculty}
                    onChange={(e) => setDreamFaculty(e.target.value)}
                    placeholder="เช่น คณะสัตวแพทยศาสตร์, คณะแพทยศาสตร์"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {FACULTY_PRESETS.slice(0, 5).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setDreamFaculty(f)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 border border-slate-200 transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-3">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              id="register-step1-next"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <span>ถัดไป: ตั้งเป้าหมาย</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              id="register-submit-btn"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>สร้างบัญชี & เริ่มวางแผนทันที</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

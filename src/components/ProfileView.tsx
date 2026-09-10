import React, { useState } from 'react';
import {
  User,
  School,
  Mail,
  GraduationCap,
  Calendar,
  Settings,
  Target,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Edit3,
  Sparkles,
  Heart,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { CUTE_AVATARS } from '../data/defaultData';
import { GradeLevel, NumericGrade } from '../types';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    academicYear,
    setAcademicYear,
    logout,
    resetToDefault,
    exportJSON,
    importJSON,
    gradeThresholds,
    updateGradeThresholds,
    resetGradeThresholds,
  } = useGrade();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [nickname, setNickname] = useState(userProfile.nickname || '');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(userProfile.gradeLevel || 'ม.5');
  const [room, setRoom] = useState(userProfile.room || '1');
  const [studentNumber, setStudentNumber] = useState(userProfile.studentNumber || '17');
  const [schoolName, setSchoolName] = useState(userProfile.schoolName || 'โรงเรียนพิชัย');
  const [avatar, setAvatar] = useState(userProfile.avatar || '🌸');
  const [selectedYear, setSelectedYear] = useState<number>(academicYear || 2568);
  const [showThresholds, setShowThresholds] = useState(false);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName: fullName.trim(),
      nickname: nickname.trim(),
      gradeLevel,
      room: room.trim(),
      studentNumber: studentNumber.trim(),
      studentClass: `${gradeLevel}/${room || '1'}`,
      schoolName: schoolName.trim(),
      academicYear: Number(selectedYear) || 2568,
      avatar,
    });
    setAcademicYear(Number(selectedYear) || 2568);
    setIsEditing(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJSON(content);
        alert('นำเข้าข้อมูลสำเร็จแล้วค่ะ ✨');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 text-left max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl p-6 border border-pink-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white shadow-md border-3 border-pink-300 flex items-center justify-center text-4xl select-none">
              {userProfile.avatar || '🌸'}
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="สถานะใช้งาน">
              ✓
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {userProfile.fullName}
              </h2>
              {userProfile.nickname && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  น้อง{userProfile.nickname}
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                ม.ปลาย
              </span>
            </div>

            <div className="text-xs text-slate-600 font-medium flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
              <span className="flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-slate-400" />
                <span>{userProfile.schoolName || 'โรงเรียนพิชัย'}</span>
              </span>
              <span>
                ชั้น {userProfile.gradeLevel || 'ม.5'}/{userProfile.room || '1'} (เลขที่ {userProfile.studentNumber || '17'})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>ปีการศึกษา {academicYear}</span>
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1 pt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{userProfile.email || 'std27017@phichai.ac.th'}</span>
            </div>
          </div>

          {/* Edit Profile button */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-pink-500" />
            <span>{isEditing ? 'ปิดฟอร์มแก้ไข' : 'แก้ไขโปรไฟล์'}</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form (Collapse / Expand) */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-200 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-pink-500" />
              <span>แก้ไขข้อมูลนักเรียน</span>
            </h3>
            <span className="text-[11px] text-slate-400">บันทึกข้อมูลในเครื่องทันที</span>
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              เปลี่ยนตัวการ์ตูนโปรไฟล์
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เลขที่</label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">โรงเรียน</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ปีการศึกษา</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xs hover:bg-pink-700 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      )}

      {/* Target & Future Summary Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-500" />
          <span>เป้าหมายการเรียน & อนาคตที่ตั้งไว้</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
            <div className="text-[10px] font-bold text-slate-500">เกรดเฉลี่ยเป้าหมาย (Target GPA)</div>
            <div className="text-xl font-black text-pink-600 mt-0.5">
              {userProfile.targetGpa.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="text-[10px] font-bold text-slate-500">อาชีพในฝัน</div>
            <div className="text-base font-black text-purple-700 mt-0.5 truncate">
              {userProfile.dreamCareer || 'ยังไม่ได้ระบุ'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div className="text-[10px] font-bold text-slate-500">มหาวิทยาลัยอันดับ 1</div>
            <div className="text-xs font-black text-indigo-700 mt-0.5 truncate">
              {userProfile.dreamUniversities?.[0]?.faculty || 'ยังไม่ได้ระบุ'}
            </div>
          </div>
        </div>
      </div>

      {/* Grade Thresholds Settings (Preserved from original) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-600" />
            <span>เกณฑ์การตัดเกรด (Grade Thresholds)</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowThresholds(!showThresholds)}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            {showThresholds ? 'ซ่อนเกณฑ์' : 'ดู / ปรับแต่งเกณฑ์'}
          </button>
        </div>

        {showThresholds && (
          <div className="pt-2 space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              มาตรฐานกระทรวงศึกษาธิการ: เกรด 4 (80-100), 3.5 (75-79), 3 (70-74), 2.5 (65-69), 2 (60-64), 1.5 (55-59), 1 (50-54), 0 (0-49)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.entries(gradeThresholds)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([grade, minScore]) => (
                  <div key={grade} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-700">เกรด {grade}:</span>
                    <span className="font-black text-pink-600">≥ {minScore} คะแนน</span>
                  </div>
                ))}
            </div>
            <button
              type="button"
              onClick={resetGradeThresholds}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
            >
              คืนค่าเกณฑ์มาตรฐาน
            </button>
          </div>
        )}
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>สำรองและกู้คืนข้อมูล (Backup & Restore)</span>
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          ข้อมูลทั้งหมดถูกจัดเก็บในเบราว์เซอร์ของคุณ คุณสามารถดาวน์โหลดไฟล์ JSON สำรองไว้ได้ทุกเมื่อ
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={exportJSON}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกข้อมูล (Export JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>นำเข้าข้อมูล (Import JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น?')) {
                resetToDefault();
              }
            }}
            className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูลเริ่มต้น</span>
          </button>
        </div>
      </div>

      {/* Logout / Switch Account */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={logout}
          className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ / สลับบัญชีผู้ใช้</span>
        </button>
      </div>
    </div>
  );
};

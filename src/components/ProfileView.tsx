import React, { useState, useEffect, useRef } from 'react';
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
  Palette,
  Check,
  Sliders,
  Camera,
  Plus,
  Users,
  Trash2,
  Compass,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';
import { PRESET_THEME_COLORS } from '../utils/themeUtils';
import { CUTE_AVATARS } from '../data/defaultData';
import { GradeLevel, NumericGrade, UserProfile } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { EditProfileModal } from './EditProfileModal';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    academicYear,
    setAcademicYear,
    savedProfiles,
    switchProfile,
    deleteProfile,
    logout,
    resetToDefault,
    exportJSON,
    importJSON,
    gradeThresholds,
    updateGradeThresholds,
    resetGradeThresholds,
  } = useGrade();

  const { themeColor, setThemeColor, openThemeModal } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'edit' | 'switch'>('edit');

  const [fullName, setFullName] = useState(userProfile.fullName);
  const [nickname, setNickname] = useState(userProfile.nickname || '');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(userProfile.gradeLevel || 'ม.5');
  const [room, setRoom] = useState(userProfile.room || '1');
  const [studentNumber, setStudentNumber] = useState(userProfile.studentNumber || '17');
  const [schoolName, setSchoolName] = useState(userProfile.schoolName || 'โรงเรียนพิชัย');
  const [avatar, setAvatar] = useState(userProfile.avatar || '🌸');
  const [selectedYear, setSelectedYear] = useState<number>(academicYear?.year || userProfile.academicYear || 2568);
  const [targetGpa, setTargetGpa] = useState<NumericGrade>(userProfile.targetGpa || 3.5);
  const [dreamCareer, setDreamCareer] = useState(userProfile.dreamCareer || 'สัตวแพทย์');
  const [showThresholds, setShowThresholds] = useState(false);

  // Sync state whenever userProfile or academicYear changes
  useEffect(() => {
    setFullName(userProfile.fullName);
    setNickname(userProfile.nickname || '');
    setGradeLevel(userProfile.gradeLevel || 'ม.5');
    setRoom(userProfile.room || '1');
    setStudentNumber(userProfile.studentNumber || '17');
    setSchoolName(userProfile.schoolName || 'โรงเรียนพิชัย');
    setAvatar(userProfile.avatar || '🌸');
    setSelectedYear(academicYear?.year || userProfile.academicYear || 2568);
    setTargetGpa(userProfile.targetGpa || 3.5);
    setDreamCareer(userProfile.dreamCareer || 'สัตวแพทย์');
  }, [userProfile, academicYear]);

  // File refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim() || 'นักเรียน';
    const trimmedClass = `${gradeLevel}/${room.trim() || '1'}`;
    const parsedYear = Number(selectedYear) || 2568;

    updateUserProfile({
      fullName: trimmedName,
      nickname: nickname.trim(),
      gradeLevel,
      room: room.trim(),
      studentNumber: studentNumber.trim(),
      studentClass: trimmedClass,
      schoolName: schoolName.trim(),
      academicYear: parsedYear,
      avatar,
      targetGpa,
      dreamCareer: dreamCareer.trim(),
    });

    setAcademicYear({
      year: parsedYear,
      studentName: trimmedName,
      studentClass: trimmedClass,
      schoolName: schoolName.trim(),
    });

    setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 4MB ค่ะ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
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

  const currentYearNum = academicYear?.year || userProfile.academicYear || 2568;

  return (
    <div className="space-y-6 pb-12 text-left max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl p-5 sm:p-6 border border-pink-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-white shadow-md border-3 border-pink-300 flex items-center justify-center overflow-hidden">
              <AvatarDisplay
                avatar={userProfile.avatar || '🌸'}
                size="2xl"
                editable
                onEdit={() => setIsEditing(true)}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setModalTab('edit');
                setIsModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-xs hover:bg-pink-700 transition-transform active:scale-95 cursor-pointer border-2 border-white"
              title="เปลี่ยนรูปโปรไฟล์"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {userProfile.fullName}
              </h2>
              {userProfile.nickname && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  น้อง{userProfile.nickname}
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                {userProfile.gradeLevel || 'ม.ปลาย'}
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
                <span>ปีการศึกษา {currentYearNum}</span>
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1 pt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{userProfile.email || 'std27017@phichai.ac.th'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setModalTab('switch');
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="สลับหรือเพิ่มโปรไฟล์นักเรียน"
            >
              <Users className="w-3.5 h-3.5" />
              <span>สลับโปรไฟล์ ({savedProfiles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-pink-500" />
              <span>{isEditing ? 'ปิดฟอร์มแก้ไข' : 'แก้ไขโปรไฟล์'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Form (Collapse / Expand) */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-200 shadow-xs space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-pink-500" />
              <span>แก้ไขข้อมูลและรูปโปรไฟล์นักเรียน</span>
            </h3>
            <span className="text-[11px] text-slate-400">บันทึกข้อมูลในเครื่องทันที</span>
          </div>

          {/* Avatar selector & Upload */}
          <div className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                เปลี่ยนรูปโปรไฟล์ / ตัวการ์ตูน
              </label>
              <button
                type="button"
                onClick={() => avatarUploadRef.current?.click()}
                className="px-3 py-1 bg-white hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-full border border-pink-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>อัปโหลดรูปของตัวเอง</span>
              </button>
              <input
                type="file"
                ref={avatarUploadRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-2xs border-2 border-pink-300 flex items-center justify-center overflow-hidden shrink-0">
                <AvatarDisplay avatar={avatar} size="xl" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/90 rounded-xl border border-pink-100">
                  {CUTE_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                        avatar === av
                          ? 'bg-pink-500 text-white scale-110 shadow-xs ring-2 ring-pink-300'
                          : 'hover:bg-pink-50 text-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'ปวช.', 'มหาวิทยาลัย'].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ห้อง</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เลขที่</label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 text-center"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ปีการศึกษา (พ.ศ.)</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เป้าหมายเกรดเฉลี่ย (Target GPA)
              </label>
              <select
                value={targetGpa}
                onChange={(e) => setTargetGpa(Number(e.target.value) as NumericGrade)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value={4.0}>เกรด 4.00 (ยอดเยี่ยม 🌟)</option>
                <option value={3.5}>เกรด 3.50 (เกียรตินิยม 💖)</option>
                <option value={3.0}>เกรด 3.00 (ดีมาก ✨)</option>
                <option value={2.5}>เกรด 2.50 (ผ่านเกณฑ์ดี)</option>
                <option value={2.0}>เกรด 2.00 (มาตรฐาน)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">อาชีพในฝัน</label>
              <input
                type="text"
                value={dreamCareer}
                onChange={(e) => setDreamCareer(e.target.value)}
                placeholder="เช่น สัตวแพทย์, วิศวะคอมพิวเตอร์"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xs hover:bg-pink-700 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      )}

      {/* Switch Profile Section Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>สลับโปรไฟล์นักเรียน (Switch Student Profile)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {savedProfiles.length} โปรไฟล์
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                แตะเพื่อสลับไปใช้บัญชีนักเรียนอื่น หรือเพิ่มโปรไฟล์ใหม่สำหรับพี่น้อง/เพื่อน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalTab('switch');
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>จัดการโปรไฟล์</span>
          </button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {savedProfiles.map((p) => {
            const isActive = p.id === userProfile.id;
            return (
              <div
                key={p.id}
                onClick={() => switchProfile(p.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-400 ring-2 ring-pink-200 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-pink-200 flex items-center justify-center overflow-hidden shrink-0">
                    <AvatarDisplay avatar={p.avatar} size="md" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {p.fullName}
                      </span>
                      {p.nickname && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 shrink-0">
                          {p.nickname}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      ชั้น {p.studentClass || `${p.gradeLevel}/${p.room || '1'}`} • {p.schoolName || 'โรงเรียน'}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {isActive ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      <span>ใช้งานอยู่</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        switchProfile(p.id);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-pink-600 text-white text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                    >
                      สลับใช้
                    </button>
                  )}

                  {!isActive && savedProfiles.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`ลบโปรไฟล์ "${p.fullName}"?`)) {
                          deleteProfile(p.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="ลบโปรไฟล์"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
              {(userProfile.targetGpa || 3.5).toFixed(2)}
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

      {/* Theme Color Settings Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>ธีมสีของแอปพลิเคชัน (Theme Color)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {themeColor.toUpperCase()}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                แตะเพื่อเปลี่ยนเฉดสีของปุ่ม เส้นขอบ และการเน้นข้อความได้ทันที
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openThemeModal}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">วงล้อสี / โค้ด HEX</span>
          </button>
        </div>

        {/* Quick select theme chips */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
          {PRESET_THEME_COLORS.map((preset) => {
            const isSelected = themeColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setThemeColor(preset.hex)}
                className={`p-2 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-102 font-bold'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
                title={preset.name}
              >
                <div
                  className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-white shadow-2xs text-xs font-bold"
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected ? <Check className="w-3 h-3 drop-shadow" /> : preset.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] truncate font-bold leading-tight">
                    {preset.name.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Thresholds Settings */}
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
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
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

      {/* Edit / Switch Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  );
};

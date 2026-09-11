import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  School,
  Calendar,
  Save,
  X,
  Sparkles,
  Camera,
  Upload,
  RotateCcw,
  Plus,
  Check,
  Trash2,
  Users,
  Compass,
  GraduationCap,
  Target,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { AvatarDisplay } from './AvatarDisplay';
import { GradeLevel, NumericGrade, UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'edit' | 'switch';
}

const CUTE_EMOJI_AVATARS = [
  '🌸', '🐰', '🐱', '🐻', '🦊', '🦄', '🐼', '🐶', '🐨', '🐧', '🐯', '🦁',
  '🎓', '👩‍🎓', '🧑‍🎓', '⭐', '✨', '🍀', '🌷', '🦋', '🧁', '🎨', '🚀', '💖'
];

const GRADE_LEVEL_OPTIONS: GradeLevel[] = [
  'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'ปวช.', 'มหาวิทยาลัย'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'edit',
}) => {
  const {
    userProfile,
    updateUserProfile,
    academicYear,
    savedProfiles,
    switchProfile,
    createProfile,
    deleteProfile,
  } = useGrade();

  const [activeTab, setActiveTab] = useState<'edit' | 'switch'>(initialTab);

  // Edit form state
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [nickname, setNickname] = useState(userProfile.nickname || '');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(userProfile.gradeLevel || 'ม.5');
  const [room, setRoom] = useState(userProfile.room || '1');
  const [studentNumber, setStudentNumber] = useState(userProfile.studentNumber || '17');
  const [schoolName, setSchoolName] = useState(userProfile.schoolName || 'โรงเรียนพิชัย');
  const [year, setYear] = useState<number>(academicYear?.year || userProfile.academicYear || 2568);
  const [avatar, setAvatar] = useState(userProfile.avatar || '🌸');
  const [targetGpa, setTargetGpa] = useState<NumericGrade>(userProfile.targetGpa || 3.5);
  const [dreamCareer, setDreamCareer] = useState(userProfile.dreamCareer || 'สัตวแพทย์');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New profile creation form
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState<GradeLevel>('ม.4');
  const [newRoom, setNewRoom] = useState('1');
  const [newSchool, setNewSchool] = useState('โรงเรียนพิชัย');
  const [newAvatar, setNewAvatar] = useState('🐰');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newProfileFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(userProfile.fullName);
      setNickname(userProfile.nickname || '');
      setGradeLevel(userProfile.gradeLevel || 'ม.5');
      setRoom(userProfile.room || '1');
      setStudentNumber(userProfile.studentNumber || '17');
      setSchoolName(userProfile.schoolName || 'โรงเรียนพิชัย');
      setYear(academicYear?.year || userProfile.academicYear || 2568);
      setAvatar(userProfile.avatar || '🌸');
      setTargetGpa(userProfile.targetGpa || 3.5);
      setDreamCareer(userProfile.dreamCareer || 'สัตวแพทย์');
      setSavedSuccess(false);
      setIsCreatingNew(false);
      setActiveTab(initialTab);
    }
  }, [isOpen, userProfile, academicYear, initialTab]);

  if (!isOpen) return null;

  // Handle image upload as avatar
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 4MB ค่ะ กรุณาเลือกรูปขนาดเล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setter(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim() || 'นักเรียน';
    const trimmedClass = `${gradeLevel}/${room.trim() || '1'}`;

    updateUserProfile({
      fullName: trimmedName,
      nickname: nickname.trim(),
      gradeLevel,
      room: room.trim(),
      studentNumber: studentNumber.trim(),
      studentClass: trimmedClass,
      schoolName: schoolName.trim() || 'โรงเรียน',
      academicYear: Number(year) || 2568,
      avatar,
      targetGpa,
      dreamCareer: dreamCareer.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleCreateNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    createProfile({
      fullName: newFullName.trim(),
      nickname: newNickname.trim(),
      gradeLevel: newGradeLevel,
      room: newRoom.trim() || '1',
      studentClass: `${newGradeLevel}/${newRoom.trim() || '1'}`,
      schoolName: newSchool.trim() || 'โรงเรียน',
      avatar: newAvatar,
      academicYear: Number(year) || 2568,
      targetGpa: 3.5,
      dreamCareer: 'ยังไม่ได้ระบุ',
    });

    setIsCreatingNew(false);
    setNewFullName('');
    setNewNickname('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleSwitchProfile = (p: UserProfile) => {
    switchProfile(p.id);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleDeleteProfile = (e: React.MouseEvent, p: UserProfile) => {
    e.stopPropagation();
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์ "${p.fullName}" ออกจากรายการ?`)) {
      deleteProfile(p.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-pink-200/80 space-y-4 my-auto text-left max-h-[92vh] flex flex-col box-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>จัดการโปรไฟล์นักเรียน</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  MyGrade
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                แก้ไขข้อมูลส่วนตัว เปลี่ยนรูปโปรไฟล์ หรือสลับบัญชีนักเรียน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100/80 p-1 rounded-2xl shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-pink-500" />
            <span>แก้ไขโปรไฟล์ปัจจุบัน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'switch'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>สลับโปรไฟล์ ({savedProfiles.length})</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200 animate-fade-in flex items-center justify-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>บันทึกการเปลี่ยนแปลงโปรไฟล์เรียบร้อยแล้วค่ะ! ✨</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'edit' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Selector & Photo Upload */}
              <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  รูปโปรไฟล์ & ตัวการ์ตูน
                </label>

                <div className="flex items-center gap-4">
                  {/* Current Avatar Preview */}
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md border-2 border-pink-300 flex items-center justify-center overflow-hidden">
                      <AvatarDisplay avatar={avatar} size="xl" />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-xs hover:bg-pink-700 transition-transform active:scale-95 cursor-pointer"
                      title="อัปโหลดรูปภาพของตัวเอง"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>อัปโหลดรูปของฉัน</span>
                      </button>

                      {avatar.startsWith('data:image') && (
                        <button
                          type="button"
                          onClick={() => setAvatar('🌸')}
                          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>ใช้ไอคอนแทน</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      เลือกรูปถ่ายจริงจากเครื่อง หรือแตะเลือกไอคอนการ์ตูนด้านล่างได้เลยค่ะ
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleImageUpload(e, setAvatar)}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Cute preset avatars */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    ไอคอนการ์ตูนน่ารัก:
                  </span>
                  <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 rounded-xl border border-pink-100/80">
                    {CUTE_EMOJI_AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                          avatar === av
                            ? 'bg-pink-500 text-white scale-110 shadow-xs ring-2 ring-pink-300'
                            : 'hover:bg-pink-50 text-slate-700 hover:scale-105'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น น.ส.ชญาภา สุขสมบูรณ์"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-sm font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น น้ำหวาน"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Class, Room, Student Number */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-xs font-bold text-slate-800 bg-white"
                  >
                    {GRADE_LEVEL_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
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
                    placeholder="1"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-xs font-semibold text-slate-800 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เลขที่</label>
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="17"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-xs font-semibold text-slate-800 text-center"
                  />
                </div>
              </div>

              {/* School and Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">โรงเรียน</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="โรงเรียนพิชัย"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-sm font-medium text-slate-800"
                    />
                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ปีการศึกษา (พ.ศ.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      placeholder="2568"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-sm font-medium text-slate-800"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Target GPA & Dream Career */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Target className="w-4 h-4 text-pink-500" />
                  <span>เป้าหมายการเรียน & อาชีพในฝัน</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      เป้าหมายเกรดเฉลี่ย (Target GPA)
                    </label>
                    <select
                      value={targetGpa}
                      onChange={(e) => setTargetGpa(Number(e.target.value) as NumericGrade)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value={4.0}>เกรด 4.00 (ยอดเยี่ยมสูงสุด 🌟)</option>
                      <option value={3.5}>เกรด 3.50 (เกียรตินิยม 💖)</option>
                      <option value={3.0}>เกรด 3.00 (ดีมาก ✨)</option>
                      <option value={2.5}>เกรด 2.50 (ผ่านเกณฑ์ดี 👍)</option>
                      <option value={2.0}>เกรด 2.00 (มาตรฐาน)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      อาชีพในฝัน (Dream Career)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dreamCareer}
                        onChange={(e) => setDreamCareer(e.target.value)}
                        placeholder="เช่น สัตวแพทย์, วิศวกรซอฟต์แวร์"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                      />
                      <Compass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-full shadow-md shadow-pink-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          ) : (
            /* Switch Profile Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  เลือกโปรไฟล์นักเรียนที่ต้องการใช้งาน ({savedProfiles.length} บัญชี)
                </span>
                {!isCreatingNew && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มโปรไฟล์ใหม่</span>
                  </button>
                )}
              </div>

              {/* Profiles List */}
              <div className="space-y-2.5">
                {savedProfiles.map((p) => {
                  const isActive = p.id === userProfile.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSwitchProfile(p)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-400 ring-2 ring-pink-200 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-pink-200 flex items-center justify-center overflow-hidden shrink-0">
                          <AvatarDisplay avatar={p.avatar} size="lg" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {p.fullName}
                            </span>
                            {p.nickname && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 shrink-0">
                                น้อง{p.nickname}
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shrink-0 flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                <span>ใช้งานอยู่</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            ชั้น {p.studentClass || `${p.gradeLevel}/${p.room || '1'}`} • {p.schoolName || 'โรงเรียน'}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>เป้าหมาย GPA: {p.targetGpa || 3.5}</span>
                            {p.dreamCareer && <span>• อาชีพ: {p.dreamCareer}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="text-xs font-bold text-pink-600 bg-white px-3 py-1.5 rounded-full border border-pink-200 shadow-2xs">
                            กำลังใช้งาน
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchProfile(p)}
                            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-pink-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            สลับใช้บัญชีนี้
                          </button>
                        )}

                        {!isActive && savedProfiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProfile(e, p)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="ลบโปรไฟล์นี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create New Profile Form Drawer / Section */}
              {isCreatingNew && (
                <form
                  onSubmit={handleCreateNewProfile}
                  className="p-4 bg-pink-50/70 rounded-2xl border border-pink-200 space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-pink-200/60 pb-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-pink-600" />
                      <span>สร้างโปรไฟล์นักเรียนใหม่</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      ยกเลิก
                    </button>
                  </div>

                  {/* Avatar Picker for new profile */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-pink-200 flex items-center justify-center shrink-0">
                      <AvatarDisplay avatar={newAvatar} size="lg" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {['🐰', '🌸', '🐱', '🐼', '🦊', '⭐', '🎓', '👩‍🎓'].map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setNewAvatar(av)}
                            className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center cursor-pointer ${
                              newAvatar === av
                                ? 'bg-pink-500 text-white ring-2 ring-pink-300'
                                : 'bg-white hover:bg-pink-100 text-slate-700'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => newProfileFileInputRef.current?.click()}
                        className="text-[11px] text-pink-600 font-bold hover:underline inline-block cursor-pointer"
                      >
                        + อัปโหลดรูปภาพตัวเอง
                      </button>
                      <input
                        type="file"
                        ref={newProfileFileInputRef}
                        onChange={(e) => handleImageUpload(e, setNewAvatar)}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="ชื่อนักเรียน"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        ชื่อเล่น
                      </label>
                      <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="เช่น น้องพลอย"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        ระดับชั้น
                      </label>
                      <select
                        value={newGradeLevel}
                        onChange={(e) => setNewGradeLevel(e.target.value as GradeLevel)}
                        className="w-full px-2.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                      >
                        {GRADE_LEVEL_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        ห้อง
                      </label>
                      <input
                        type="text"
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="1"
                        className="w-full px-2.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        โรงเรียน
                      </label>
                      <input
                        type="text"
                        value={newSchool}
                        onChange={(e) => setNewSchool(e.target.value)}
                        placeholder="โรงเรียน"
                        className="w-full px-2.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-full shadow-xs cursor-pointer"
                    >
                      สร้างและสลับใช้ทันที ✨
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

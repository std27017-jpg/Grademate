import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  User,
  School,
  Calendar,
  Save,
  CheckCircle,
  Palette,
  Sparkles,
  Sliders,
  Award,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';
import { NUMERIC_GRADES, GRADE_META_LIST } from '../utils/gradeCalculations';
import { CustomGradeScale, NumericGrade } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    academicYear,
    setAcademicYear,
    gradeThresholds,
    updateGradeThresholds,
    resetGradeThresholds,
    resetToDefault,
    exportJSON,
    importJSON,
  } = useGrade();
  const { themeColor, setThemeColor, openThemeModal } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'gradescale' | 'backup'>('profile');

  const [profileForm, setProfileForm] = useState({
    year: academicYear.year.toString(),
    studentName: academicYear.studentName,
    studentClass: academicYear.studentClass,
    schoolName: academicYear.schoolName,
  });

  // Local state for grade thresholds
  const [thresholdsForm, setThresholdsForm] = useState<CustomGradeScale>(gradeThresholds);

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setProfileForm({
        year: academicYear.year.toString(),
        studentName: academicYear.studentName,
        studentClass: academicYear.studentClass,
        schoolName: academicYear.schoolName,
      });
      setThresholdsForm(gradeThresholds);
      setMessage('');
    }
  }, [isOpen, academicYear, gradeThresholds]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicYear({
      year: parseInt(profileForm.year, 10) || 2569,
      studentName: profileForm.studentName.trim() || 'นักเรียน',
      studentClass: profileForm.studentClass.trim() || 'ม.5/1',
      schoolName: profileForm.schoolName.trim() || 'โรงเรียน',
    });
    setMessage('บันทึกข้อมูลนักเรียนเรียบร้อยแล้ว ✅');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveGradeThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateGradeThresholds(thresholdsForm);
    setMessage('บันทึกเกณฑ์คะแนนเกรดเรียบร้อย และคำนวณใหม่ทันที! ✅');
    setTimeout(() => setMessage(''), 3500);
  };

  const handleResetThresholds = () => {
    if (window.confirm('ต้องการรีเซ็ตเกณฑ์คะแนนกลับเป็นค่ามาตรฐาน (80, 75, 70, 65, 60, 55, 50) หรือไม่?')) {
      resetGradeThresholds();
      setThresholdsForm({
        4: 80,
        3.5: 75,
        3: 70,
        2.5: 65,
        2: 60,
        1.5: 55,
        1: 50,
        0: 0,
      });
      setMessage('รีเซ็ตเกณฑ์เกรดมาตรฐานเรียบร้อย ✅');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mygrade_backup_${profileForm.year}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          setMessage('นำเข้าข้อมูลสำเร็จ ✅');
          setTimeout(() => {
            setMessage('');
            onClose();
          }, 1500);
        } else {
          setMessage('❌ ไฟล์ข้อมูลไม่ถูกต้อง');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetApp = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามหลักสูตรตัวอย่างหรือไม่?')) {
      resetToDefault();
      setMessage('รีเซ็ตข้อมูลตัวอย่างเรียบร้อย ✅');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header with MyGrade branding */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎓</span>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">
                ตั้งค่าระบบ MyGrade
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ผู้ช่วยวางแผนคะแนนและผลการเรียนของคุณ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-800 text-xs font-bold text-center border border-indigo-200">
            {message}
          </div>
        )}

        {/* Setting Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👤 ข้อมูลนักเรียน
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gradescale')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'gradescale'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 เกณฑ์เกรด (0–4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'backup'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💾 สำรองข้อมูล
          </button>
        </div>

        {/* TAB 1: Student Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100">
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                ชื่อ-นามสกุล นักเรียน
              </label>
              <input
                type="text"
                required
                value={profileForm.studentName}
                onChange={(e) => setProfileForm({ ...profileForm, studentName: e.target.value })}
                placeholder="กรอกชื่อ-นามสกุล ของคุณ"
                className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ปีการศึกษา (พ.ศ.)
                </label>
                <input
                  type="number"
                  required
                  value={profileForm.year}
                  onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ระดับชั้น / ห้อง
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.studentClass}
                  onChange={(e) => setProfileForm({ ...profileForm, studentClass: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อโรงเรียน / สถาบัน
              </label>
              <input
                type="text"
                required
                value={profileForm.schoolName}
                onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              บันทึกข้อมูลนักเรียน
            </button>
          </form>
        )}

        {/* TAB 2: Grade Scale Settings (เกณฑ์เกรด 0–4) */}
        {activeTab === 'gradescale' && (
          <form onSubmit={handleSaveGradeThresholds} className="space-y-4 animate-fade-in">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                เกณฑ์การตัดเกรด (ระบบตัวเลข 0–4 เต็ม 100 คะแนน)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                กำหนดคะแนนขั้นต่ำของแต่ละเกรด ระบบจะคำนวณเกรดและเกรดเฉลี่ยใหม่ทั้งหมดโดยอัตโนมัติ
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {([4, 3.5, 3, 2.5, 2, 1.5, 1] as NumericGrade[]).map((grade) => {
                const meta = GRADE_META_LIST.find((m) => m.grade === grade);
                return (
                  <div
                    key={grade}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black border ${meta?.badgeClass}`}>
                        {meta?.label}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        คะแนนขั้นต่ำ:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        required
                        value={thresholdsForm[grade]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setThresholdsForm((prev) => ({
                            ...prev,
                            [grade]: val,
                          }));
                        }}
                        className="w-16 px-2.5 py-1 text-center font-bold text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-400 font-medium">แต้ม</span>
                    </div>
                  </div>
                );
              })}

              {/* Grade 0 notice */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/50 border border-rose-200/80">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-black border bg-rose-100 text-rose-800 border-rose-300">
                    เกรด 0
                  </span>
                  <span className="text-xs text-rose-700 font-medium">
                    คะแนนต่ำกว่า:
                  </span>
                </div>
                <span className="text-xs font-black text-rose-700 pr-2">
                  &lt; {thresholdsForm[1]} แต้ม
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetThresholds}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                คืนค่ามาตรฐาน
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                บันทึกเกณฑ์เกรด
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Backup & Appearance */}
        {activeTab === 'backup' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                ปรับแต่งสีธีม
              </h4>
              <p className="text-xs text-slate-500 mb-2">เลือกโทนสีของแอปพลิเคชัน</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openThemeModal();
                }}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  เปิดวงล้อสีและเลือกชุดสี (Theme Customizer)
                </span>
                <span
                  className="w-4 h-4 rounded-full border border-white shadow-2xs"
                  style={{ backgroundColor: themeColor }}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                ส่งออก & นำเข้าไฟล์สำรองข้อมูล (JSON)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
                >
                  <Download className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="block text-xs font-black text-slate-800">ส่งออกข้อมูล</span>
                  <span className="text-[10px] text-slate-400">ดาวน์โหลดเป็นไฟล์ .json</span>
                </button>

                <label className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group">
                  <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="block text-xs font-black text-slate-800">นำเข้าข้อมูล</span>
                  <span className="text-[10px] text-slate-400">กู้คืนจากไฟล์สำรอง</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-500 mb-1">
                รีเซ็ตข้อมูลระบบ
              </h4>
              <p className="text-xs text-slate-500 mb-2">
                ล้างข้อมูลวิชา คะแนน งาน และข้อสอบทั้งหมดกลับเป็นข้อมูลเริ่มต้น
              </p>
              <button
                type="button"
                onClick={handleResetApp}
                className="w-full py-2.5 px-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                รีเซ็ตข้อมูลเป็นค่าเริ่มต้นทั้งหมด
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

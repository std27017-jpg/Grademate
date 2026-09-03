import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  User,
  School,
  Calendar,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    academicYear,
    setAcademicYear,
    resetToDefault,
    exportJSON,
    importJSON,
  } = useGrade();

  const [form, setForm] = useState({
    year: academicYear.year.toString(),
    studentName: academicYear.studentName,
    studentClass: academicYear.studentClass,
    schoolName: academicYear.schoolName,
  });

  const [message, setMessage] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        year: academicYear.year.toString(),
        studentName: academicYear.studentName,
        studentClass: academicYear.studentClass,
        schoolName: academicYear.schoolName,
      });
      setMessage('');
    }
  }, [isOpen, academicYear]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicYear({
      year: parseInt(form.year, 10) || 2569,
      studentName: form.studentName.trim() || 'นักเรียน',
      studentClass: form.studentClass.trim() || 'ม.5/1',
      schoolName: form.schoolName.trim() || 'โรงเรียน',
    });
    setMessage('บันทึกข้อมูลเรียบร้อยแล้ว ✅');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grademate_backup_${form.year}.json`;
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

  const handleReset = () => {
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
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-xl">
              ตั้งค่าโปรไฟล์ & สำรองข้อมูล
            </h3>
            <p className="text-xs text-slate-500">
              GradeMate — 2 ภาคเรียน (เทอม 1 & เทอม 2)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-800 text-xs font-bold text-center border border-indigo-200">
            {message}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              ข้อมูลนักเรียน & ปีการศึกษา
            </h4>
            <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
              แก้ไขชื่อได้ตลอดเวลา
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100">
            <label className="block text-xs font-bold text-indigo-950 mb-1">
              ชื่อ-นามสกุล นักเรียน (แสดงในแอป & สรุปผลการเรียน)
            </label>
            <input
              type="text"
              required
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              placeholder="กรอกชื่อ-นามสกุล ของคุณ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ระดับชั้น / ห้อง
              </label>
              <input
                type="text"
                required
                value={form.studentClass}
                onChange={(e) => setForm({ ...form, studentClass: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
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
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกข้อมูลส่วนตัว</span>
          </button>
        </form>

        {/* Backup & Restore */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            การจัดการข้อมูล & สำรองไฟล์
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>ดาวน์โหลด Backup JSON</span>
            </button>

            <label className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>นำเข้าไฟล์ JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2.5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูลเป็นค่าเริ่มต้น (เทอม 1 & 2 ตัวอย่าง)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

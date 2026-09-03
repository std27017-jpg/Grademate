import React, { useState, useEffect } from 'react';
import { User, School, Calendar, Save, X, Sparkles, BookOpen } from 'lucide-react';
import { useGrade } from '../context/GradeContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { academicYear, setAcademicYear } = useGrade();

  const [studentName, setStudentName] = useState(academicYear.studentName);
  const [studentClass, setStudentClass] = useState(academicYear.studentClass);
  const [schoolName, setSchoolName] = useState(academicYear.schoolName);
  const [year, setYear] = useState(academicYear.year.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStudentName(academicYear.studentName);
      setStudentClass(academicYear.studentClass);
      setSchoolName(academicYear.schoolName);
      setYear(academicYear.year.toString());
      setSavedSuccess(false);
    }
  }, [isOpen, academicYear]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = studentName.trim() || 'นักเรียน';
    const trimmedClass = studentClass.trim() || 'ม.5/1';
    const trimmedSchool = schoolName.trim() || 'โรงเรียน';
    const parsedYear = parseInt(year, 10) || 2569;

    setAcademicYear({
      studentName: trimmedName,
      studentClass: trimmedClass,
      schoolName: trimmedSchool,
      year: parsedYear,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">แก้ไขชื่อ & โปรไฟล์</h3>
              <p className="text-xs text-slate-500">ข้อมูลนี้จะแสดงในหน้าหลัก ตารางสอบ และใบสรุปเกรด</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200 animate-fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>บันทึกชื่อและข้อมูลสำเร็จแล้ว!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ชื่อ-นามสกุล นักเรียน <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="เช่น นายสมชาย ใจดี หรือชื่อ-สกุลของคุณ"
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold text-slate-800 bg-indigo-50/20"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">สามารถพิมพ์ชื่อจริง ชื่อเล่น หรือนามแฝงได้ตามต้องการ</p>
          </div>

          {/* Student Class & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ระดับชั้น / ห้อง
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="เช่น ม.5/1 หรือ ม.4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ปีการศึกษา (พ.ศ.)
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2569"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          {/* School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ชื่อโรงเรียน / สถาบันการศึกษา
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="เช่น โรงเรียนพิชัย หรือสถาบันของคุณ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-slate-800"
            />
          </div>

          {/* Quick presets for class */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">เลือกระดับชั้นด่วน:</span>
            <div className="flex flex-wrap gap-1.5">
              {['ม.1', 'ม.2', 'ม.3', 'ม.4/1', 'ม.5/1', 'ม.6/1', 'ปวช.', 'มหาวิทยาลัย'].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setStudentClass(cls)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    studentClass === cls
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกชื่อ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

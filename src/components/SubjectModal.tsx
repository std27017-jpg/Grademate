import React, { useState, useEffect } from 'react';
import { Subject, SemesterId } from '../types';
import { useGrade } from '../context/GradeContext';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  editingSubject,
}) => {
  const { currentSemester, addSubject, updateSubject } = useGrade();

  const [form, setForm] = useState({
    semesterId: currentSemester,
    name: '',
    code: '',
    credits: '1.5',
    targetGrade: '4.0',
    targetScore: '80',
    teacherName: '',
    classroom: '',
  });

  useEffect(() => {
    if (editingSubject) {
      setForm({
        semesterId: editingSubject.semesterId,
        name: editingSubject.name,
        code: editingSubject.code,
        credits: editingSubject.credits.toString(),
        targetGrade: editingSubject.targetGrade.toString(),
        targetScore: (editingSubject.targetScore || 80).toString(),
        teacherName: editingSubject.teacherName || '',
        classroom: editingSubject.classroom || '',
      });
    } else {
      setForm({
        semesterId: currentSemester,
        name: '',
        code: '',
        credits: '1.5',
        targetGrade: '4.0',
        targetScore: '80',
        teacherName: '',
        classroom: '',
      });
    }
  }, [editingSubject, currentSemester, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    const creditsNum = parseFloat(form.credits) || 1.0;
    const targetGradeNum = parseFloat(form.targetGrade) || 4.0;
    const targetScoreNum = parseFloat(form.targetScore) || 80;

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        semesterId: form.semesterId,
        name: form.name.trim(),
        code: form.code.trim(),
        credits: creditsNum,
        targetGrade: targetGradeNum,
        targetScore: targetScoreNum,
        teacherName: form.teacherName.trim() || undefined,
        classroom: form.classroom.trim() || undefined,
      });
    } else {
      addSubject({
        semesterId: form.semesterId,
        name: form.name.trim(),
        code: form.code.trim(),
        credits: creditsNum,
        color: 'indigo',
        icon: 'BookOpen',
        targetGrade: targetGradeNum,
        targetScore: targetScoreNum,
        teacherName: form.teacherName.trim() || undefined,
        classroom: form.classroom.trim() || undefined,
        periods: {
          preMidterm: {
            key: 'preMidterm',
            label: 'คะแนนเก็บก่อนกลางภาค',
            shortLabel: 'ก่อนกลางภาค',
            weight: 30,
            items: [],
          },
          midterm: {
            key: 'midterm',
            label: 'คะแนนสอบกลางภาค',
            shortLabel: 'กลางภาค',
            weight: 20,
            items: [],
          },
          postMidterm: {
            key: 'postMidterm',
            label: 'คะแนนเก็บหลังกลางภาค',
            shortLabel: 'หลังกลางภาค',
            weight: 30,
            items: [],
          },
          final: {
            key: 'final',
            label: 'คะแนนสอบปลายภาค',
            shortLabel: 'ปลายภาค',
            weight: 20,
            items: [],
          },
        },
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {editingSubject ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชาใหม่'}
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดหน่วยกิตและเป้าหมายเกรด
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ภาคเรียน *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, semesterId: 'term1' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.semesterId === 'term1'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                📘 เทอม 1
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, semesterId: 'term2' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.semesterId === 'term2'
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                📕 เทอม 2
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อวิชา *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น คณิตศาสตร์เพิ่มเติม 3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสวิชา *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ค32201"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-medium uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หน่วยกิต *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="5"
                required
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เป้าหมายเกรด
              </label>
              <select
                value={form.targetGrade}
                onChange={(e) => {
                  const val = e.target.value;
                  const scoreMap: Record<string, string> = {
                    '4.0': '80',
                    '3.5': '75',
                    '3.0': '70',
                    '2.5': '65',
                    '2.0': '60',
                  };
                  setForm({
                    ...form,
                    targetGrade: val,
                    targetScore: scoreMap[val] || '80',
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
              >
                <option value="4.0">เกรด 4 (A)</option>
                <option value="3.5">เกรด 3.5 (B+)</option>
                <option value="3.0">เกรด 3 (B)</option>
                <option value="2.5">เกรด 2.5 (C+)</option>
                <option value="2.0">เกรด 2 (C)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คะแนนเป้าหมาย
              </label>
              <input
                type="number"
                step="1"
                min="50"
                max="100"
                value={form.targetScore}
                onChange={(e) => setForm({ ...form, targetScore: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ครูผู้สอน
              </label>
              <input
                type="text"
                placeholder="เช่น อ.สมเกียรติ ยอดเลข"
                value={form.teacherName}
                onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ห้องเรียน
              </label>
              <input
                type="text"
                placeholder="เช่น ห้อง 324"
                value={form.classroom}
                onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {editingSubject ? 'บันทึกการแก้ไข' : 'สร้างวิชาใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

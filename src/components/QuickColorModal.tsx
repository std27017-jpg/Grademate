import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { useGrade } from '../context/GradeContext';
import { SubjectColorPicker } from './SubjectColorPicker';
import { getSubjectColor } from '../utils/colorUtils';
import { X, Palette, Check } from 'lucide-react';

interface QuickColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export const QuickColorModal: React.FC<QuickColorModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  const { updateSubject } = useGrade();
  const [selectedColor, setSelectedColor] = useState<string>('#6366f1');

  useEffect(() => {
    if (subject) {
      setSelectedColor(getSubjectColor(subject.color));
    }
  }, [subject, isOpen]);

  if (!isOpen || !subject) return null;

  const handleSave = () => {
    updateSubject({
      ...subject,
      color: selectedColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs text-sm font-black transition-colors"
              style={{ backgroundColor: selectedColor }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                ปรับสีประจำวิชา
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {subject.name} ({subject.code})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <SubjectColorPicker
            selectedColor={selectedColor}
            onChange={setSelectedColor}
            subjectName={subject.name}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกสีนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};

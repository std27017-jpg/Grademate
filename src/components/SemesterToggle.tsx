import React from 'react';
import { useGrade } from '../context/GradeContext';
import { SemesterId } from '../types';

interface SemesterToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SemesterToggle: React.FC<SemesterToggleProps> = ({
  size = 'md',
  className = '',
}) => {
  const { currentSemester, setCurrentSemester } = useGrade();

  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div
      id="semester-toggle-container"
      className={`inline-flex items-center p-1.5 bg-slate-100/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-inner ${className}`}
    >
      <button
        id="term1-select-btn"
        type="button"
        onClick={() => setCurrentSemester('term1')}
        className={`relative flex items-center gap-2 font-semibold transition-all duration-200 rounded-xl cursor-pointer ${
          isLg
            ? 'px-6 py-2.5 text-base'
            : isSm
            ? 'px-3 py-1.5 text-xs'
            : 'px-4 py-2 text-sm'
        } ${
          currentSemester === 'term1'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
            : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
        }`}
      >
        <span className="text-lg">📘</span>
        <span>เทอม 1</span>
        {currentSemester === 'term1' && (
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        )}
      </button>

      <button
        id="term2-select-btn"
        type="button"
        onClick={() => setCurrentSemester('term2')}
        className={`relative flex items-center gap-2 font-semibold transition-all duration-200 rounded-xl cursor-pointer ${
          isLg
            ? 'px-6 py-2.5 text-base'
            : isSm
            ? 'px-3 py-1.5 text-xs'
            : 'px-4 py-2 text-sm'
        } ${
          currentSemester === 'term2'
            ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
            : 'text-slate-600 hover:text-rose-700 hover:bg-white/60'
        }`}
      >
        <span className="text-lg">📕</span>
        <span>เทอม 2</span>
        {currentSemester === 'term2' && (
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        )}
      </button>
    </div>
  );
};

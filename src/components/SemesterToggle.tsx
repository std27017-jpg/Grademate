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
      className={`inline-flex items-center p-1 bg-slate-100/95 backdrop-blur-md rounded-full border border-slate-200/80 shadow-inner ${className}`}
    >
      <button
        id="term1-select-btn"
        type="button"
        onClick={() => setCurrentSemester('term1')}
        className={`relative flex items-center gap-1.5 font-bold transition-all duration-200 rounded-full cursor-pointer select-none active:scale-95 ${
          isLg
            ? 'px-5 py-2 text-sm'
            : isSm
            ? 'px-3 py-1 text-xs'
            : 'px-4 py-1.5 text-xs'
        } ${
          currentSemester === 'term1'
            ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm shadow-indigo-500/25 scale-[1.02]'
            : 'text-slate-600 hover:text-indigo-600 hover:bg-white/80'
        }`}
      >
        <span className="text-base">📘</span>
        <span>เทอม 1</span>
        {currentSemester === 'term1' && (
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
        )}
      </button>

      <button
        id="term2-select-btn"
        type="button"
        onClick={() => setCurrentSemester('term2')}
        className={`relative flex items-center gap-1.5 font-bold transition-all duration-200 rounded-full cursor-pointer select-none active:scale-95 ${
          isLg
            ? 'px-5 py-2 text-sm'
            : isSm
            ? 'px-3 py-1 text-xs'
            : 'px-4 py-1.5 text-xs'
        } ${
          currentSemester === 'term2'
            ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-sm shadow-rose-500/25 scale-[1.02]'
            : 'text-slate-600 hover:text-rose-600 hover:bg-white/80'
        }`}
      >
        <span className="text-base">📕</span>
        <span>เทอม 2</span>
        {currentSemester === 'term2' && (
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
        )}
      </button>
    </div>
  );
};

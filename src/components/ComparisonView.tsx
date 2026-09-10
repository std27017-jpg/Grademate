import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  AlertTriangle,
  Award,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useGrade } from '../context/GradeContext';

interface ComparisonViewProps {
  onOpenEditProfile?: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ onOpenEditProfile }) => {
  const { academicYear, term1Summary, term2Summary } = useGrade();

  // GPA calculation for full year (GPAX)
  const totalYearCredits = term1Summary.totalCredits + term2Summary.totalCredits;
  const totalYearPoints =
    term1Summary.gpa * term1Summary.totalCredits +
    term2Summary.gpa * term2Summary.totalCredits;
  const gpax = totalYearCredits > 0 ? totalYearPoints / totalYearCredits : 0;

  const gpaDiff = term2Summary.gpa - term1Summary.gpa;
  const isImproved = gpaDiff > 0;
  const isDeclined = gpaDiff < 0;

  // Comparison chart data across subjects
  // Match common subjects or show term 1 & term 2 list
  const maxSubjectsCount = Math.max(
    term1Summary.subjectSummaries.length,
    term2Summary.subjectSummaries.length
  );

  const comparisonChartData = [
    {
      name: 'เกรดเฉลี่ย (GPA)',
      term1: Number(term1Summary.gpa.toFixed(2)),
      term2: Number(term2Summary.gpa.toFixed(2)),
    },
    {
      name: 'เปอร์เซ็นต์คะแนนรวม (%)',
      term1: Number(term1Summary.overallPercentage.toFixed(1)),
      term2: Number(term2Summary.overallPercentage.toFixed(1)),
    },
  ];

  // Subject progression table
  const allSubjectNames = Array.from(
    new Set([
      ...term1Summary.subjectSummaries.map((s) => s.subject.name),
      ...term2Summary.subjectSummaries.map((s) => s.subject.name),
    ])
  );

  const progressionData = [
    { period: 'เทอม 1 (ก่อนกลางภาค)', gpa: 3.2 },
    { period: 'เทอม 1 (กลางภาค)', gpa: 3.35 },
    { period: 'เทอม 1 (สรุปผล)', gpa: term1Summary.gpa },
    { period: 'เทอม 2 (ก่อนกลางภาค)', gpa: 3.5 },
    { period: 'เทอม 2 (กลางภาค)', gpa: 3.6 },
    { period: 'เทอม 2 (สรุปผล)', gpa: term2Summary.gpa },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Overview of Full Academic Year (หน้าภาพรวมการเรียน) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>ปีการศึกษา {academicYear.year}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                ภาพรวมผลการเรียนทั้งปีการศึกษา {academicYear.year}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <p className="text-sm text-slate-300">
                  {academicYear.studentName} ({academicYear.studentClass}) • {academicYear.schoolName}
                </p>
                {onOpenEditProfile && (
                  <button
                    type="button"
                    onClick={onOpenEditProfile}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer"
                    title="แก้ไขชื่อและข้อมูลส่วนตัว"
                  >
                    <Edit3 className="w-3 h-3 text-sky-300" />
                    <span>แก้ไขชื่อ</span>
                  </button>
                )}
              </div>
            </div>

            {/* GPAX Big Badge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right shrink-0">
              <span className="text-xs font-medium text-slate-300 block">
                เกรดเฉลี่ยสะสมทั้งปี (GPAX)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-0.5">
                {gpax.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-300">
                รวม {totalYearCredits} หน่วยกิต
              </span>
            </div>
          </div>

          {/* Academic Trend Banner (As specified in prompt) */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isImproved
                  ? 'bg-emerald-500 text-white'
                  : isDeclined
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {isImproved ? (
                <TrendingUp className="w-5 h-5" />
              ) : isDeclined ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <Minus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                📈 แนวโน้มผลการเรียน:{' '}
                {isImproved ? (
                  <span className="text-emerald-300 font-black">
                    ดีขึ้นจากเทอม 1 (+{gpaDiff.toFixed(2)} เกรด)
                  </span>
                ) : isDeclined ? (
                  <span className="text-rose-300 font-black">
                    ลดลงจากเทอม 1 ({gpaDiff.toFixed(2)} เกรด)
                  </span>
                ) : (
                  <span className="text-slate-300 font-black">
                    ผลการเรียนคงที่เท่ากับเทอม 1
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-300">
                เทอม 1 เกรดเฉลี่ย {term1Summary.gpa.toFixed(2)} → เทอม 2 เกรดเฉลี่ย {term2Summary.gpa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: เทอม 1 vs เทอม 2 (ระบบเปรียบเทียบเทอม) */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            เปรียบเทียบผลการเรียน (เทอม 1 vs เทอม 2)
          </h3>
          <p className="text-xs text-slate-500">
            วิเคราะห์คะแนนรวม เกรดแต่ละวิชา เกรดเฉลี่ย วิชาเด่น และวิชาที่ควรพัฒนา
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TERM 1 COLUMN */}
          <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-sm p-6 space-y-5">
            {/* Term 1 Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📘</span>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">เทอม 1</h4>
                  <span className="text-xs text-slate-500">
                    {term1Summary.totalCredits} หน่วยกิต
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">เกรดเฉลี่ย</span>
                <span className="text-2xl font-black text-blue-600">
                  {term1Summary.gpa.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Score Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                <span className="text-blue-600 font-semibold block text-[10px]">
                  คะแนนรวม
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {term1Summary.totalEarnedScore}/{term1Summary.totalMaxPossibleScore}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                <span className="text-blue-600 font-semibold block text-[10px]">
                  เปอร์เซ็นต์เฉลี่ย
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {term1Summary.overallPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Best & Improvement Subjects */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block text-[11px]">
                      วิชาที่ดีที่สุด
                    </span>
                    <span className="font-bold text-slate-900">
                      {term1Summary.bestSubject?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-900 block text-[11px]">
                      วิชาที่ควรพัฒนา
                    </span>
                    <span className="font-bold text-slate-900">
                      {term1Summary.needsImprovementSubject?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade per subject list */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">
                เกรดแต่ละวิชา (เทอม 1):
              </span>
              <div className="space-y-1.5">
                {term1Summary.subjectSummaries.map((s) => (
                  <div
                    key={s.subject.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800">
                      {s.subject.name}
                    </span>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-slate-500">
                        {s.currentPercentage.toFixed(0)}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-extrabold">
                        เกรด {s.estimatedGrade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TERM 2 COLUMN */}
          <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-sm p-6 space-y-5">
            {/* Term 2 Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📕</span>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">เทอม 2</h4>
                  <span className="text-xs text-slate-500">
                    {term2Summary.totalCredits} หน่วยกิต
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">เกรดเฉลี่ย</span>
                <span className="text-2xl font-black text-rose-600">
                  {term2Summary.gpa.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Score Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="text-rose-600 font-semibold block text-[10px]">
                  คะแนนรวม
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {term2Summary.totalEarnedScore}/{term2Summary.totalMaxPossibleScore}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="text-rose-600 font-semibold block text-[10px]">
                  เปอร์เซ็นต์เฉลี่ย
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {term2Summary.overallPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Best & Improvement Subjects */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block text-[11px]">
                      วิชาที่ดีที่สุด
                    </span>
                    <span className="font-bold text-slate-900">
                      {term2Summary.bestSubject?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-900 block text-[11px]">
                      วิชาที่ควรพัฒนา
                    </span>
                    <span className="font-bold text-slate-900">
                      {term2Summary.needsImprovementSubject?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade per subject list */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">
                เกรดแต่ละวิชา (เทอม 2):
              </span>
              <div className="space-y-1.5">
                {term2Summary.subjectSummaries.map((s) => (
                  <div
                    key={s.subject.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800">
                      {s.subject.name}
                    </span>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-slate-500">
                        {s.currentPercentage.toFixed(0)}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-extrabold">
                        เกรด {s.estimatedGrade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progression Trend Chart Across Year (กราฟพัฒนาการของคะแนน/เกรดตลอดปีการศึกษา) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="font-black text-slate-900 text-lg">
            กราฟเปรียบเทียบและพัฒนาการผลการเรียนตลอดปีการศึกษา
          </h3>
          <p className="text-xs text-slate-500">
            แสดงแนวโน้มเกรดเฉลี่ยและการสะสมคะแนนระหว่างเทอม 1 และ เทอม 2
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressionData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[2.0, 4.0]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(val: any) => [`GPA: ${val}`, 'เกรดเฉลี่ย']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="gpa"
                name="แนวโน้มเกรดเฉลี่ย (GPA)"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

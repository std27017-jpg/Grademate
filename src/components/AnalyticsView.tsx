import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  Target,
  Sliders,
  Award,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Minus,
  Trophy,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { SemesterToggle } from './SemesterToggle';
import { scoreToGrade } from '../utils/gradeCalculations';

export const AnalyticsView: React.FC = () => {
  const { currentSemester, activeSemesterSummary, academicYear, term1Summary, term2Summary } = useGrade();

  // Section 13 Tabs: [ คะแนน ] [ จุดแข็ง-จุดอ่อน ] [ เป้าหมาย & เปรียบเทียบ ]
  const [activeTab, setActiveTab] = useState<'scores' | 'strengths' | 'goals_comparison'>('scores');

  // Grade Simulation state for a selected subject in the goals tab
  const [simulatedSubjectId, setSimulatedSubjectId] = useState<string>(() => {
    return activeSemesterSummary.subjectSummaries[0]?.subject.id || '';
  });

  const activeSubjectSummary = activeSemesterSummary.subjectSummaries.find(
    (s) => s.subject.id === simulatedSubjectId
  ) || activeSemesterSummary.subjectSummaries[0];

  const [simulatedRemainingScore, setSimulatedRemainingScore] = useState<number>(0);

  React.useEffect(() => {
    if (activeSubjectSummary) {
      setSimulatedRemainingScore(Math.round(activeSubjectSummary.remainingPoints * 0.8));
    }
  }, [simulatedSubjectId, activeSubjectSummary?.remainingPoints]);

  const simulatedTotal = (activeSubjectSummary?.earnedScore || 0) + simulatedRemainingScore;
  const simulatedGrade = scoreToGrade(simulatedTotal);

  // Prepare chart data
  const barChartData = activeSemesterSummary.subjectSummaries.map((s) => ({
    name: s.subject.name.length > 12 ? s.subject.name.substring(0, 10) + '...' : s.subject.name,
    fullName: s.subject.name,
    earned: s.earnedScore,
    percentage: Number(s.currentPercentage.toFixed(1)),
    target: s.subject.targetScore || 80,
  }));

  const radarChartData = activeSemesterSummary.subjectSummaries.map((s) => ({
    subject: s.subject.name.split(' ')[0] || s.subject.name,
    score: Number(s.currentPercentage.toFixed(1)),
    target: s.subject.targetScore || 80,
  }));

  // Strengths & Weaknesses calculation
  const sortedByScore = [...activeSemesterSummary.subjectSummaries].sort(
    (a, b) => b.currentPercentage - a.currentPercentage
  );
  const strengths = sortedByScore.filter((s) => s.currentPercentage >= 75).slice(0, 3);
  const weaknesses = [...sortedByScore].reverse().filter((s) => s.currentPercentage < 80).slice(0, 3);

  // Year comparison data
  const totalYearCredits = term1Summary.totalCredits + term2Summary.totalCredits;
  const totalYearPoints =
    term1Summary.gpa * term1Summary.totalCredits +
    term2Summary.gpa * term2Summary.totalCredits;
  const gpax = totalYearCredits > 0 ? totalYearPoints / totalYearCredits : 0;

  const gpaDiff = term2Summary.gpa - term1Summary.gpa;

  const comparisonChartData = [
    {
      name: 'เกรดเฉลี่ย (GPA)',
      term1: Number(term1Summary.gpa.toFixed(2)),
      term2: Number(term2Summary.gpa.toFixed(2)),
    },
    {
      name: 'คะแนนเฉลี่ย (%)',
      term1: Number(term1Summary.overallPercentage.toFixed(1)),
      term2: Number(term2Summary.overallPercentage.toFixed(1)),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* SECTION 13: Top Header "📊 ภาพรวมของฉัน" */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                📊 ภาพรวมของฉัน
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                ปีการศึกษา {academicYear.year}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              วิเคราะห์คะแนน จุดแข็ง-จุดอ่อน และจำลองเป้าหมายเกรด
            </p>
          </div>

          <SemesterToggle size="sm" />
        </div>

        {/* 4 Quick Overview metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">เกรดเฉลี่ย GPA</span>
            <span className="text-xl font-black text-slate-900">{activeSemesterSummary.gpa.toFixed(2)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">คะแนนเฉลี่ย</span>
            <span className="text-xl font-black text-slate-900">{activeSemesterSummary.overallPercentage.toFixed(1)}%</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">วิชาถึงเป้าหมาย</span>
            <span className="text-xl font-black text-slate-900">
              {activeSemesterSummary.subjectSummaries.filter((s) => s.targetAchieved).length} / {activeSemesterSummary.subjectSummaries.length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">เกรดเฉลี่ยสะสม GPAX</span>
            <span className="text-xl font-black text-indigo-600">{gpax.toFixed(2)}</span>
          </div>
        </div>

        {/* SECTION 13 TABS: [ คะแนน ] [ จุดแข็ง-จุดอ่อน ] [ เป้าหมาย & เปรียบเทียบ ] */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {[
            { id: 'scores' as const, label: '📈 คะแนน' },
            { id: 'strengths' as const, label: '🎯 จุดแข็ง-จุดอ่อน' },
            { id: 'goals_comparison' as const, label: '🔄 เป้าหมาย & เปรียบเทียบ' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: [ คะแนน ] */}
      {activeTab === 'scores' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                กราฟเปรียบเทียบคะแนนสะสมรายวิชา (เต็ม 100 คะแนน)
              </h3>
              <p className="text-xs text-slate-500">
                แท่งสีทึบคือคะแนนที่ได้แล้ว เส้นปะสีส้มคือเป้าหมายคะแนน
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} คะแนน`,
                      name === 'earned' ? 'คะแนนที่ได้' : 'เป้าหมาย',
                    ]}
                  />
                  <Bar dataKey="earned" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" fill="#f59e0b" opacity={0.3} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: [ จุดแข็ง-จุดอ่อน ] (Section 13 format: 🟢 ทำได้ดี vs 🔴 ควรโฟกัส) */}
      {activeTab === 'strengths' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🟢 ทำได้ดี */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🟢</span>
                <h4 className="font-black text-slate-900 text-base">ทำได้ดี (Strengths)</h4>
              </div>

              <div className="space-y-2">
                {strengths.map((s) => (
                  <div
                    key={s.subject.id}
                    className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-black text-xs text-slate-900 block">{s.subject.name}</span>
                      <span className="text-[11px] text-emerald-700">
                        เกรด {s.estimatedGradeLetter} • สะสม {s.earnedScore}/100
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-800">
                      {s.currentPercentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
                {strengths.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">ยังไม่มีวิชาที่มีคะแนนมากกว่า 75%</p>
                )}
              </div>
            </div>

            {/* 🔴 ควรโฟกัส */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔴</span>
                <h4 className="font-black text-slate-900 text-base">ควรโฟกัส (Areas to Focus)</h4>
              </div>

              <div className="space-y-2">
                {weaknesses.map((s) => (
                  <div
                    key={s.subject.id}
                    className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/70 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-black text-xs text-slate-900 block">{s.subject.name}</span>
                      <span className="text-[11px] text-rose-700">
                        เหลือให้เก็บอีก {s.remainingPoints} แต้ม • เป้าหมาย {s.subject.targetGrade}
                      </span>
                    </div>
                    <span className="text-sm font-black text-rose-800">
                      {s.currentPercentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
                {weaknesses.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">ยอดเยี่ยม! ทุกวิชาทำคะแนนได้มากกว่า 80%</p>
                )}
              </div>
            </div>
          </div>

          {/* Radar Chart for balance */}
          {radarChartData.length >= 3 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <h4 className="font-black text-slate-900 text-sm">สมดุลคะแนนรอบด้าน (Skill Balance)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="คะแนนที่ได้" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                    <Radar name="เป้าหมาย" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: [ เป้าหมาย & เปรียบเทียบ ] */}
      {activeTab === 'goals_comparison' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Simulator */}
          {activeSubjectSummary && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-slate-900 text-base">เครื่องจำลองผลเกรดล่วงหน้า</h4>
                  <p className="text-xs text-slate-500">
                    ทดลองเลื่อนคะแนนที่เหลือเพื่อดูเกรดที่คาดว่าจะได้รับ
                  </p>
                </div>
                <select
                  value={simulatedSubjectId}
                  onChange={(e) => setSimulatedSubjectId(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  {activeSemesterSummary.subjectSummaries.map((s) => (
                    <option key={s.subject.id} value={s.subject.id}>
                      {s.subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">คะแนนที่ได้แล้ว: {activeSubjectSummary.earnedScore}</span>
                  <span className="font-black text-indigo-600">
                    จำลองเก็บเพิ่ม: +{simulatedRemainingScore} / {activeSubjectSummary.remainingPoints}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={activeSubjectSummary.remainingPoints}
                  value={simulatedRemainingScore}
                  onChange={(e) => setSimulatedRemainingScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">คะแนนรวมจำลอง: {simulatedTotal} คะแนน</span>
                  <span className="text-sm font-black px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-2xs">
                    เกรดที่คาดว่าจะได้: {simulatedGrade}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Year Comparison: Term 1 vs Term 2 */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-base">เปรียบเทียบภาคเรียนที่ 1 vs ภาคเรียนที่ 2</h4>
                <p className="text-xs text-slate-500">ภาพรวมการพัฒนาผลการเรียนตลอดทั้งปีการศึกษา</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">การเปลี่ยนแปลง GPA</span>
                <span
                  className={`text-sm font-black ${
                    gpaDiff > 0 ? 'text-emerald-600' : gpaDiff < 0 ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {gpaDiff > 0 ? `+${gpaDiff.toFixed(2)}` : gpaDiff.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="term1" name="เทอม 1" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="term2" name="เทอม 2" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

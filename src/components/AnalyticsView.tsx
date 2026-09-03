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
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { SemesterToggle } from './SemesterToggle';
import { scoreToGrade } from '../utils/gradeCalculations';

export const AnalyticsView: React.FC = () => {
  const { currentSemester, activeSemesterSummary } = useGrade();

  // Target Grade Simulation state for an active subject
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return activeSemesterSummary.subjectSummaries[0]?.subject.id || '';
  });

  const activeSubjectSummary = activeSemesterSummary.subjectSummaries.find(
    (s) => s.subject.id === selectedSubjectId
  ) || activeSemesterSummary.subjectSummaries[0];

  // Simulation slider: test remaining points earned
  const [simulatedRemainingScore, setSimulatedRemainingScore] = useState<number>(0);

  // When subject changes, reset slider default
  React.useEffect(() => {
    if (activeSubjectSummary) {
      setSimulatedRemainingScore(Math.round(activeSubjectSummary.remainingPoints * 0.8));
    }
  }, [selectedSubjectId, activeSubjectSummary?.remainingPoints]);

  const simulatedTotal = (activeSubjectSummary?.earnedScore || 0) + simulatedRemainingScore;
  const simulatedGrade = scoreToGrade(simulatedTotal);

  // Prepare chart data
  const barChartData = activeSemesterSummary.subjectSummaries.map((s) => ({
    name: s.subject.name.length > 12 ? s.subject.name.substring(0, 10) + '...' : s.subject.name,
    fullName: s.subject.name,
    earned: s.earnedScore,
    maxRecorded: s.totalMaxScoreRecorded,
    percentage: Number(s.currentPercentage.toFixed(1)),
    target: s.subject.targetScore || 80,
  }));

  const radarChartData = activeSemesterSummary.subjectSummaries.map((s) => ({
    subject: s.subject.name.split(' ')[0] || s.subject.name,
    score: Number(s.currentPercentage.toFixed(1)),
    target: s.subject.targetScore || 80,
  }));

  const isTerm1 = currentSemester === 'term1';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              การวิเคราะห์ผลการเรียน & แผนเพิ่มคะแนน
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {isTerm1 ? '📘 เทอม 1' : '📕 เทอม 2'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            วิเคราะห์จุดแข็ง-จุดที่ควรพัฒนา • คำแนะนำการโฟกัสรายวิชา • เครื่องจำลองเกรดล่วงหน้า
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SemesterToggle size="md" />
        </div>
      </div>

      {/* Priority Focus Breakdown (As in prompt format) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              สถานะคะแนนรายวิชา ({activeSemesterSummary.semesterName})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            🟢 ดีมาก (80%+) • 🟡 ปานกลาง (70-79%) • 🔴 ควรเร่งปรับปรุง (&lt;70%)
          </span>
        </div>

        {/* List of subjects with color dots and detailed text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {activeSemesterSummary.subjectSummaries.map((s, index) => {
            const pct = s.currentPercentage;
            const dot = pct >= 80 ? '🟢' : pct >= 70 ? '🟡' : '🔴';
            const statusColor =
              pct >= 80
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : pct >= 70
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-rose-700 bg-rose-50 border-rose-200';

            return (
              <div
                key={s.subject.id}
                className={`p-4 rounded-2xl border transition-all ${statusColor} flex flex-col justify-between space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                    <span>{dot}</span>
                    <span>{s.subject.name}</span>
                  </div>
                  <span className="font-black text-lg">
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span>คะแนนเก็บสะสม: {s.earnedScore}/{s.totalMaxScoreRecorded}</span>
                    <span className="font-semibold">เหลือให้เก็บ: {s.remainingPoints} คะแนน</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>เป้าหมาย: เกรด {s.subject.targetGrade >= 4 ? 'A (80)' : s.subject.targetGrade}</span>
                    <span>คะแนนสูงสุดที่เป็นไปได้: {s.maxPossibleTotal}/100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Focus Advice Cards */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">
              คำแนะนำจัดลำดับความสำคัญ (Focus Priority)
            </h3>
            <p className="text-xs text-slate-300">
              วิเคราะห์จากช่องว่างคะแนนสู่เป้าหมายและโอกาสในการเก็บคะแนนที่เหลือ
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {activeSemesterSummary.focusAdvice.map((advice, idx) => (
            <div
              key={advice.subject.id}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                      idx === 0
                        ? 'bg-rose-500 text-white'
                        : idx === 1
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    อันดับ {idx + 1}
                  </span>
                  <h4 className="font-bold text-base text-white">
                    {advice.subject.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  {advice.message}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[10px] text-slate-300">คะแนนที่ต้องทำเพิ่ม</div>
                <div className="text-sm font-black text-amber-300">
                  +{advice.gapToTarget} คะแนน (จาก {advice.remainingPoints})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Current % vs Target */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              เปอร์เซ็นต์คะแนนปัจจุบันเทียบกับเป้าหมาย
            </h4>
            <p className="text-xs text-slate-500">
              กราฟแท่งเปรียบเทียบผลคะแนนแต่ละวิชา
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'percentage' ? 'คะแนนปัจจุบัน' : 'เป้าหมาย',
                  ]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Legend
                  formatter={(value) => (value === 'percentage' ? 'คะแนนปัจจุบัน (%)' : 'เป้าหมาย (%)')}
                />
                <Bar dataKey="percentage" name="percentage" radius={[6, 6, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.percentage >= 80
                          ? '#10b981'
                          : entry.percentage >= 70
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
                <Bar dataKey="target" name="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Subject Strength Balance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              สมดุลผลการเรียน (Radar Chart)
            </h4>
            <p className="text-xs text-slate-500">
              วิเคราะห์ความสมดุลและความถนัดในแต่ละกลุ่มสาระ
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar
                  name="คะแนนปัจจุบัน (%)"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                <Radar
                  name="เป้าหมาย (80%)"
                  dataKey="target"
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  fill="#94a3b8"
                  fillOpacity={0.1}
                />
                <Legend />
                <Tooltip formatter={(val: any) => [`${val}%`, 'คะแนน']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Target Grade Simulator (Interactive What-If tool) */}
      {activeSubjectSummary && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  เครื่องจำลองคะแนนและเกรดล่วงหน้า (Grade Simulator)
                </h3>
                <p className="text-xs text-slate-500">
                  ทดลองปรับคะแนนสอบที่เหลือเพื่อดูเกรดสุดท้ายที่จะได้รับทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">เลือกวิชา:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {activeSemesterSummary.subjectSummaries.map((s) => (
                  <option key={s.subject.id} value={s.subject.id}>
                    {s.subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Controls */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-slate-700">
                    สมมติว่าคุณทำคะแนนในส่วนที่เหลือได้:
                  </label>
                  <span className="text-base font-extrabold text-indigo-600">
                    {simulatedRemainingScore} / {activeSubjectSummary.remainingPoints} คะแนน
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={activeSubjectSummary.remainingPoints || 10}
                  step="1"
                  value={simulatedRemainingScore}
                  onChange={(e) => setSimulatedRemainingScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0 คะแนน</span>
                  <span>คะแนนเต็ม ({activeSubjectSummary.remainingPoints} คะแนน)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-100">
                  <span className="text-slate-500 block text-[10px]">คะแนนที่มีอยู่เดิม</span>
                  <span className="font-bold text-slate-900 text-sm">{activeSubjectSummary.earnedScore}</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900">
                  <span className="text-indigo-600 block text-[10px]">+ คะแนนจำลองเพิ่ม</span>
                  <span className="font-bold text-indigo-700 text-sm">+{simulatedRemainingScore}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900">
                  <span className="text-emerald-600 block text-[10px]">= รวมคะแนนจำลอง</span>
                  <span className="font-bold text-emerald-700 text-sm">{simulatedTotal}/100</span>
                </div>
              </div>
            </div>

            {/* Projected Result Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white text-center space-y-2 shadow-lg shadow-indigo-500/25">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                เกรดสุดท้ายที่คาดว่าจะได้
              </span>
              <div className="text-4xl font-black">
                เกรด {simulatedGrade.letter} ({simulatedGrade.grade})
              </div>
              <div className="text-xs text-indigo-100 font-medium pt-2 border-t border-white/20">
                {simulatedTotal >= (activeSubjectSummary.subject.targetScore || 80)
                  ? '🎉 บรรลุเป้าหมายที่ตั้งไว้!'
                  : `ขาดอีก ${(activeSubjectSummary.subject.targetScore || 80) - simulatedTotal} คะแนนเพื่อถึงเกรด A`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

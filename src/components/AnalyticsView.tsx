import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  GraduationCap,
  BookOpen,
  Layers,
  Target,
  Sparkles,
  Heart,
  TrendingUp,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { SemesterToggle } from './SemesterToggle';
import { getSubjectColor } from '../utils/colorUtils';

export const AnalyticsView: React.FC = () => {
  const { currentSemester, activeSemesterSummary, userProfile } = useGrade();

  const subjects = activeSemesterSummary.subjectSummaries;

  // Metric values for Card 1
  const gpa = activeSemesterSummary.gpa;
  const totalCredits = activeSemesterSummary.totalCredits;
  const subjectCount = subjects.length;
  // Calculate average target grade or fallback to 3.80 / 4.00
  const targetGradeAvg = subjects.length > 0
    ? (subjects.reduce((sum, s) => sum + (s.subject.targetGrade || 4.0), 0) / subjects.length).toFixed(2)
    : '4.00';

  // Bar Chart Data for Card 2
  const barChartData = subjects.map((s) => ({
    name: s.subject.name.length > 8 ? s.subject.name.substring(0, 8) + '..' : s.subject.name,
    fullName: s.subject.name,
    earned: s.earnedScore,
    percentage: Number(s.currentPercentage.toFixed(1)),
    targetScore: s.subject.targetScore || 80,
    color: getSubjectColor(s.subject.color),
  }));

  // Average target score for reference line
  const avgTargetScore = subjects.length > 0
    ? Math.round(subjects.reduce((acc, s) => acc + (s.subject.targetScore || 80), 0) / subjects.length)
    : 80;

  // Card 3: Focus List (2-3 subjects with lowest scores)
  const focusSubjects = [...subjects]
    .sort((a, b) => a.earnedScore - b.earnedScore)
    .slice(0, 3);

  // Sweet encouragement messages
  const cuteMessages = [
    'วิชานี้อีกนิดเดียว สู้ ๆ นะ! 🌷',
    'เก็บคะแนนอีกนิดเดียวก็แตะเกรด 4 แล้ว เก่งมาก! ✨',
    'ทบทวนบทนี้บ่อย ๆ เธอทำได้แน่นอน มี๊เอาใจช่วย! 💖',
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              สถิติ & วิเคราะห์ผลการเรียน
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ภาพรวมผลการเรียน คะแนนรายวิชา และคำแนะนำเพื่อเกรดที่ตั้งเป้าไว้
          </p>
        </div>

        <SemesterToggle size="sm" />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ CARD 1: สรุปผลการเรียน ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shadow-2xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
              สรุปผลการเรียน
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            ภาคเรียนที่ {currentSemester === 'term1' ? '1' : '2'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
          {/* เกรดเฉลี่ย */}
          <div className="p-4 rounded-3xl bg-pink-50/60 border border-pink-200/70 space-y-2">
            <div className="flex items-center gap-2 text-pink-700">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">เกรดเฉลี่ย (GPA)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {gpa.toFixed(2)}
            </div>
            <span className="text-[11px] text-pink-700 font-semibold block">
              ผลการเรียนคาดการณ์
            </span>
          </div>

          {/* หน่วยกิตรวม */}
          <div className="p-4 rounded-3xl bg-sky-50/60 border border-sky-200/70 space-y-2">
            <div className="flex items-center gap-2 text-sky-700">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">หน่วยกิตรวม</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalCredits}{' '}
              <span className="text-xs font-normal text-slate-500">นก.</span>
            </div>
            <span className="text-[11px] text-sky-700 font-semibold block">
              ลงทะเบียนครบถ้วน
            </span>
          </div>

          {/* จำนวนวิชา */}
          <div className="p-4 rounded-3xl bg-purple-50/60 border border-purple-200/70 space-y-2">
            <div className="flex items-center gap-2 text-purple-700">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">จำนวนวิชา</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {subjectCount}{' '}
              <span className="text-xs font-normal text-slate-500">วิชา</span>
            </div>
            <span className="text-[11px] text-purple-700 font-semibold block">
              รายวิชาทั้งหมดในเทอม
            </span>
          </div>

          {/* เป้าหมายเกรด */}
          <div className="p-4 rounded-3xl bg-amber-50/60 border border-amber-200/70 space-y-2">
            <div className="flex items-center gap-2 text-amber-700">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">เป้าหมายเกรด</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {targetGradeAvg}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block">
              เป้าหมายเฉลี่ยรายวิชา
            </span>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ CARD 2: กราฟแท่งคะแนนแต่ละวิชา ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
              กราฟคะแนนแต่ละวิชา
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แกน Y: คะแนน (0-100) • แกน X: ชื่อวิชา • เส้นประสีแดงแสดงเป้าหมาย ({avgTargetScore} คะแนน)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block shadow-2xs" />
              <span>คะแนนปัจจุบัน</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500 inline-block" />
              <span className="text-rose-600 font-bold">เป้าหมาย</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 15, left: -20, bottom: 20 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl shadow-lg text-xs space-y-1">
                        <p className="font-extrabold">{data.fullName}</p>
                        <p className="text-slate-300">
                          คะแนนปัจจุบัน: <span className="font-bold text-white">{data.earned}</span> / 100
                        </p>
                        <p className="text-rose-300">
                          เป้าหมาย: <span className="font-bold text-white">{data.targetScore}</span> คะแนน
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* เส้นประสีแดง แสดงเป้าหมาย */}
              <ReferenceLine
                y={avgTargetScore}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `เป้าหมาย (${avgTargetScore})`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontWeight: 'bold',
                }}
              />
              <Bar
                dataKey="earned"
                fill="#6366f1"
                radius={[8, 8, 0, 0]}
              >
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ CARD 3: แนะนำวิชาที่ควรโฟกัส (Focus List) ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-2xs">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                แนะนำวิชาที่ควรโฟกัส (Focus List)
              </h3>
              <p className="text-xs text-slate-500">
                2-3 วิชาที่คะแนนยังสามารถพัฒนาได้ เพื่อแตะเป้าหมายเกรดในฝัน
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
            แนะนำเร่งด่วน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {focusSubjects.map((s, index) => {
            const cuteMsg = cuteMessages[index] || cuteMessages[0];
            const neededScore = Math.max(0, (s.subject.targetScore || 80) - s.earnedScore);

            return (
              <div
                key={s.subject.id}
                className="p-4.5 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3.5 shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: getSubjectColor(s.subject.color) }}
                    >
                      {s.subject.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">
                        {s.subject.name}
                      </h4>
                      <span className="text-xs font-semibold text-slate-400 block truncate">
                        รหัส {s.subject.code} • {s.subject.credits} หน่วยกิต
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">คะแนนสะสม</span>
                      <span className="font-black text-slate-900 text-base">
                        {s.earnedScore}{' '}
                        <span className="text-[11px] font-normal text-slate-400">/ 100</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">เกรดคาดการณ์</span>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-black text-xs">
                        เกรด {s.estimatedGrade}
                      </span>
                    </div>
                  </div>

                  {/* Encouraging message */}
                  <div className="p-3 bg-pink-50/70 rounded-2xl border border-pink-200/70 text-xs text-pink-800 font-medium leading-relaxed flex items-start gap-2">
                    <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                    <span>{cuteMsg}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    ขาดอีก <span className="font-extrabold text-slate-900">{neededScore} คะแนน</span> ถึงเป้าหมาย
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
                    🎯 เป้า {s.subject.targetGrade}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {focusSubjects.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            ยังไม่มีรายวิชาในภาคเรียนนี้
          </div>
        )}
      </div>
    </div>
  );
};

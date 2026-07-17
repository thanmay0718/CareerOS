import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, Brain, CalendarDays, Flame, Pause, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/StatCard';
import { useAnalyticsStory, useLearningHeatmap, useLearningHeatmapDay } from '../hooks/useAnalytics';
import { useCreateFocusSession, useFocusSessions } from '../hooks/useFocusSessions';
import { useRewardProfile } from '../hooks/useRewards';

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function formatLongDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatMinutes(minutes = 0) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const rest = safeMinutes % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

function learningCellClass(intensity) {
  if (intensity >= 4) return 'border-emerald-200/70 bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.34)]';
  if (intensity === 3) return 'border-emerald-300/50 bg-emerald-500/80';
  if (intensity === 2) return 'border-teal-300/40 bg-teal-500/55';
  if (intensity === 1) return 'border-lime-300/30 bg-lime-400/30';
  return 'border-white/10 bg-white/[0.045]';
}

function buildCalendarWeeks(days) {
  if (!days?.length) return [];
  const byDate = new Map(days.map((day) => [day.date, day]));
  const first = new Date(`${days[0].date}T00:00:00`);
  const last = new Date(`${days[days.length - 1].date}T00:00:00`);
  const cursor = new Date(first);
  cursor.setDate(cursor.getDate() - cursor.getDay());
  const end = new Date(last);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const weeks = [];

  while (cursor <= end) {
    const week = [];
    for (let index = 0; index < 7; index += 1) {
      const dateKey = cursor.toISOString().slice(0, 10);
      week.push(byDate.get(dateKey) || { date: dateKey, empty: true, intensity: 0, studyMinutes: 0, topics: [] });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function chartData(points = []) {
  return points.map((point) => ({
    label: formatDate(point.date),
    value: point.value,
  }));
}

function DetailModal({ date, onClose }) {
  const detailQuery = useLearningHeatmapDay(date, Boolean(date));
  const detail = detailQuery.data;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-950 p-5 shadow-glow sm:max-w-3xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-200">Daily summary</p>
            <h3 className="mt-1 text-2xl font-bold text-white">{date ? formatLongDate(date) : ''}</h3>
          </div>
          <button type="button" onClick={onClose} className="stitch-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-full" aria-label="Close day details">
            <X size={18} />
          </button>
        </div>

        {detailQuery.isLoading ? (
          <div className="mt-8 flex justify-center"><Spinner label="Loading day details" /></div>
        ) : detail ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Study time', formatMinutes(detail.totalStudyMinutes)],
                ['Sessions', detail.learningSessions],
                ['Tasks', detail.tasksCompleted],
                ['Score', `${detail.productivityScore}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs font-semibold text-slate-400">{label}</div>
                  <div className="mt-2 text-xl font-bold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <h4 className="font-bold text-white">Learning activity</h4>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <span className="text-slate-400">Concepts completed</span><span className="text-right text-white">{detail.conceptsCompleted}</span>
                  <span className="text-slate-400">Notes created</span><span className="text-right text-white">{detail.notesCreated}</span>
                  <span className="text-slate-400">Roadmaps updated</span><span className="text-right text-white">{detail.roadmapsUpdated}</span>
                  <span className="text-slate-400">Practice solved</span><span className="text-right text-white">{detail.practiceProblemsSolved}</span>
                  <span className="text-slate-400">Resources read</span><span className="text-right text-white">{detail.resourcesRead}</span>
                  <span className="text-slate-400">Videos watched</span><span className="text-right text-white">{detail.videosWatched}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <h4 className="font-bold text-white">Technologies studied</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.technologiesStudied?.length ? detail.technologiesStudied.map((topic) => (
                    <span key={topic} className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">{topic}</span>
                  )) : <p className="text-sm text-slate-400">No technologies were recorded.</p>}
                </div>
                <h4 className="mt-5 font-bold text-white">Achievements earned</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.achievementsEarned?.length ? detail.achievementsEarned.map((achievement) => (
                    <span key={achievement} className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">{achievement}</span>
                  )) : <p className="text-sm text-slate-400">No achievement was earned on this date.</p>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h4 className="font-bold text-white">Daily reflection</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">{detail.dailyReflection}</p>
              {detail.attachments?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.attachments.map((attachment) => (
                    <span key={attachment} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{attachment}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <EmptyState title="No details available" description="The backend did not return a summary for this day." />
        )}
      </div>
    </div>
  );
}

function LearningActivityHeatmap() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [technologyFilter, setTechnologyFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(null);
  const heatmapQuery = useLearningHeatmap(year);
  const heatmap = heatmapQuery.data;

  useEffect(() => {
    if (heatmap?.summary?.selectedYear) {
      setYear(heatmap.summary.selectedYear);
    }
  }, [heatmap?.summary?.selectedYear]);

  const technologies = useMemo(() => {
    const names = new Set();
    heatmap?.days?.forEach((day) => day.topics?.forEach((topic) => names.add(topic)));
    return [...names].sort();
  }, [heatmap?.days]);

  const filteredDays = useMemo(() => {
    return (heatmap?.days ?? []).filter((day) => {
      const monthMatches = monthFilter === 'ALL' || new Date(`${day.date}T00:00:00`).getMonth() + 1 === Number(monthFilter);
      const technologyMatches = technologyFilter === 'ALL' || day.topics?.includes(technologyFilter);
      return monthMatches && technologyMatches;
    });
  }, [heatmap?.days, monthFilter, technologyFilter]);

  const weeks = useMemo(() => buildCalendarWeeks(filteredDays), [filteredDays]);
  const monthLabels = useMemo(() => {
    const labels = [];
    weeks.forEach((week, index) => {
      const firstOfMonth = week.find((day) => new Date(`${day.date}T00:00:00`).getDate() <= 7);
      if (firstOfMonth) {
        labels.push({ index, label: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(`${firstOfMonth.date}T00:00:00`)) });
      }
    });
    return labels;
  }, [weeks]);

  if (heatmapQuery.isError) {
    return (
      <ApiAlert
        title="Learning heatmap unavailable"
        description={heatmapQuery.error?.response?.data?.message || heatmapQuery.error?.message || 'Unable to load learning heatmap'}
        onRetry={heatmapQuery.refetch}
      />
    );
  }

  if (heatmapQuery.isLoading) {
    return (
      <div className="stitch-panel space-y-5 rounded-2xl p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/10" />)}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-white/10" />
      </div>
    );
  }

  if (!heatmap) {
    return <EmptyState title="No heatmap data" description="Learning activity will appear after the backend records check-ins, focus sessions, tasks, notes, or concepts." />;
  }

  const summary = heatmap.summary;

  return (
    <section className="stitch-panel rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200"><CalendarDays size={15} /> Learning activity</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{summary.totalLearningHours} Learning Hours in the Past Year</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A backend-driven map of daily study consistency, duration, productivity, and streak momentum.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-full border px-4 py-2 text-sm">
            {(heatmap.availableYears?.length ? heatmap.availableYears : [year]).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="rounded-full border px-4 py-2 text-sm">
            <option value="ALL">All months</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(new Date(2026, index, 1))}</option>
            ))}
          </select>
          <select value={technologyFilter} onChange={(event) => setTechnologyFilter(event.target.value)} className="rounded-full border px-4 py-2 text-sm">
            <option value="ALL">All technologies</option>
            {technologies.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {[
          ['Active Days', summary.activeLearningDays],
          ['Sessions', summary.totalLearningSessions],
          ['Current Streak', `${summary.currentStreak}d`],
          ['Longest Streak', `${summary.longestStreak}d`],
          ['Average', `${formatMinutes(summary.averageStudyMinutesPerDay)} / day`],
          ['Completion', `${summary.completionPercentage}%`],
          ['Year', summary.selectedYear],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs font-semibold text-slate-400">{label}</div>
            <div className="mt-2 text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto pb-3">
        <div className="min-w-[850px]">
          <div className="relative ml-9 h-6">
            {monthLabels.map((item) => (
              <span key={`${item.label}-${item.index}`} className="absolute text-xs font-semibold text-slate-400" style={{ left: `${item.index * 18}px` }}>{item.label}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="grid grid-rows-7 gap-[5px] pt-1 text-[11px] text-slate-500">
              {['Sun', '', 'Tue', '', 'Thu', '', 'Sat'].map((label, index) => <span key={`${label}-${index}`} className="h-[13px] leading-[13px]">{label}</span>)}
            </div>
            <div className="grid auto-cols-[13px] grid-flow-col grid-rows-7 gap-[5px]" role="grid" aria-label="Learning activity calendar">
              {weeks.flatMap((week) => week.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  disabled={day.empty}
                  onClick={() => !day.empty && setSelectedDate(day.date)}
                  className={`group relative h-[13px] w-[13px] rounded-[3px] border transition duration-200 hover:scale-125 focus-visible:scale-125 ${learningCellClass(day.intensity)} ${day.empty ? 'opacity-20' : ''}`}
                  aria-label={`${formatLongDate(day.date)}: ${formatMinutes(day.studyMinutes)} studied, productivity ${day.productivityScore || 0}%`}
                >
                  {!day.empty ? (
                    <span className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-left opacity-0 shadow-glow transition group-hover:block group-hover:opacity-100 group-focus-visible:block group-focus-visible:opacity-100">
                      <span className="block text-sm font-bold text-white">{formatLongDate(day.date)}</span>
                      <span className="mt-3 block text-xs text-slate-400">Study Time</span>
                      <span className="block text-sm font-semibold text-emerald-100">{formatMinutes(day.studyMinutes)}</span>
                      <span className="mt-3 block text-xs text-slate-400">Topics Studied</span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {day.topics?.length ? day.topics.slice(0, 4).map((topic) => <span key={topic} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-200">{topic}</span>) : <span className="text-xs text-slate-500">None recorded</span>}
                      </span>
                      <span className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <span>Tasks: {day.tasksCompleted}</span>
                        <span>Concepts: {day.completedConcepts}</span>
                        <span>Goal: {day.goalCompleted ? 'Completed' : 'Open'}</span>
                        <span>Score: {day.productivityScore}%</span>
                      </span>
                    </span>
                  ) : null}
                </button>
              )))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-400">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => <span key={level} className={`h-3 w-3 rounded-[3px] border ${learningCellClass(level)}`} />)}
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="font-bold text-white">Daily learning hours</h3>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData(heatmap.dailyLearningHours)}>
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={28} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} width={32} />
                <ChartTooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="#34d399" fill="#34d399" fillOpacity={0.16} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="font-bold text-white">Technology breakdown</h3>
            <div className="mt-4 space-y-3">
              {heatmap.technologyBreakdown?.length ? heatmap.technologyBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-xs"><span className="text-slate-300">{item.category}</span><span className="text-slate-400">{item.percentage}%</span></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: `${item.percentage}%` }} /></div>
                </div>
              )) : <p className="text-sm text-slate-400">No technology time is available yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="inline-flex items-center gap-2 font-bold text-white"><Award size={16} /> Badges</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {heatmap.achievements?.length ? heatmap.achievements.map((achievement) => (
                <span key={achievement} className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">{achievement}</span>
              )) : <p className="text-sm text-slate-400">Consistency badges will unlock from real activity.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="inline-flex items-center gap-2 font-bold text-white"><Sparkles size={16} /> Smart insights</h3>
          <div className="mt-3 space-y-2">
            {heatmap.smartInsights?.map((insight) => <p key={insight} className="text-sm leading-6 text-slate-400">{insight}</p>)}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Weekly Activity', heatmap.weeklyProgress?.at(-1)?.value ?? 0, 'hours learned'],
            ['Monthly Growth', heatmap.monthlyGrowth?.at(-1)?.value ?? 0, 'hours this month'],
            ['Streak Trend', heatmap.streakTrend?.at(-1)?.value ?? 0, 'days active'],
          ].map(([label, value, caption]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs font-semibold text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{value}</div>
              <div className="mt-1 text-xs text-slate-500">{caption}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedDate ? <DetailModal date={selectedDate} onClose={() => setSelectedDate(null)} /> : null}
    </section>
  );
}

function PomodoroTimer() {
  const [mode, setMode] = useState({ label: 'Pomodoro', minutes: 25, type: 'POMODORO' });
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const createFocusSessionMutation = useCreateFocusSession();
  const focusSessionsQuery = useFocusSessions();

  useEffect(() => {
    setSecondsLeft(mode.minutes * 60);
    setRunning(false);
  }, [mode]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          createFocusSessionMutation.mutate({ durationMinutes: mode.minutes, sessionType: mode.type });
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, mode, createFocusSessionMutation]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const recentSessions = focusSessionsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Pomodoro', minutes: 25, type: 'POMODORO' },
            { label: 'Short Break', minutes: 5, type: 'SHORT_BREAK' },
            { label: 'Long Break', minutes: 15, type: 'LONG_BREAK' },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${mode.type === item.type ? 'border-indigo-300/40 bg-indigo-500/20 text-white' : 'border-white/10 text-slate-400'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="text-xs font-semibold text-slate-400">{mode.label}</div>
          <div className="mt-2 font-mono text-6xl font-bold text-white">{minutes}:{seconds}</div>
          <p className="mt-3 text-sm text-slate-400">
            Completed sessions are logged to the backend automatically when the timer finishes.
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => setRunning((value) => !value)} className="stitch-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button type="button" onClick={() => { setRunning(false); setSecondsLeft(mode.minutes * 60); }} className="stitch-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {focusSessionsQuery.isLoading ? (
        <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
      ) : recentSessions.length ? (
        <div className="space-y-2">
          {recentSessions.slice(0, 3).map((session) => (
            <div key={session.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
              <span className="font-semibold text-white">{session.sessionType}</span>
              <span className="text-slate-400">{session.durationMinutes} min</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const storyQuery = useAnalyticsStory();
  const rewardProfileQuery = useRewardProfile();
  const story = storyQuery.data;
  const rewards = rewardProfileQuery.data;

  return (
    <div className="space-y-6">
      <header className="premium-page-header rounded-2xl p-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300">
          <Brain size={15} />
          Analytics
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white">CareerOS intelligence</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Analytics explain what changed, what needs attention, and what to do next. Every score and insight is generated by backend APIs.
        </p>
      </header>

      {storyQuery.isError ? (
        <ApiAlert
          title="Analytics unavailable"
          description={storyQuery.error?.response?.data?.message || storyQuery.error?.message || 'Unable to load analytics story'}
          onRetry={storyQuery.refetch}
        />
      ) : null}

      {storyQuery.isLoading ? (
        <div className="stitch-panel flex items-center justify-center rounded-2xl p-10">
          <Spinner label="Loading analytics story" />
        </div>
      ) : story ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="stitch-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-200">
                <Flame size={17} />
                Today's productivity
              </div>
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-6xl font-bold text-white">{story.todaysProductivity}</div>
                  <p className="mt-2 text-lg font-semibold text-emerald-200">{story.productivityLabel}</p>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{story.focusRecommendation}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/practice')}
                  className="stitch-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Open focus work
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Completion Rate" value={`${story.completionRate}%`} highlight={story.completionRate >= 70} />
              <StatCard label="Consistency" value={`${story.consistencyScore}%`} highlight={story.consistencyScore >= 70} />
              <StatCard label="Focus Hours" value={`${story.focusHours}h`} highlight={story.focusHours > 0} />
              <StatCard label="Weekly Change" value={`${story.weeklyImprovement > 0 ? '+' : ''}${story.weeklyImprovement}%`} highlight={story.weeklyImprovement >= 0} />
            </div>
          </section>

          {rewards ? (
            <section className="grid gap-4 md:grid-cols-3">
              <div className="stitch-panel rounded-2xl p-5">
                <div className="text-xs font-semibold text-slate-400">Level</div>
                <div className="mt-2 text-3xl font-bold text-white">{rewards.level}</div>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-indigo-400 to-violet-400"
                    style={{ width: `${Math.min(100, Math.max(0, ((rewards.xp - rewards.xpForCurrentLevel) / Math.max(1, rewards.xpForNextLevel - rewards.xpForCurrentLevel)) * 100))}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">{rewards.xpRemainingToNextLevel} XP remaining</p>
              </div>
              <div className="stitch-panel rounded-2xl p-5">
                <div className="text-xs font-semibold text-slate-400">Coins</div>
                <div className="mt-2 text-3xl font-bold text-white">{rewards.coins}</div>
                <p className="mt-2 text-xs text-slate-400">Reward balance calculated by backend.</p>
              </div>
              <div className="stitch-panel rounded-2xl p-5">
                <div className="text-xs font-semibold text-slate-400">Unlocked</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rewards.unlockedBenefits?.map((benefit) => (
                    <span key={benefit} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-200">{benefit}</span>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="What changed?">
              <div className="space-y-3">
                {story.insights?.map((insight) => (
                  <article key={insight.question} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">{insight.question}</div>
                        <h3 className="mt-2 text-lg font-bold text-white">{insight.answer}</h3>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs ${insight.tone === 'POSITIVE' ? 'border-emerald-300/30 text-emerald-200' : insight.tone === 'WARNING' ? 'border-amber-300/30 text-amber-200' : 'border-indigo-300/30 text-indigo-200'}`}>
                        {insight.tone}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{insight.evidence}</p>
                    <button
                      type="button"
                      onClick={() => navigate(insight.actionPath)}
                      className="stitch-button-secondary mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
                    >
                      {insight.actionLabel}
                      <ArrowRight size={14} />
                    </button>
                  </article>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Achievements">
              {rewardProfileQuery.isLoading ? (
                <Spinner label="Loading achievements" />
              ) : rewards?.achievements?.length ? (
                <div className="space-y-3">
                  {rewards.achievements.map((achievement) => (
                    <article key={achievement.code} className={`rounded-2xl border p-4 ${achievement.unlocked ? 'border-emerald-300/30 bg-emerald-500/10' : 'border-white/10 bg-white/[0.04]'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white">{achievement.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">{achievement.description}</p>
                        </div>
                        <span className="rounded-full border border-current/30 px-3 py-1 text-xs text-slate-300">
                          {achievement.unlocked ? 'Completed' : 'Locked'}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400"
                          style={{ width: `${Math.min(100, (achievement.currentValue / Math.max(1, achievement.targetValue)) * 100)}%` }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No achievements returned" description="Achievements will appear when the backend can evaluate your progress." />
              )}
            </SectionCard>
          </section>

          <LearningActivityHeatmap />

          <SectionCard title="Focus timer">
            <PomodoroTimer />
          </SectionCard>
        </>
      ) : (
        <EmptyState title="No analytics story yet" description="Create tasks and check-ins so CareerOS can generate behavior insights." />
      )}
    </div>
  );
}

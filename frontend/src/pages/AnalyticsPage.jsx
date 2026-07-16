import { useEffect, useState } from 'react';
import { ArrowRight, Brain, Clock3, Flame, Pause, Play, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/StatCard';
import { useAnalyticsStory } from '../hooks/useAnalytics';
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

function heatmapClass(intensity) {
  if (intensity >= 4) return 'border-emerald-300/40 bg-emerald-400/70';
  if (intensity === 3) return 'border-emerald-300/30 bg-emerald-400/45';
  if (intensity === 2) return 'border-indigo-300/30 bg-indigo-400/35';
  if (intensity === 1) return 'border-sky-300/20 bg-sky-400/20';
  return 'border-white/10 bg-white/[0.04]';
}

function ActivityHeatmap({ days }) {
  return (
    <div className="grid grid-cols-10 gap-2 sm:grid-cols-15">
      {days.map((day) => (
        <div
          key={day.date}
          title={`${formatDate(day.date)} - ${day.studyHours}h, ${day.checkIns} check-ins`}
          className={`aspect-square rounded-md border ${heatmapClass(day.intensity)}`}
          aria-label={`${formatDate(day.date)} activity intensity ${day.intensity}`}
        />
      ))}
    </div>
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

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SectionCard title="Activity heatmap">
              {story.activityHeatmap?.length ? (
                <ActivityHeatmap days={story.activityHeatmap} />
              ) : (
                <EmptyState title="No heatmap activity" description="Check-ins and focus work will populate your activity heatmap." />
              )}
            </SectionCard>

            <SectionCard title="Focus timer">
              <PomodoroTimer />
            </SectionCard>
          </section>
        </>
      ) : (
        <EmptyState title="No analytics story yet" description="Create tasks and check-ins so CareerOS can generate behavior insights." />
      )}
    </div>
  );
}

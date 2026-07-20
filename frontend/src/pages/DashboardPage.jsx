import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Compass,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiAlert } from '../components/ApiAlert';
import { DashboardGradientCard } from '../components/DashboardGradientCard';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/StatCard';
import { StreakAchievement } from '../components/StreakAchievement';
import { useAnalyticsSummary, useDashboardActivity, useDashboardStatistics } from '../hooks/useAnalytics';
import { useDashboard } from '../hooks/useDashboard';
import { useNotifications } from '../hooks/useNotifications';
import { useRewardProfile } from '../hooks/useRewards';

function formatDate(value, includeTime = false) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
  }).format(new Date(value));
}

function getSummaryValue(summaryCards, label) {
  return summaryCards.find((card) => card.label === label)?.value;
}

function ProgressRing({ value, label }) {
  const percentage = Number.isFinite(Number(value)) ? Math.min(Math.max(Number(value), 0), 100) : 0;

  return (
    <div
      className="grid h-24 w-24 shrink-0 place-items-center rounded-full text-lg font-bold text-white"
      style={{ background: `conic-gradient(#10b981 ${percentage * 3.6}deg, rgba(190, 198, 224, 0.12) 0deg)` }}
      aria-label={`${label}: ${percentage}%`}
    >
      <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-sm">{percentage}%</div>
    </div>
  );
}

function TaskCard({ task }) {
  return (
    <article className={`rounded-2xl border px-4 py-3 ${
      task.overdue
        ? 'border-red-500/30 bg-red-500/10 text-red-100'
        : 'border-white/10 bg-white/[0.04] text-slate-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase text-slate-400">{task.category}</div>
          <h3 className="mt-1 truncate font-semibold text-white">{task.title}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-current/30 px-3 py-1 text-xs">{task.priority}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded-full border border-current/20 px-3 py-1">{task.status}</span>
        <span className="rounded-full border border-current/20 px-3 py-1">{formatDate(task.dueDate)}</span>
        {task.estimatedDurationMinutes ? (
          <span className="rounded-full border border-current/20 px-3 py-1">{task.estimatedDurationMinutes} min</span>
        ) : null}
        {task.planName ? <span className="rounded-full border border-current/20 px-3 py-1">{task.planName}</span> : null}
      </div>
    </article>
  );
}

function ActivityCard({ activity }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-indigo-300/30">
      <div className="flex items-center justify-between gap-3">
        <span className="stitch-badge rounded-full px-3 py-1 text-xs">{activity.type}</span>
        <span className="text-xs text-slate-500">{formatDate(activity.timestamp, true)}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{activity.message}</p>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="stitch-panel rounded-[2rem] p-6">
        <div className="h-5 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 h-10 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-white/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [showAllTodayTasks, setShowAllTodayTasks] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const dashboardActivityQuery = useDashboardActivity();
  const dashboardStatisticsQuery = useDashboardStatistics();
  const analyticsSummaryQuery = useAnalyticsSummary();
  const notificationsQuery = useNotifications();
  const rewardProfileQuery = useRewardProfile();
  const navigate = useNavigate();

  const summaryCards = data?.summaryCards ?? [];
  const visibleSummaryCards = summaryCards.filter((card) => card.label !== 'Current Streak');
  const progressCards = data?.progressCards ?? [];
  const upcomingTasks = data?.upcomingTasks ?? { todayTasks: [], tomorrowTasks: [], upcomingDeadlines: [] };
  const notificationItems = notificationsQuery.data ?? [];
  const activityItems = dashboardActivityQuery.data ?? data?.recentActivity ?? [];
  const statisticItems = dashboardStatisticsQuery.data ?? [];
  const analyticsSummary = analyticsSummaryQuery.data;
  const recommendation = data?.recommendation;
  const emptyState = data?.emptyState;
  const currentProgress = progressCards.find((card) => card.label === 'Overall Career Progress') ?? progressCards[0];
  const learningProgress = progressCards.find((card) => card.label === 'Learning Roadmaps');
  const readinessLabel = getSummaryValue(summaryCards, 'Applications') !== undefined ? 'Applications' : 'Total Tasks';
  const readinessValue = getSummaryValue(summaryCards, readinessLabel);
  const todayTasks = upcomingTasks.todayTasks ?? [];
  const visibleTodayTasks = showAllTodayTasks ? todayTasks : todayTasks.slice(0, 3);
  const visibleActivityItems = showAllActivity ? activityItems : activityItems.slice(0, 4);
  const upcomingDeadlines = upcomingTasks.upcomingDeadlines ?? [];
  const activeRecommendationPath = recommendation?.actionPath || '/practice';
  const rewardProfile = rewardProfileQuery.data;
  const dashboardStreak = analyticsSummary?.currentStreak ?? Number.parseInt(getSummaryValue(summaryCards, 'Current Streak'), 10);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-5">
      <header className="stitch-panel stitch-hero rounded-[2rem] p-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] xl:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-100">
              <Sparkles size={14} />
              Career operating system
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
              {data?.welcome?.greeting ? `${data.welcome.greeting}${data.welcome.userName ? `, ${data.welcome.userName}` : ''}` : 'Dashboard'}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              {data?.welcome?.careerGoal || 'Career goal will appear after the backend receives a plan.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(activeRecommendationPath)}
                className="stitch-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:bg-sky-400"
              >
                {recommendation?.actionLabel || 'Open practice'}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/analytics')}
                className="stitch-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              >
                <TrendingUp size={16} />
                View analytics
              </button>
            </div>
          </div>

          <DashboardGradientCard
            title={currentProgress?.label || 'Progress pending'}
            description={currentProgress?.description || 'Progress appears when backend activity exists.'}
            metricLabel="Current progress"
            metricValue={`${Math.min(Math.max(currentProgress?.percentage ?? 0, 0), 100)}%`}
            progress={currentProgress?.percentage}
            actionLabel={recommendation?.actionLabel || 'Open practice'}
            onAction={() => navigate(activeRecommendationPath)}
            stats={[
              { label: 'Active plan', value: data?.welcome?.activePlan || 'No active plan loaded' },
              { label: readinessLabel, value: readinessValue ?? 'Pending' },
              ...(rewardProfile
                ? [
                    { label: 'Level', value: rewardProfile.level },
                    { label: 'Coins', value: rewardProfile.coins },
                    { label: 'Productivity', value: rewardProfile.productivityScore },
                  ]
                : rewardProfileQuery.isLoading
                  ? [{ label: 'Rewards', value: 'Loading...' }]
                  : []),
            ]}
          />
        </div>
      </header>

      {isError ? (
        <ApiAlert
          title="Dashboard unavailable"
          description={error?.response?.data?.message || error.message || 'Unable to load dashboard'}
          onRetry={refetch}
        />
      ) : null}

      {!data?.hasData ? (
        <EmptyState
          title={emptyState?.title || 'No career activity yet'}
          description={emptyState?.message || 'Create a plan, task, or check-in so the backend can personalize this workspace.'}
          actionLabel={emptyState?.actionLabel || 'Open projects'}
          onActionClick={() => navigate('/projects')}
        />
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <SectionCard title="Current goal">
              {recommendation ? (
                <div className="rounded-2xl border border-indigo-300/20 bg-indigo-500/10 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-100">
                    <Compass size={15} />
                    <span>{recommendation.source}</span>
                    <span className="rounded-full border border-current/30 px-2 py-0.5">{recommendation.priority}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-white">{recommendation.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{recommendation.reason}</p>
                  <button
                    type="button"
                    onClick={() => navigate(recommendation.actionPath)}
                    className="stitch-button mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {recommendation.actionLabel}
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <EmptyState
                  title="No recommendation returned"
                  description="The dashboard recommendation field is empty. Retry once the backend can evaluate user history."
                  actionLabel="Retry"
                  onActionClick={refetch}
                />
              )}
            </SectionCard>

            <SectionCard title="Today's focus">
              <div className="space-y-3">
                {todayTasks.length ? (
                  <>
                    {visibleTodayTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                    {todayTasks.length > visibleTodayTasks.length ? (
                      <button
                        type="button"
                        onClick={() => setShowAllTodayTasks(true)}
                        className="stitch-button-secondary w-full rounded-full px-4 py-2 text-sm font-semibold"
                      >
                        Show more
                      </button>
                    ) : null}
                  </>
                ) : (
                  <EmptyState
                    title="No tasks due today"
                    description="Today's focus list is empty because the backend did not return pending tasks for today."
                    actionLabel="Open practice"
                    onActionClick={() => navigate('/practice')}
                  />
                )}
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Number.isFinite(dashboardStreak) ? (
              <StreakAchievement days={dashboardStreak} compact className="xl:col-span-2" />
            ) : null}
            {visibleSummaryCards.slice(0, Number.isFinite(dashboardStreak) ? 2 : 4).map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} highlight={card.highlight} />
            ))}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Learning progress</h2>
                <p className="mt-1 text-sm text-slate-400">Progress cards are calculated by the backend from tasks and learning records.</p>
              </div>
              {learningProgress ? (
                <button
                  type="button"
                  onClick={() => navigate('/learning')}
                  className="stitch-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Learning
                  <ArrowRight size={15} />
                </button>
              ) : null}
            </div>
            <div className="grid gap-4 xl:grid-cols-4">
              {progressCards.length ? progressCards.map((card) => (
                <article key={card.label} className="stitch-panel rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium text-slate-400">{card.label}</div>
                      <div className="mt-2 font-display text-lg font-bold text-white">{card.description}</div>
                    </div>
                    <ProgressRing value={card.percentage} label={card.label} />
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(card.percentage, 0), 100)}%` }}
                    />
                  </div>
                </article>
              )) : (
                <EmptyState
                  title="No progress returned"
                  description="The dashboard progress endpoint will populate this section after backend records exist."
                />
              )}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
            <SectionCard title="Upcoming tasks">
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <CalendarClock size={16} />
                    Upcoming deadlines
                  </div>
                  <div className="space-y-3">
                    {upcomingDeadlines.length ? (
                      upcomingDeadlines.map((task) => <TaskCard key={task.id} task={task} />)
                    ) : (
                      <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
                        The backend did not return upcoming deadlines.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Analytics summary">
              {analyticsSummaryQuery.isLoading ? (
                <Spinner label="Loading analytics" />
              ) : analyticsSummary ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {analyticsSummary.completionRate !== undefined ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                          <CheckCircle2 size={14} />
                          Completion rate
                        </div>
                        <div className="mt-2 font-display text-2xl font-bold text-white">{analyticsSummary.completionRate}%</div>
                      </div>
                    ) : null}
                    {analyticsSummary.currentStreak !== undefined ? (
                      <StreakAchievement days={analyticsSummary.currentStreak} compact className="sm:col-span-2" />
                    ) : null}
                    {analyticsSummary.studyHours?.today !== undefined ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-xs font-medium text-slate-400">Study hours today</div>
                        <div className="mt-2 font-display text-2xl font-bold text-white">{analyticsSummary.studyHours.today}h</div>
                      </div>
                    ) : null}
                    {analyticsSummary.studyHours?.week !== undefined ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-xs font-medium text-slate-400">Study hours this week</div>
                        <div className="mt-2 font-display text-2xl font-bold text-white">{analyticsSummary.studyHours.week}h</div>
                      </div>
                    ) : null}
                  </div>
                  {analyticsSummary.weeklyActivity?.length ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <BarChart3 size={14} />
                        Weekly activity
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        {analyticsSummary.weeklyActivity.slice(-4).map((point) => (
                          <div key={point.date} className="flex items-center justify-between gap-3">
                            <span>{formatDate(point.date)}</span>
                            <span>{point.tasksCompleted} tasks, {point.checkIns} check-ins, {point.studyHours}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="No analytics yet"
                  description="Analytics will appear after the backend records tasks, plans, or check-ins."
                  actionLabel="Open analytics"
                  onActionClick={() => navigate('/analytics')}
                />
              )}
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Recent activity">
              <div className="space-y-3">
                {dashboardActivityQuery.isLoading ? (
                  <Spinner label="Loading activity" />
                ) : activityItems.length ? (
                  <>
                    {visibleActivityItems.map((activity) => <ActivityCard key={`${activity.type}-${activity.timestamp}`} activity={activity} />)}
                    {activityItems.length > visibleActivityItems.length ? (
                      <button
                        type="button"
                        onClick={() => setShowAllActivity(true)}
                        className="stitch-button-secondary w-full rounded-full px-4 py-2 text-sm font-semibold"
                      >
                        Show more
                      </button>
                    ) : null}
                  </>
                ) : (
                  <EmptyState
                    title="No recent activity"
                    description="Create or complete work so the backend can build the activity feed."
                    actionLabel="Open practice"
                    onActionClick={() => navigate('/practice')}
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard title="System signals">
              <div className="grid gap-4 sm:grid-cols-2">
                {statisticItems.length ? statisticItems.map((item) => (
                  <StatCard key={item.label} label={item.label} value={item.value} highlight={item.highlight} />
                )) : (
                  <EmptyState
                    title="No statistics returned"
                    description="The dashboard statistics endpoint will populate this section once activity exists."
                    actionLabel="Open practice"
                    onActionClick={() => navigate('/practice')}
                  />
                )}
                {notificationsQuery.isLoading ? (
                  <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
                ) : notificationItems.length ? (
                  <StatCard label="Notifications" value={String(notificationItems.length)} highlight />
                ) : null}
              </div>
            </SectionCard>
          </section>
        </>
      )}
    </div>
  );
}

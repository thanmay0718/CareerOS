import { ArrowRight, CalendarClock, CheckCircle2, Clock3, Flame, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/StatCard';
import { useAnalyticsSummary, useDashboardActivity, useDashboardStatistics } from '../hooks/useAnalytics';
import { useDashboard } from '../hooks/useDashboard';
import { useNotifications } from '../hooks/useNotifications';

function formatDate(value, includeTime = false) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
  }).format(new Date(value));
}

function getNotificationTone(notification) {
  if (notification.type === 'TASK_OVERDUE' || notification.type === 'CHECKIN_MISSING') {
    return 'border-red-500/30 bg-red-500/10 text-red-100';
  }

  if (notification.type === 'TASK_DUE_TOMORROW' || notification.type === 'PLAN_DEADLINE_NEAR') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
  }

  return 'border-sky-400/30 bg-sky-500/10 text-sky-100';
}

function ActivityCard({ activity }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
          {activity.type}
        </span>
        <span className="text-xs text-slate-500">{formatDate(activity.timestamp, true)}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-200">{activity.message}</p>
    </div>
  );
}

function NotificationCard({ notification, onOpen }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${getNotificationTone(notification)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] opacity-70">{notification.type}</div>
          <h3 className="mt-1 font-medium">{notification.title}</h3>
        </div>
        <span className="rounded-full border border-current px-3 py-1 text-xs">
          {notification.unread ? 'Unread' : 'Read'}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 opacity-90">{notification.message}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs opacity-80">
        <span>{formatDate(notification.createdAt, true)}</span>
        {notification.actionPath ? (
          <button
            type="button"
            onClick={() => onOpen(notification.actionPath)}
            className="inline-flex items-center gap-2 rounded-full border border-current/30 px-3 py-1 transition hover:bg-white/10"
          >
            {notification.actionLabel || 'Open'}
            <ArrowRight size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const dashboardActivityQuery = useDashboardActivity();
  const dashboardStatisticsQuery = useDashboardStatistics();
  const analyticsSummaryQuery = useAnalyticsSummary();
  const notificationsQuery = useNotifications();
  const navigate = useNavigate();

  const summaryCards = data?.summaryCards ?? [];
  const progressCards = data?.progressCards ?? [];
  const upcomingTasks = data?.upcomingTasks ?? { todayTasks: [], tomorrowTasks: [], upcomingDeadlines: [] };
  const notificationItems = notificationsQuery.data ?? [];
  const activityItems = dashboardActivityQuery.data ?? data?.recentActivity ?? [];
  const statisticItems = dashboardStatisticsQuery.data ?? [];
  const analyticsSummary = analyticsSummaryQuery.data;
  const emptyState = data?.emptyState;

  const activitySections = [
    {
      title: 'Today',
      items: upcomingTasks.todayTasks ?? [],
      emptyMessage: 'No tasks due today.',
    },
    {
      title: 'Tomorrow',
      items: upcomingTasks.tomorrowTasks ?? [],
      emptyMessage: 'No tasks due tomorrow.',
    },
    {
      title: 'Upcoming deadlines',
      items: upcomingTasks.upcomingDeadlines ?? [],
      emptyMessage: 'No upcoming deadlines.',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Career cockpit</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Every section below is fed from Spring Boot, PostgreSQL, and authenticated user data only.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Live source</div>
            <div className="mt-1 text-sm font-medium text-white">Backend aggregation + analytics</div>
          </div>
        </div>
      </header>

      {isError ? (
        <ApiAlert
          title="Dashboard unavailable"
          description={error?.response?.data?.message || error.message || 'Unable to load dashboard'}
          onRetry={refetch}
        />
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-slate-800/80 bg-slate-950/60 p-10">
          <Spinner label="Loading dashboard" />
        </div>
      ) : data?.hasData ? (
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/60 p-6 shadow-glow">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-sky-300">{data?.welcome?.greeting}</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">{data?.welcome?.userName}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Active plan: <span className="text-slate-100">{data?.welcome?.activePlan}</span>
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Career goal: <span className="text-slate-100">{data?.welcome?.careerGoal}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/plans')}
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
              >
                Open plans
                <ArrowRight size={16} />
              </button>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Today's summary</h2>
                <p className="mt-1 text-sm text-slate-400">Backend-calculated cards from the aggregated dashboard endpoint.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <StatCard key={card.label} label={card.label} value={card.value} highlight={card.highlight} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Progress</h2>
                <p className="mt-1 text-sm text-slate-400">Plan A, Plan B, and overall progress are all calculated in the backend.</p>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {progressCards.map((card) => (
                <div key={card.label} className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-glow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{card.label}</div>
                      <div className="mt-2 text-lg font-semibold text-white">{card.description}</div>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 text-lg font-semibold text-sky-200">
                      {card.percentage}%
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all"
                      style={{ width: `${card.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SectionCard title="Upcoming tasks">
              <div className="space-y-5">
                {activitySections.map((section) => (
                  <div key={section.title}>
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
                      {section.title === 'Today' ? <Clock3 size={16} /> : null}
                      {section.title === 'Tomorrow' ? <CalendarClock size={16} /> : null}
                      {section.title === 'Upcoming deadlines' ? <Target size={16} /> : null}
                      {section.title}
                    </div>
                    <div className="space-y-3">
                      {section.items.length ? (
                        section.items.map((task) => (
                          <div
                            key={task.id}
                            className={`rounded-2xl border px-4 py-3 ${
                              task.overdue
                                ? 'border-red-500/30 bg-red-500/10 text-red-100'
                                : task.status === 'COMPLETED'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                                  : 'border-slate-700 bg-slate-900/70 text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs uppercase tracking-[0.22em] opacity-70">{task.category}</div>
                                <h3 className="mt-1 font-medium text-white">{task.title}</h3>
                              </div>
                              <span className="rounded-full border border-current px-3 py-1 text-xs">{task.progressBadge}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs opacity-90">
                              <span className="rounded-full border border-current/30 px-3 py-1">{task.priority}</span>
                              <span className="rounded-full border border-current/30 px-3 py-1">{formatDate(task.dueDate)}</span>
                              {task.estimatedDurationMinutes ? (
                                <span className="rounded-full border border-current/30 px-3 py-1">{task.estimatedDurationMinutes} min</span>
                              ) : null}
                              {task.planName ? <span className="rounded-full border border-current/30 px-3 py-1">{task.planName}</span> : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
                          {section.emptyMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Notifications">
              <div className="space-y-3">
                {notificationsQuery.isLoading ? (
                  <Spinner label="Loading notifications" />
                ) : notificationItems.length ? (
                  notificationItems.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} onOpen={(path) => navigate(path)} />
                  ))
                ) : (
                  <EmptyState
                    title="No notifications"
                    description="Task reminders, overdue alerts, and check-in prompts will appear here when the backend creates them."
                    actionLabel="Open check-ins"
                    onActionClick={() => navigate('/check-ins')}
                  />
                )}
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Recent activity">
              <div className="space-y-3">
                {dashboardActivityQuery.isLoading ? (
                  <Spinner label="Loading activity" />
                ) : activityItems.length ? (
                  activityItems.map((activity) => <ActivityCard key={`${activity.type}-${activity.timestamp}`} activity={activity} />)
                ) : (
                  <EmptyState
                    title="No recent activity"
                    description="Create a plan, task, or check-in to start the activity feed."
                    actionLabel="Create task"
                    onActionClick={() => navigate('/tasks')}
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard title="Analytics foundation">
              {analyticsSummaryQuery.isLoading ? (
                <Spinner label="Loading analytics" />
              ) : analyticsSummary ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Completion rate</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{analyticsSummary.completionRate}%</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Current streak</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{analyticsSummary.currentStreak} days</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Study hours today</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{analyticsSummary.studyHours?.today ?? 0}h</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Study hours this week</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{analyticsSummary.studyHours?.week ?? 0}h</div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Task statistics</div>
                      <div className="mt-3 space-y-1 leading-6">
                        <p>Total: {analyticsSummary.taskStatistics.totalTasks}</p>
                        <p>Completed: {analyticsSummary.taskStatistics.completedTasks}</p>
                        <p>Pending: {analyticsSummary.taskStatistics.pendingTasks}</p>
                        <p>Overdue: {analyticsSummary.taskStatistics.overdueTasks}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Plan statistics</div>
                      <div className="mt-3 space-y-1 leading-6">
                        <p>Total: {analyticsSummary.planStatistics.totalPlans}</p>
                        <p>Active: {analyticsSummary.planStatistics.activePlans}</p>
                        <p>Completed: {analyticsSummary.planStatistics.completedPlans}</p>
                        <p>Archived: {analyticsSummary.planStatistics.archivedPlans}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Weekly activity</div>
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      {analyticsSummary.weeklyActivity?.slice(-4).map((point) => (
                        <div key={point.date} className="flex items-center justify-between gap-3">
                          <span>{formatDate(point.date)}</span>
                          <span>{point.tasksCompleted} tasks • {point.checkIns} check-ins • {point.studyHours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No analytics yet"
                  description="The backend will provide summary data as soon as tasks, plans, or check-ins are recorded."
                  actionLabel="Open plans"
                  onActionClick={() => navigate('/plans')}
                />
              )}
            </SectionCard>
          </section>

          <section>
            <SectionCard title="Dashboard statistics API">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {statisticItems.length ? statisticItems.map((item) => (
                  <StatCard key={item.label} label={item.label} value={item.value} highlight={item.highlight} />
                )) : (
                  <EmptyState
                    title="No statistics yet"
                    description="The dashboard statistics endpoint will populate this section once user activity exists."
                    actionLabel="Create task"
                    onActionClick={() => navigate('/tasks')}
                  />
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      ) : (
        <div className="grid gap-6">
          <EmptyState
            title={emptyState?.title || 'No career activity yet'}
            description={emptyState?.message || 'Create your first plan, task, or check-in to bring the dashboard to life.'}
            actionLabel={emptyState?.actionLabel || 'Create Plan'}
            onActionClick={() => navigate('/plans')}
          />

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-glow">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Next step</div>
              <h3 className="mt-3 text-lg font-semibold text-white">Create a career plan</h3>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-glow">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Next step</div>
              <h3 className="mt-3 text-lg font-semibold text-white">Add a focused task</h3>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-glow">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Next step</div>
              <h3 className="mt-3 text-lg font-semibold text-white">Log today’s check-in</h3>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

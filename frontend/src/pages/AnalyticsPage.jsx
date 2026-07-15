import { useMemo } from 'react';
import {
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/StatCard';
import {
  useAnalyticsCheckins,
  useAnalyticsOverview,
  useAnalyticsPlans,
  useAnalyticsProductivity,
  useAnalyticsStudy,
  useAnalyticsTasks,
} from '../hooks/useAnalytics';

const PIE_COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#f59e0b', '#f97316', '#f43f5e', '#60a5fa'];

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function HeatmapGrid({ heatmap }) {
  const cells = useMemo(() => heatmap ?? [], [heatmap]);
  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.date}
          title={`${formatDate(cell.date)} · ${cell.studyHours}h`}
          className={`aspect-square rounded-lg border ${
            cell.intensity === 0
              ? 'border-slate-800 bg-slate-950/40'
              : cell.intensity === 1
                ? 'border-sky-500/20 bg-sky-500/10'
                : cell.intensity === 2
                  ? 'border-sky-500/30 bg-sky-500/20'
                  : cell.intensity === 3
                    ? 'border-cyan-400/40 bg-cyan-400/30'
                    : 'border-emerald-400/40 bg-emerald-400/40'
          }`}
        />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const overviewQuery = useAnalyticsOverview();
  const studyQuery = useAnalyticsStudy();
  const tasksQuery = useAnalyticsTasks();
  const plansQuery = useAnalyticsPlans();
  const checkinsQuery = useAnalyticsCheckins();
  const productivityQuery = useAnalyticsProductivity();

  const isLoading = [
    overviewQuery,
    studyQuery,
    tasksQuery,
    plansQuery,
    checkinsQuery,
    productivityQuery,
  ].some((query) => query.isLoading);

  const firstError = [
    overviewQuery,
    studyQuery,
    tasksQuery,
    plansQuery,
    checkinsQuery,
    productivityQuery,
  ].find((query) => query.isError);

  const overview = overviewQuery.data;
  const study = studyQuery.data;
  const tasks = tasksQuery.data;
  const plans = plansQuery.data;
  const checkins = checkinsQuery.data;
  const productivity = productivityQuery.data;

  const overviewCards = [
    { label: 'Overall Career Score', value: overview?.overallCareerScore ?? 0, suffix: '%' },
    { label: 'Plan Completion', value: overview?.planCompletion ?? 0, suffix: '%' },
    { label: 'Task Completion', value: overview?.taskCompletion ?? 0, suffix: '%' },
    { label: 'Study Consistency', value: overview?.studyConsistency ?? 0, suffix: '%' },
    { label: 'Weekly Productivity', value: overview?.weeklyProductivity ?? 0, suffix: '%' },
    { label: 'Monthly Productivity', value: overview?.monthlyProductivity ?? 0, suffix: '%' },
    { label: 'Placement Readiness', value: overview?.placementReadiness ?? 0, suffix: '%' },
    { label: 'Resume Readiness', value: overview?.resumeReadiness ?? 0, suffix: '%' },
    { label: 'Interview Readiness', value: overview?.interviewReadiness ?? 0, suffix: '%' },
    { label: 'Learning Progress', value: overview?.learningProgress ?? 0, suffix: '%' },
  ];

  const taskCategoryChart = tasks?.taskCategoryDistribution ?? [];
  const planProgress = plans?.planProgress ?? [];
  const weeklyStudy = study?.weeklyStudyHours ?? [];
  const monthlyStudy = study?.monthlyStudyHours ?? [];
  const heatmap = study?.heatmap ?? [];
  const dailyTasks = tasks?.dailyCompletedTasks ?? [];
  const weeklyTasks = tasks?.weeklyCompletedTasks ?? [];
  const monthlyTasks = tasks?.monthlyCompletedTasks ?? [];

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Analytics</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Placement intelligence</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          All metrics, charts, and readiness scores come from authenticated backend analytics APIs.
        </p>
      </header>

      {firstError ? (
        <ApiAlert
          title="Analytics unavailable"
          description={firstError.error?.response?.data?.message || firstError.error?.message || 'Unable to load analytics'}
          onRetry={() => {
            overviewQuery.refetch();
            studyQuery.refetch();
            tasksQuery.refetch();
            plansQuery.refetch();
            checkinsQuery.refetch();
            productivityQuery.refetch();
          }}
        />
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-slate-800/80 bg-slate-950/60 p-10">
          <Spinner label="Loading analytics" />
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Overview</h2>
                <p className="mt-1 text-sm text-slate-400">Backend-calculated career and readiness metrics.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map((card) => (
                <StatCard key={card.label} label={card.label} value={`${card.value}${card.suffix}`} highlight={card.value >= 70} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Weekly study hours">
              {weeklyStudy.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={weeklyStudy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip labelFormatter={formatDate} />
                    <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No study data" description="Add check-ins to populate weekly study hours." actionLabel="Open check-ins" onActionClick={() => navigate('/check-ins')} />
              )}
            </SectionCard>

            <SectionCard title="Monthly study hours">
              {monthlyStudy.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyStudy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip labelFormatter={formatDate} />
                    <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No monthly study data" description="Longer check-in history will appear here." actionLabel="Open check-ins" onActionClick={() => navigate('/check-ins')} />
              )}
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="Completed tasks trend">
              <div className="space-y-6">
                <div>
                  <div className="mb-2 text-sm text-slate-400">Daily</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={dailyTasks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip labelFormatter={formatDate} />
                      <Bar dataKey="value" fill="#38bdf8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm text-slate-400">Weekly</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={weeklyTasks}>
                        <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip labelFormatter={formatDate} />
                        <Bar dataKey="value" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <div className="mb-2 text-sm text-slate-400">Monthly</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={monthlyTasks}>
                        <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip labelFormatter={formatDate} />
                        <Bar dataKey="value" fill="#a78bfa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Task category distribution">
              {taskCategoryChart.length ? (
                <ResponsiveContainer width="100%" height={360}>
                  <PieChart>
                    <Pie data={taskCategoryChart} dataKey="count" nameKey="category" innerRadius={70} outerRadius={120} paddingAngle={4}>
                      {taskCategoryChart.map((entry, index) => (
                        <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No task distribution yet" description="Task categories will appear after tasks are created." actionLabel="Create task" onActionClick={() => navigate('/tasks')} />
              )}
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Plan progress">
              {planProgress.length ? (
                <div className="space-y-4">
                  {planProgress.map((plan) => (
                    <div key={plan.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{plan.planType}</div>
                          <h3 className="mt-1 text-lg font-semibold text-white">{plan.planName}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-sky-200">{plan.progressPercentage}%</div>
                          <div className="text-xs text-slate-400">{plan.status}</div>
                        </div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" style={{ width: `${plan.progressPercentage}%` }} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                        <span>Remaining days: {plan.remainingDays}</span>
                        <span>Completed: {plan.completedTasks}</span>
                        <span>Total: {plan.totalTasks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No plans yet" description="Plan progress appears after you create career plans." actionLabel="Create plan" onActionClick={() => navigate('/plans')} />
              )}
            </SectionCard>

            <SectionCard title="Check-in heatmap">
              {heatmap.length ? (
                <div className="space-y-4">
                  <HeatmapGrid heatmap={heatmap} />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Check-ins</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{checkins?.totalCheckIns ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Average study hours</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{checkins?.averageStudyHours ?? 0}h</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Current streak</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{productivity?.currentStreak ?? 0} days</div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState title="No heatmap yet" description="Daily check-ins will populate the heatmap grid automatically." actionLabel="Open check-ins" onActionClick={() => navigate('/check-ins')} />
              )}
            </SectionCard>
          </section>
        </div>
      )}
    </div>
  );
}

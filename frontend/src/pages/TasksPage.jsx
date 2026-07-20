import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle2, Edit3, Filter, History, Search, Trash2, X } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import {
  useCompleteTask,
  useCreateTask,
  useDeleteTask,
  useMissedTaskInsights,
  useMissTask,
  useTaskTimeline,
  useTasks,
  useUpdateTask,
} from '../hooks/useTasks';
import { usePlans } from '../hooks/usePlans';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

const emptyFormValues = {
  title: '',
  description: '',
  category: 'OTHER',
  planId: '',
  planType: 'BOTH',
  priority: 'MEDIUM',
  status: 'TODO',
  dueDate: '',
  estimatedDurationMinutes: '',
  notes: '',
  reminderTimes: '',
  browserReminderEnabled: false,
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

const missedReasons = [
  ['FORGOT', 'Forgot'],
  ['TOO_DIFFICULT', 'Too difficult'],
  ['BUSY_SCHEDULE', 'Busy schedule'],
  ['HIGHER_PRIORITY_WORK', 'Higher priority work'],
  ['PERSONAL_REASON', 'Personal reason'],
  ['OTHER', 'Other'],
];

function TaskCard({ task, onComplete, onMiss, onEdit, onDelete }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {task.category} {task.planName ? `• ${task.planName}` : ''}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-white">{task.title}</h3>
          {task.description ? <p className="mt-3 text-sm leading-6 text-slate-400">{task.description}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
            {task.status}
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
            {task.progressBadge}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority</div>
          <div className="mt-1 text-slate-100">{task.priority}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Due date</div>
          <div className="mt-1 text-slate-100">{formatDate(task.dueDate)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated duration</div>
          <div className="mt-1 text-slate-100">{task.estimatedDurationMinutes ? `${task.estimatedDurationMinutes} min` : '—'}</div>
        </div>
      </div>

      {task.notes ? <p className="mt-4 text-sm leading-6 text-slate-400">{task.notes}</p> : null}
      {task.reminderTimes ? <p className="mt-3 text-xs text-slate-400">Reminders: {task.reminderTimes}</p> : null}
      {task.missedReason ? (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3 text-sm text-amber-100">
          Missed reason: {task.missedReason}
          {task.missedReasonDetail ? <span className="text-amber-100/80"> - {task.missedReasonDetail}</span> : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {task.status !== 'COMPLETED' ? (
          <button
            type="button"
            onClick={() => onComplete(task.id)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/25"
          >
            <CheckCircle2 size={16} />
            Complete
          </button>
        ) : null}
        {task.overdue && task.status !== 'COMPLETED' && task.status !== 'MISSED' ? (
          <button
            type="button"
            onClick={() => onMiss(task)}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-500/25"
          >
            <AlertCircle size={16} />
            Explain miss
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          <Edit3 size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/10"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    planId: '',
    page: 0,
    size: 6,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    planId: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [missedTask, setMissedTask] = useState(null);
  const [missedReason, setMissedReason] = useState('FORGOT');
  const [missedDetail, setMissedDetail] = useState('');
  const [showAllTaskHistory, setShowAllTaskHistory] = useState(false);

  const tasksQuery = useTasks(filters);
  const timelineQuery = useTaskTimeline();
  const missedInsightsQuery = useMissedTaskInsights();
  const plansQuery = usePlans();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const completeTaskMutation = useCompleteTask();
  const missTaskMutation = useMissTask();
  const deleteTaskMutation = useDeleteTask();

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: emptyFormValues,
  });

  const taskPage = tasksQuery.data;
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const editingTask = taskPage?.items?.find((task) => task.id === editingTaskId) ?? null;

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters((current) => ({
      ...current,
      ...pendingFilters,
      page: 0,
    }));
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      status: '',
      priority: '',
      category: '',
      planId: '',
    };
    setPendingFilters(cleared);
    setFilters((current) => ({ ...current, ...cleared, page: 0 }));
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    reset({
      title: task.title || '',
      description: task.description || '',
      category: task.category || 'OTHER',
      planId: task.planId || '',
      planType: task.planType || 'BOTH',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'TODO',
      dueDate: task.dueDate || '',
      estimatedDurationMinutes: task.estimatedDurationMinutes || '',
      notes: task.notes || '',
      reminderTimes: task.reminderTimes || '',
      browserReminderEnabled: Boolean(task.browserReminderEnabled),
    });
  };

  const clearEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
    reset(emptyFormValues);
  };

  const onSubmit = async (values) => {
    setSubmitError('');
    const payload = {
      ...values,
      planId: values.planId ? Number(values.planId) : null,
      description: values.description || null,
      dueDate: values.dueDate || null,
      estimatedDurationMinutes: values.estimatedDurationMinutes ? Number(values.estimatedDurationMinutes) : null,
      notes: values.notes || null,
      status: values.status || null,
      reminderTimes: values.reminderTimes || null,
      browserReminderEnabled: Boolean(values.browserReminderEnabled),
    };

    try {
      if (editingTaskId) {
        await updateTaskMutation.mutateAsync({ taskId: editingTaskId, payload });
      } else {
        await createTaskMutation.mutateAsync(payload);
      }
      clearEdit();
    } catch (mutationError) {
      const validationErrors = getApiValidationErrors(mutationError);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });
      } else {
        setSubmitError(getApiErrorMessage(mutationError));
      }
    }
  };

  const handleComplete = async (taskId) => {
    await completeTaskMutation.mutateAsync(taskId);
  };

  const submitMissedReason = async () => {
    if (!missedTask) {
      return;
    }
    await missTaskMutation.mutateAsync({
      taskId: missedTask.id,
      payload: {
        reason: missedReason,
        detail: missedDetail || null,
      },
    });
    setMissedTask(null);
    setMissedReason('FORGOT');
    setMissedDetail('');
  };

  const handleDelete = async (taskId) => {
    await deleteTaskMutation.mutateAsync(taskId);
    if (editingTaskId === taskId) {
      clearEdit();
    }
  };

  const totalPages = taskPage?.totalPages ?? 0;
  const currentPage = taskPage?.page ?? 0;
  const taskHistoryItems = timelineQuery.data ?? [];
  const visibleTaskHistoryItems = showAllTaskHistory ? taskHistoryItems : taskHistoryItems.slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="premium-page-header rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Tasks</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Career tasks</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Search, filter, paginate, and update tasks without any client-side business logic.
        </p>
      </header>

      <SectionCard title="Task filters">
        <form className="grid gap-4 lg:grid-cols-5" onSubmit={applyFilters}>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Search</span>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <Search size={16} className="text-slate-500" />
              <input
                value={pendingFilters.search}
                onChange={(event) => setPendingFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search title or notes"
                className="w-full bg-transparent text-slate-100 outline-none"
              />
            </div>
          </label>

          {[
            ['status', 'Status', ['', 'All'], ['TODO', 'Todo'], ['IN_PROGRESS', 'In progress'], ['COMPLETED', 'Completed']],
            ['priority', 'Priority', ['', 'All'], ['LOW', 'Low'], ['MEDIUM', 'Medium'], ['HIGH', 'High'], ['CRITICAL', 'Critical']],
            ['category', 'Category', ['', 'All'], ['DSA', 'DSA'], ['JAVA', 'Java'], ['SPRING_BOOT', 'Spring Boot'], ['REACT', 'React'], ['RESUME', 'Resume'], ['INTERVIEW', 'Interview'], ['PROJECTS', 'Projects'], ['DATABASE', 'Database'], ['SYSTEM_DESIGN', 'System Design'], ['NETWORKING', 'Networking'], ['OTHER', 'Other']],
          ].map(([key, label, ...options]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm text-slate-300">{label}</span>
              <select
                value={pendingFilters[key]}
                onChange={(event) => setPendingFilters((current) => ({ ...current, [key]: event.target.value }))}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              >
                {options.map(([value, optionLabel]) => (
                  <option key={optionLabel} value={value}>
                    {optionLabel}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Plan</span>
            <select
              value={pendingFilters.planId}
              onChange={(event) => setPendingFilters((current) => ({ ...current, planId: event.target.value }))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="">All</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.planName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Sort by</span>
            <select
              value={filters.sortBy}
              onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="createdAt">Created</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Direction</span>
            <select
              value={filters.sortDirection}
              onChange={(event) => setFilters((current) => ({ ...current, sortDirection: event.target.value }))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Page size</span>
            <select
              value={filters.size}
              onChange={(event) => setFilters((current) => ({ ...current, size: Number(event.target.value), page: 0 }))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </label>

          <div className="flex items-end gap-3 lg:col-span-5">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400"
            >
              <Filter size={16} />
              Apply filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </form>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title={editingTask ? `Edit task: ${editingTitle}` : 'Create task'}>
          {submitError ? <div className="mb-4"><ApiAlert title="Save failed" description={submitError} /></div> : null}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Title</span>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              />
              {errors.title ? <p className="mt-2 text-sm text-red-300">{errors.title.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Description</span>
              <textarea
                rows="4"
                {...register('description')}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Category</span>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="DSA">DSA</option>
                  <option value="JAVA">Java</option>
                  <option value="SPRING_BOOT">Spring Boot</option>
                  <option value="REACT">React</option>
                  <option value="RESUME">Resume</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="PROJECTS">Projects</option>
                  <option value="DATABASE">Database</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="NETWORKING">Networking</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Plan</span>
                <select
                  {...register('planId')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="">No plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.planName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Plan type</span>
                <select
                  {...register('planType')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="PLAN_A">Plan A</option>
                  <option value="PLAN_B">Plan B</option>
                  <option value="BOTH">Both</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Priority</span>
                <select
                  {...register('priority')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Status</span>
                <select
                  {...register('status')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Due date</span>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Estimated duration (minutes)</span>
                <input
                  type="number"
                  min="0"
                  {...register('estimatedDurationMinutes')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Notes</span>
                <textarea
                  rows="3"
                  {...register('notes')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Reminder times</span>
                <input
                  placeholder="09:00, 18:30"
                  {...register('reminderTimes')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                <input type="checkbox" {...register('browserReminderEnabled')} />
                Browser reminders enabled by backend status
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting || createTaskMutation.isPending || updateTaskMutation.isPending}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting || createTaskMutation.isPending || updateTaskMutation.isPending ? (
                  <Spinner label={editingTask ? 'Updating task' : 'Saving task'} />
                ) : (
                  editingTask ? 'Update task' : 'Save task'
                )}
              </button>
              {editingTask ? (
                <button
                  type="button"
                  onClick={clearEdit}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-3 font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Saved tasks">
          {tasksQuery.isError ? (
            <ApiAlert
              title="Unable to load tasks"
              description={getApiErrorMessage(tasksQuery.error)}
              onRetry={tasksQuery.refetch}
            />
          ) : tasksQuery.isLoading ? (
            <Spinner label="Loading tasks" />
          ) : taskPage?.items?.length ? (
            <div className="space-y-4">
              {taskPage.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onMiss={setMissedTask}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              ))}

              {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => setFilters((current) => ({ ...current, page: Math.max(0, current.page - 1) }))}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="text-sm text-slate-400">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <button
                    type="button"
                    disabled={!taskPage.hasNext}
                    onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState
              title="No tasks found."
              description="Create a focused task or clear the active filters to see the full workspace."
              actionLabel="Clear filters"
              onActionClick={clearFilters}
            />
          )}
        </SectionCard>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Missed task insights">
          {missedInsightsQuery.isLoading ? (
            <Spinner label="Loading missed task insights" />
          ) : missedInsightsQuery.data?.length ? (
            <div className="space-y-3">
              {missedInsightsQuery.data.map((insight) => (
                <div key={insight.reason} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs font-semibold text-slate-400">Last 30 days</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">{insight.reason}</span>
                    <span className="text-2xl font-bold text-white">{insight.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No missed-task patterns yet" description="When overdue tasks are explained, behavior insights will appear here." />
          )}
        </SectionCard>

        <SectionCard title="Task history timeline">
          {timelineQuery.isLoading ? (
            <Spinner label="Loading task history" />
          ) : taskHistoryItems.length ? (
            <div className="space-y-3">
              {visibleTaskHistoryItems.map((event) => (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 grid h-8 w-8 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-100">
                      <History size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold text-white">{event.taskTitle}</h3>
                        <span className="text-xs text-slate-500">{formatDate(event.occurredAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{event.eventType}</p>
                      {event.missedReason ? <p className="mt-2 text-sm text-amber-100">Reason: {event.missedReason}</p> : null}
                      {event.detail ? <p className="mt-2 text-sm leading-6 text-slate-400">{event.detail}</p> : null}
                    </div>
                  </div>
                </article>
              ))}
              {taskHistoryItems.length > visibleTaskHistoryItems.length ? (
                <button
                  type="button"
                  onClick={() => setShowAllTaskHistory(true)}
                  className="stitch-button-secondary w-full rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Show more
                </button>
              ) : null}
            </div>
          ) : (
            <EmptyState title="No task history yet" description="Completed, missed, updated, and rescheduled task events will appear here." />
          )}
        </SectionCard>
      </section>

      {missedTask ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 px-4 backdrop-blur" role="dialog" aria-modal="true">
          <div className="liquid-glass w-full max-w-lg rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-amber-200">You missed</div>
                <h2 className="mt-2 text-2xl font-bold text-white">{missedTask.title}</h2>
                <p className="mt-2 text-sm text-slate-400">Why was this not completed?</p>
              </div>
              <button type="button" onClick={() => setMissedTask(null)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/10">
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {missedReasons.map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                  <input
                    type="radio"
                    name="missedReason"
                    value={value}
                    checked={missedReason === value}
                    onChange={(event) => setMissedReason(event.target.value)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm text-slate-300">Optional detail</span>
              <textarea value={missedDetail} onChange={(event) => setMissedDetail(event.target.value)} rows="3" className="w-full rounded-2xl px-4 py-3" />
            </label>

            <button
              type="button"
              onClick={submitMissedReason}
              disabled={missTaskMutation.isPending}
              className="stitch-button mt-4 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {missTaskMutation.isPending ? 'Saving reason...' : 'Save missed reason'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

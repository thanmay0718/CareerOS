import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Trash2, Archive } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { useArchivePlan, useCreatePlan, useDeletePlan, usePlans, useUpdatePlan } from '../hooks/usePlans';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

const emptyFormValues = {
  planType: 'PLAN_A',
  title: '',
  description: '',
  targetRole: '',
  targetPackage: '',
  targetCompanies: '',
  expectedStartDate: '',
  expectedEndDate: '',
  priority: 'MEDIUM',
  status: 'ACTIVE',
  notes: '',
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

function PlanCard({ plan, onEdit, onDelete, onArchive }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{plan.planType}</div>
          <h3 className="mt-2 text-xl font-semibold text-white">{plan.planName}</h3>
          {plan.description ? <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-200">
            {plan.progressPercentage}%
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
            {plan.status}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Target role</div>
          <div className="mt-1 text-slate-100">{plan.targetRole || '—'}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Target package</div>
          <div className="mt-1 text-slate-100">{plan.targetPackage || '—'}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Remaining days</div>
          <div className="mt-1 text-slate-100">{plan.remainingDays}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Tasks</div>
          <div className="mt-1 text-slate-100">{plan.totalTasks}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Completed</div>
          <div className="mt-1 text-slate-100">{plan.completedTasks}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Overdue</div>
          <div className="mt-1 text-slate-100">{plan.overdueTasks}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
        <div>Companies: {plan.targetCompanies || '—'}</div>
        <div>Priority: {plan.priority || '—'}</div>
        <div>Start: {formatDate(plan.expectedStartDate)}</div>
        <div>End: {formatDate(plan.expectedEndDate)}</div>
      </div>

      {plan.notes ? <p className="mt-4 text-sm leading-6 text-slate-400">{plan.notes}</p> : null}

      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
          style={{ width: `${plan.progressPercentage}%` }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(plan)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          <Edit3 size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onArchive(plan.id)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          <Archive size={16} />
          Archive
        </button>
        <button
          type="button"
          onClick={() => onDelete(plan.id)}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/10"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const { data, isLoading, isError, error, refetch } = usePlans();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const archivePlanMutation = useArchivePlan();
  const deletePlanMutation = useDeletePlan();
  const [submitError, setSubmitError] = useState('');
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: emptyFormValues,
  });

  const plans = useMemo(() => data ?? [], [data]);
  const editingPlan = plans.find((plan) => plan.id === editingPlanId) ?? null;

  const startEdit = (plan) => {
    setEditingPlanId(plan.id);
    setEditingTitle(plan.planName);
    reset({
      planType: plan.planType || 'PLAN_A',
      title: plan.planName || '',
      description: plan.description || '',
      targetRole: plan.targetRole || '',
      targetPackage: plan.targetPackage || '',
      targetCompanies: plan.targetCompanies || '',
      expectedStartDate: plan.expectedStartDate || '',
      expectedEndDate: plan.expectedEndDate || '',
      priority: plan.priority || 'MEDIUM',
      status: plan.status || 'ACTIVE',
      notes: plan.notes || '',
    });
  };

  const clearEdit = () => {
    setEditingPlanId(null);
    setEditingTitle('');
    reset(emptyFormValues);
  };

  const onSubmit = async (values) => {
    setSubmitError('');
    const payload = {
      ...values,
      description: values.description || null,
      targetRole: values.targetRole || null,
      targetPackage: values.targetPackage || null,
      targetCompanies: values.targetCompanies || null,
      expectedStartDate: values.expectedStartDate || null,
      expectedEndDate: values.expectedEndDate || null,
      notes: values.notes || null,
      status: values.status || null,
    };

    try {
      if (editingPlanId) {
        await updatePlanMutation.mutateAsync({ planId: editingPlanId, payload });
      } else {
        await createPlanMutation.mutateAsync(payload);
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

  const handleArchive = async (planId) => {
    await archivePlanMutation.mutateAsync(planId);
    if (editingPlanId === planId) {
      clearEdit();
    }
  };

  const handleDelete = async (planId) => {
    await deletePlanMutation.mutateAsync(planId);
    if (editingPlanId === planId) {
      clearEdit();
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Plans</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Career plans</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Build and manage live plans with backend-calculated progress, task counts, and remaining days.
        </p>
      </header>

      {isError ? (
        <ApiAlert
          title="Unable to load plans"
          description={getApiErrorMessage(error)}
          onRetry={refetch}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title={editingPlan ? `Edit plan: ${editingTitle}` : 'Create plan'}>
          {submitError ? <div className="mb-4"><ApiAlert title="Save failed" description={submitError} /></div> : null}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Plan type</span>
                <select
                  {...register('planType', { required: 'Plan type is required' })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="PLAN_A">Plan A</option>
                  <option value="PLAN_B">Plan B</option>
                  <option value="BOTH">Both</option>
                </select>
                {errors.planType ? <p className="mt-2 text-sm text-red-300">{errors.planType.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Status</span>
                <select
                  {...register('status')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Plan name</span>
              <input
                {...register('title', { required: 'Plan name is required' })}
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
                <span className="mb-2 block text-sm text-slate-300">Target role</span>
                <input
                  {...register('targetRole')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Target package</span>
                <input
                  {...register('targetPackage')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Target companies</span>
              <input
                {...register('targetCompanies')}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Expected start date</span>
                <input
                  type="date"
                  {...register('expectedStartDate')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Expected end date</span>
                <input
                  type="date"
                  {...register('expectedEndDate')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Notes</span>
                <textarea
                  rows="3"
                  {...register('notes')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting || createPlanMutation.isPending || updatePlanMutation.isPending}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting || createPlanMutation.isPending || updatePlanMutation.isPending ? (
                  <Spinner label={editingPlan ? 'Updating plan' : 'Saving plan'} />
                ) : (
                  editingPlan ? 'Update plan' : 'Save plan'
                )}
              </button>
              {editingPlan ? (
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

        <SectionCard title="Saved plans">
          {isLoading ? (
            <Spinner label="Loading plans" />
          ) : plans.length ? (
            <div className="space-y-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={startEdit}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No plans found."
              description="Create your first career plan to define the next target role and timeline."
              actionLabel="Create Plan"
              onActionClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

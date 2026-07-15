import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Flame, Sparkles } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { useRecentCheckIns, useSaveTodayCheckIn, useTodayCheckIn } from '../hooks/useCheckIns';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

const defaultValues = {
  studyHours: '',
  problemsSolved: '',
  mood: '',
  energy: 5,
  confidence: 5,
  todaysAchievement: '',
  todaysBlocker: '',
  tomorrowGoal: '',
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

export default function CheckInsPage() {
  const todayCheckInQuery = useTodayCheckIn();
  const recentCheckInsQuery = useRecentCheckIns();
  const saveTodayCheckInMutation = useSaveTodayCheckIn();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (todayCheckInQuery.data) {
      reset({
        studyHours: todayCheckInQuery.data.studyHours ?? '',
        problemsSolved: todayCheckInQuery.data.problemsSolved ?? '',
        mood: todayCheckInQuery.data.mood ?? '',
        energy: todayCheckInQuery.data.energy ?? 5,
        confidence: todayCheckInQuery.data.confidence ?? 5,
        todaysAchievement: todayCheckInQuery.data.todaysAchievement ?? '',
        todaysBlocker: todayCheckInQuery.data.todaysBlocker ?? '',
        tomorrowGoal: todayCheckInQuery.data.tomorrowGoal ?? '',
        notes: todayCheckInQuery.data.notes ?? '',
      });
    }
  }, [reset, todayCheckInQuery.data]);

  const onSubmit = async (values) => {
    try {
      await saveTodayCheckInMutation.mutateAsync({
        ...values,
        studyHours: values.studyHours === '' ? 0 : Number(values.studyHours),
        problemsSolved: values.problemsSolved === '' ? 0 : Number(values.problemsSolved),
        energy: Number(values.energy),
        confidence: Number(values.confidence),
        mood: values.mood || null,
        todaysAchievement: values.todaysAchievement || null,
        todaysBlocker: values.todaysBlocker || null,
        tomorrowGoal: values.tomorrowGoal || null,
        notes: values.notes || null,
      });
    } catch (mutationError) {
      const validationErrors = getApiValidationErrors(mutationError);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });
      }
    }
  };

  const recentCheckIns = recentCheckInsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Check-ins</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Daily consistency tracker</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          One check-in per day. If today already exists, this form edits that record instead of creating a duplicate.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Today's check-in">
          {todayCheckInQuery.isError ? (
            <ApiAlert
              title="Unable to load today's check-in"
              description={getApiErrorMessage(todayCheckInQuery.error)}
              onRetry={todayCheckInQuery.refetch}
            />
          ) : null}
          {saveTodayCheckInMutation.isError ? (
            <div className="mb-4">
              <ApiAlert
                title="Save failed"
                description={getApiErrorMessage(saveTodayCheckInMutation.error)}
              />
            </div>
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Study hours</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  {...register('studyHours', { required: 'Study hours is required' })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
                {errors.studyHours ? <p className="mt-2 text-sm text-red-300">{errors.studyHours.message}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Problems solved</span>
                <input
                  type="number"
                  min="0"
                  {...register('problemsSolved', { required: 'Problems solved is required' })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
                {errors.problemsSolved ? <p className="mt-2 text-sm text-red-300">{errors.problemsSolved.message}</p> : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Mood</span>
                <input
                  {...register('mood')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Energy</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  {...register('energy', { required: 'Energy is required' })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Confidence</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  {...register('confidence', { required: 'Confidence is required' })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Today's achievement</span>
                <textarea
                  rows="3"
                  {...register('todaysAchievement')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Today's blocker</span>
                <textarea
                  rows="3"
                  {...register('todaysBlocker')}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Tomorrow goal</span>
                <textarea
                  rows="3"
                  {...register('tomorrowGoal')}
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

            <button
              type="submit"
              disabled={isSubmitting || saveTodayCheckInMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting || saveTodayCheckInMutation.isPending ? <Spinner label="Saving check-in" /> : <><Sparkles size={16} /> Save today&apos;s check-in</>}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Recent check-ins">
          {recentCheckInsQuery.isError ? (
            <ApiAlert
              title="Unable to load recent check-ins"
              description={getApiErrorMessage(recentCheckInsQuery.error)}
              onRetry={recentCheckInsQuery.refetch}
            />
          ) : recentCheckInsQuery.isLoading ? (
            <Spinner label="Loading check-ins" />
          ) : recentCheckIns.length ? (
            <div className="space-y-4">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{formatDate(checkIn.checkInDate)}</div>
                      <h3 className="mt-2 text-lg font-semibold text-white">Study session</h3>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-sm text-sky-200">
                      <Flame size={16} />
                      {checkIn.studyHours ?? 0}h
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <div>Problems solved: {checkIn.problemsSolved ?? 0}</div>
                    <div>Mood: {checkIn.mood || '—'}</div>
                    <div>Energy: {checkIn.energy ?? 0}/10</div>
                    <div>Confidence: {checkIn.confidence ?? 0}/10</div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                    <p><span className="text-slate-200">Achievement:</span> {checkIn.todaysAchievement || '—'}</p>
                    <p><span className="text-slate-200">Blocker:</span> {checkIn.todaysBlocker || '—'}</p>
                    <p><span className="text-slate-200">Tomorrow:</span> {checkIn.tomorrowGoal || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No check-ins yet"
              description="Log today's study progress to start building consistency data."
              actionLabel="Fill today’s check-in"
              onActionClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

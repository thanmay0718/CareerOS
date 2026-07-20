import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Battery, Flame, Smile, Sparkles, Star } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { useRecentCheckIns, useSaveTodayCheckIn, useTodayCheckIn } from '../hooks/useCheckIns';
import { useRewardProfile } from '../hooks/useRewards';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

const defaultValues = {
  studyHours: '',
  problemsSolved: '',
  mood: '',
  productivityRating: 3,
  energyLevel: 'MEDIUM',
  energy: 5,
  confidence: 5,
  todaysAchievement: '',
  todaysBlocker: '',
  tomorrowGoal: '',
  notes: '',
};

function formatDate(value) {
  if (!value) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function moodLabel(value) {
  if (value === 'HAPPY') return 'Happy';
  if (value === 'NEUTRAL') return 'Neutral';
  if (value === 'LOW') return 'Low';
  return value || 'Not recorded';
}

export default function CheckInsPage() {
  const [showAllCheckIns, setShowAllCheckIns] = useState(false);
  const todayCheckInQuery = useTodayCheckIn();
  const recentCheckInsQuery = useRecentCheckIns();
  const rewardProfileQuery = useRewardProfile();
  const saveTodayCheckInMutation = useSaveTodayCheckIn();
  const { register, handleSubmit, reset, setError, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues,
  });

  const productivityRating = Number(watch('productivityRating') || 0);
  const mood = watch('mood');
  const energyLevel = watch('energyLevel');

  useEffect(() => {
    if (todayCheckInQuery.data) {
      reset({
        studyHours: todayCheckInQuery.data.studyHours ?? '',
        problemsSolved: todayCheckInQuery.data.problemsSolved ?? '',
        mood: todayCheckInQuery.data.mood ?? '',
        productivityRating: todayCheckInQuery.data.productivityRating ?? 3,
        energyLevel: todayCheckInQuery.data.energyLevel ?? 'MEDIUM',
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
        productivityRating: Number(values.productivityRating),
        energyLevel: values.energyLevel || null,
        energy: values.energyLevel === 'HIGH' ? 9 : values.energyLevel === 'LOW' ? 3 : 6,
        confidence: Number(values.productivityRating) * 2,
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
  const visibleCheckIns = showAllCheckIns ? recentCheckIns : recentCheckIns.slice(0, 3);
  const rewards = rewardProfileQuery.data;

  return (
    <div className="space-y-6">
      <header className="premium-page-header rounded-2xl p-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300">
          <Sparkles size={15} />
          Daily check-in
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white">Close today with intent</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Productivity, mood, energy, study time, achievements, challenges, and tomorrow goals are stored in the backend.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rewardProfileQuery.isLoading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
        ) : rewards ? (
          <>
            <div className="stitch-panel rounded-2xl p-4">
              <div className="text-xs font-semibold text-slate-400">Today's Productivity</div>
              <div className="mt-2 text-3xl font-bold text-white">{rewards.productivityScore} / 100</div>
              <p className="mt-1 text-sm text-emerald-200">{rewards.productivityLabel}</p>
            </div>
            <div className="stitch-panel rounded-2xl p-4">
              <div className="text-xs font-semibold text-slate-400">Coins</div>
              <div className="mt-2 text-3xl font-bold text-white">{rewards.coins}</div>
              <p className="mt-1 text-sm text-slate-400">Backend reward balance</p>
            </div>
            <div className="stitch-panel rounded-2xl p-4">
              <div className="text-xs font-semibold text-slate-400">Level</div>
              <div className="mt-2 text-3xl font-bold text-white">{rewards.level}</div>
              <p className="mt-1 text-sm text-slate-400">{rewards.xpRemainingToNextLevel} XP to next</p>
            </div>
            <div className="stitch-panel rounded-2xl p-4">
              <div className="text-xs font-semibold text-slate-400">Weekly Change</div>
              <div className="mt-2 text-3xl font-bold text-white">{rewards.weeklyImprovement > 0 ? '+' : ''}{rewards.weeklyImprovement}%</div>
              <p className="mt-1 text-sm text-slate-400">Compared to last week</p>
            </div>
          </>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="How productive were you today?">
          {todayCheckInQuery.isError ? (
            <div className="mb-5 overflow-hidden rounded-2xl border border-indigo-200/[0.18] bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(255,255,255,0.055)_48%,rgba(56,189,248,0.10))] p-5 text-left shadow-[0_18px_54px_rgba(99,102,241,0.14)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-indigo-200/[0.18] bg-indigo-500/[0.16] text-indigo-100 shadow-[0_0_24px_rgba(99,102,241,0.22)]">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Ready when you are</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      I could not find today&apos;s saved check-in yet. Tell me how your day went and I&apos;ll sync it for you.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={todayCheckInQuery.refetch}
                  className="shrink-0 rounded-full border border-indigo-200/20 bg-white/[0.055] px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/15 hover:text-white"
                >
                  Sync again
                </button>
              </div>
            </div>
          ) : null}
          {saveTodayCheckInMutation.isError ? (
            <div className="mb-4">
              <ApiAlert title="Save failed" description={getApiErrorMessage(saveTodayCheckInMutation.error)} />
            </div>
          ) : null}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <div className="mb-3 text-sm font-semibold text-slate-300">Productivity</div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('productivityRating', value, { shouldDirty: true })}
                    className={`grid h-12 w-12 place-items-center rounded-2xl border transition ${productivityRating >= value ? 'border-amber-300/40 bg-amber-500/20 text-amber-100' : 'border-white/10 bg-white/[0.04] text-slate-500'}`}
                    aria-label={`Set productivity ${value}`}
                  >
                    <Star size={20} fill={productivityRating >= value ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('productivityRating', { required: 'Productivity is required' })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Smile size={16} />
                  Mood
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['HAPPY', ':)'],
                    ['NEUTRAL', ':|'],
                    ['LOW', ':('],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('mood', value, { shouldDirty: true })}
                      className={`rounded-2xl border px-4 py-3 text-lg transition ${mood === value ? 'border-indigo-300/40 bg-indigo-500/20 text-white' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('mood')} />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Battery size={16} />
                  Energy level
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['HIGH', 'MEDIUM', 'LOW'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('energyLevel', value, { shouldDirty: true })}
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${energyLevel === value ? 'border-emerald-300/40 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('energyLevel')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Study hours</span>
                <input type="number" min="0" step="0.5" {...register('studyHours', { required: 'Study hours is required' })} className="w-full rounded-2xl px-4 py-3" />
                {errors.studyHours ? <p className="mt-2 text-sm text-red-300">{errors.studyHours.message}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Problems solved</span>
                <input type="number" min="0" {...register('problemsSolved', { required: 'Problems solved is required' })} className="w-full rounded-2xl px-4 py-3" />
                {errors.problemsSolved ? <p className="mt-2 text-sm text-red-300">{errors.problemsSolved.message}</p> : null}
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Biggest achievement</span>
              <textarea rows="3" {...register('todaysAchievement')} className="w-full rounded-2xl px-4 py-3" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Today's challenge</span>
              <textarea rows="3" {...register('todaysBlocker')} className="w-full rounded-2xl px-4 py-3" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Tomorrow's goal</span>
              <textarea rows="3" {...register('tomorrowGoal')} className="w-full rounded-2xl px-4 py-3" />
            </label>

            <button type="submit" disabled={isSubmitting || saveTodayCheckInMutation.isPending} className="stitch-button inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-semibold disabled:opacity-70">
              {isSubmitting || saveTodayCheckInMutation.isPending ? <Spinner label="Saving check-in" /> : <><Sparkles size={16} /> Save today&apos;s check-in</>}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Check-in history">
          {recentCheckInsQuery.isError ? (
            <ApiAlert title="Unable to load recent check-ins" description={getApiErrorMessage(recentCheckInsQuery.error)} onRetry={recentCheckInsQuery.refetch} />
          ) : recentCheckInsQuery.isLoading ? (
            <Spinner label="Loading check-ins" />
          ) : recentCheckIns.length ? (
            <div className="space-y-4">
              {visibleCheckIns.map((checkIn) => (
                <article key={checkIn.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-400">{formatDate(checkIn.checkInDate)}</div>
                      <h3 className="mt-2 text-lg font-bold text-white">{checkIn.productivityRating ?? 0}/5 productivity</h3>
                      <p className="mt-1 text-sm text-slate-400">{moodLabel(checkIn.mood)} mood, {checkIn.energyLevel || 'No'} energy level</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-sm text-sky-200">
                      <Flame size={16} />
                      {checkIn.studyHours ?? 0}h
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <div>Problems solved: {checkIn.problemsSolved ?? 0}</div>
                    <div>Energy score: {checkIn.energy ?? 0}/10</div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                    <p><span className="text-slate-200">Achievement:</span> {checkIn.todaysAchievement || 'Not recorded'}</p>
                    <p><span className="text-slate-200">Challenge:</span> {checkIn.todaysBlocker || 'Not recorded'}</p>
                    <p><span className="text-slate-200">Tomorrow:</span> {checkIn.tomorrowGoal || 'Not recorded'}</p>
                  </div>
                </article>
              ))}
              {recentCheckIns.length > visibleCheckIns.length ? (
                <button
                  type="button"
                  onClick={() => setShowAllCheckIns(true)}
                  className="stitch-button-secondary w-full rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Show more
                </button>
              ) : null}
            </div>
          ) : (
            <EmptyState title="No check-ins yet" description="Log today's study progress to start building consistency data." actionLabel="Fill today's check-in" onActionClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

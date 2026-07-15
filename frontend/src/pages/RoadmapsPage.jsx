import { BookOpenCheck, CheckCircle2, Pause, Play, RotateCcw } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useRoadmaps, useUpdateRoadmapModule, useUpdateRoadmapStatus } from '../hooks/useRoadmaps';
import { getApiErrorMessage } from '../utils/apiErrors';

export default function RoadmapsPage() {
  const { data = [], isLoading, isError, error, refetch } = useRoadmaps();
  const statusMutation = useUpdateRoadmapStatus();
  const moduleMutation = useUpdateRoadmapModule();

  const updateStatus = (roadmapId, status) => statusMutation.mutate({ roadmapId, status });
  const toggleModule = (roadmapId, module) => {
    moduleMutation.mutate({
      roadmapId,
      moduleId: module.id,
      payload: { completed: !module.completed, notes: module.notes || '' },
    });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Learning Roadmaps</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Roadmap management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Roadmap templates are persisted in the database per user and progress feeds the dashboard automatically.
        </p>
      </header>

      {isError ? <ApiAlert title="Unable to load roadmaps" description={getApiErrorMessage(error)} onRetry={refetch} /> : null}
      {isLoading ? <Spinner label="Loading roadmaps" /> : null}

      {!isLoading && !data.length ? (
        <EmptyState title="No roadmaps found" description="Open this page again after the backend is available to seed the supported roadmap set." />
      ) : null}

      <div className="grid gap-5">
        {data.map((roadmap) => (
          <section key={roadmap.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sky-300">
                  <BookOpenCheck size={16} />
                  {roadmap.difficulty} / {roadmap.estimatedHours}h / {roadmap.lessons} lessons
                </div>
                <h2 className="mt-2 text-xl font-semibold text-white">{roadmap.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{roadmap.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-white">{roadmap.completionPercentage}%</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{roadmap.status}</div>
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${roadmap.completionPercentage}%` }} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => updateStatus(roadmap.id, 'ACTIVE')} className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950">
                <Play size={15} /> Start
              </button>
              <button type="button" onClick={() => updateStatus(roadmap.id, 'PAUSED')} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
                <Pause size={15} /> Pause
              </button>
              <button type="button" onClick={() => updateStatus(roadmap.id, 'ACTIVE')} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
                <RotateCcw size={15} /> Resume
              </button>
              <button type="button" onClick={() => updateStatus(roadmap.id, 'COMPLETED')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 px-4 py-2 text-sm text-emerald-200">
                <CheckCircle2 size={15} /> Complete
              </button>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {roadmap.modules.map((module) => (
                <button
                  type="button"
                  key={module.id}
                  onClick={() => toggleModule(roadmap.id, module)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    module.completed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Module {module.sequence} / {module.estimatedTime}h</div>
                      <h3 className="mt-1 font-medium text-white">{module.title}</h3>
                    </div>
                    <span className="text-sm text-slate-300">{module.completed ? 'Done' : 'Open'}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">Resources: {roadmap.resources}</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">Projects: {roadmap.projects}</div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

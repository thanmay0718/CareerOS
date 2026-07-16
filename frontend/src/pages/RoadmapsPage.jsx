import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  Gauge,
  GraduationCap,
  ListChecks,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import {
  useCreateRoadmap,
  useDeleteRoadmap,
  useRoadmapRecommendations,
  useRoadmaps,
  useUpdateRoadmap,
  useUpdateRoadmapModule,
  useUpdateRoadmapStatus,
} from '../hooks/useRoadmaps';
import { getApiErrorMessage } from '../utils/apiErrors';

const emptyForm = {
  title: '',
  description: '',
  difficulty: 'MEDIUM',
  estimatedHours: '',
  resources: '',
  projects: '',
  status: 'ACTIVE',
  modulesText: '',
};

function normalizeRoadmapPayload(values) {
  const moduleTitles = values.modulesText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    difficulty: values.difficulty || 'MEDIUM',
    estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : null,
    resources: values.resources.trim() || null,
    projects: values.projects.trim() || null,
    status: values.status || 'ACTIVE',
    modules: moduleTitles.map((title, index) => ({
      title,
      description: `Learn, practice, and review ${title}.`,
      estimatedTime: Math.max(1, Math.round((Number(values.estimatedHours) || moduleTitles.length * 2) / Math.max(1, moduleTitles.length))),
      completed: false,
      notes: '',
      sequence: index + 1,
    })),
  };
}

function roadmapToForm(roadmap) {
  return {
    title: roadmap.title || '',
    description: roadmap.description || '',
    difficulty: roadmap.difficulty || 'MEDIUM',
    estimatedHours: roadmap.estimatedHours || '',
    resources: roadmap.resources || '',
    projects: roadmap.projects || '',
    status: roadmap.status || 'ACTIVE',
    modulesText: roadmap.modules?.map((module) => module.title).join('\n') || '',
  };
}

function formatDate(value) {
  if (!value) {
    return 'Not opened';
  }
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function StatTile({ icon: Icon, label, value, tone = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon size={17} className="text-sky-300" />
      </div>
      <div className={`mt-3 text-2xl font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function RoadmapCard({ roadmap, onStatus, onToggleModule, onEdit, onDelete }) {
  const inFlight = roadmap.status === 'ACTIVE';
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-glow sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-200">
              <GraduationCap size={19} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">{roadmap.title}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {roadmap.difficulty} difficulty / {roadmap.estimatedHours || 0} hours / {roadmap.lessons} concepts
              </p>
            </div>
          </div>
          {roadmap.description ? <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{roadmap.description}</p> : null}
        </div>

        <div className="grid min-w-[160px] grid-cols-2 gap-2 text-sm lg:text-right">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="text-slate-500">Progress</div>
            <div className="mt-1 text-xl font-semibold text-white">{roadmap.completionPercentage}%</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="text-slate-500">Status</div>
            <div className="mt-1 font-semibold text-white">{roadmap.status}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800" aria-label={`${roadmap.completionPercentage}% complete`}>
        <div className="h-full rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${roadmap.completionPercentage}%` }} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-slate-500">Current module</div>
          <div className="mt-1 font-medium text-white">{roadmap.currentModule}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-slate-500">Next module</div>
          <div className="mt-1 font-medium text-white">{roadmap.nextModule}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-slate-500">Completed</div>
          <div className="mt-1 font-medium text-white">{roadmap.completedConcepts} of {roadmap.lessons}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-slate-500">Last opened</div>
          <div className="mt-1 font-medium text-white">{roadmap.lastOpened || formatDate(roadmap.updatedAt)}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => onStatus(roadmap.id, 'ACTIVE')} className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white">
          {inFlight ? <Play size={15} /> : <RotateCcw size={15} />} {inFlight ? 'Continue' : 'Resume'}
        </button>
        <button type="button" onClick={() => onStatus(roadmap.id, 'PAUSED')} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
          <Pause size={15} /> Pause
        </button>
        <button type="button" onClick={() => onStatus(roadmap.id, 'COMPLETED')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 px-4 py-2 text-sm text-emerald-200">
          <CheckCircle2 size={15} /> Complete
        </button>
        <button type="button" onClick={() => onEdit(roadmap)} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
          <Edit3 size={15} /> Edit
        </button>
        <button type="button" onClick={() => onDelete(roadmap.id)} className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-200">
          <Trash2 size={15} /> Delete
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {roadmap.modules.map((module) => (
          <label
            key={module.id}
            className={`flex min-h-24 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
              module.completed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/70 hover:border-slate-600'
            }`}
          >
            <input
              type="checkbox"
              checked={module.completed}
              onChange={() => onToggleModule(roadmap.id, module)}
              className="mt-1 h-4 w-4 shrink-0"
              aria-label={`Mark ${module.title} complete`}
            />
            <span className="min-w-0">
              <span className="block text-xs text-slate-500">Concept {module.sequence} / {module.estimatedTime || 0}h</span>
              <span className="mt-1 block font-medium text-white">{module.title}</span>
              {module.description ? <span className="mt-1 block text-sm leading-6 text-slate-400">{module.description}</span> : null}
            </span>
          </label>
        ))}
      </div>

      {(roadmap.resources || roadmap.projects) ? (
        <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          {roadmap.resources ? <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">Resources: {roadmap.resources}</div> : null}
          {roadmap.projects ? <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">Projects: {roadmap.projects}</div> : null}
        </div>
      ) : null}
    </article>
  );
}

export default function RoadmapsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', difficulty: '', sortBy: 'updatedAt', sortDirection: 'desc' });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [searchInput, setSearchInput] = useState('');
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingRoadmapId, setEditingRoadmapId] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const roadmapsQuery = useRoadmaps(filters);
  const recommendationsQuery = useRoadmapRecommendations(searchInput);
  const createMutation = useCreateRoadmap();
  const updateMutation = useUpdateRoadmap();
  const deleteMutation = useDeleteRoadmap();
  const statusMutation = useUpdateRoadmapStatus();
  const moduleMutation = useUpdateRoadmapModule();

  const roadmaps = roadmapsQuery.data ?? [];
  const stats = useMemo(() => {
    const total = roadmaps.length;
    const active = roadmaps.filter((item) => item.status === 'ACTIVE').length;
    const paused = roadmaps.filter((item) => item.status === 'PAUSED').length;
    const completed = roadmaps.filter((item) => item.status === 'COMPLETED').length;
    const totalConcepts = roadmaps.reduce((sum, item) => sum + item.lessons, 0);
    const completedConcepts = roadmaps.reduce((sum, item) => sum + item.completedConcepts, 0);
    const hours = roadmaps.reduce((sum, item) => sum + (item.estimatedHours || 0), 0);
    const completion = totalConcepts ? Math.round((completedConcepts * 100) / totalConcepts) : 0;
    return { total, active, paused, completed, totalConcepts, completedConcepts, hours, completion };
  }, [roadmaps]);

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters(pendingFilters);
  };

  const clearFilters = () => {
    const cleared = { search: '', status: '', difficulty: '', sortBy: 'updatedAt', sortDirection: 'desc' };
    setPendingFilters(cleared);
    setFilters(cleared);
  };

  const updateForm = (key, value) => setFormValues((current) => ({ ...current, [key]: value }));

  const fillFromRecommendation = (recommendation) => {
    setFormValues({
      title: recommendation.title || '',
      description: recommendation.description || '',
      difficulty: recommendation.difficulty || 'MEDIUM',
      estimatedHours: recommendation.estimatedHours || '',
      resources: '',
      projects: '',
      status: 'ACTIVE',
      modulesText: recommendation.concepts?.join('\n') || '',
    });
    setEditingRoadmapId(null);
  };

  const startEdit = (roadmap) => {
    setEditingRoadmapId(roadmap.id);
    setFormValues(roadmapToForm(roadmap));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setEditingRoadmapId(null);
    setFormValues(emptyForm);
    setSubmitError('');
  };

  const saveRoadmap = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!formValues.title.trim()) {
      setSubmitError('Technology name is required.');
      return;
    }
    if (!formValues.modulesText.trim()) {
      setSubmitError('Add at least one concept, one per line.');
      return;
    }
    const payload = normalizeRoadmapPayload(formValues);
    try {
      if (editingRoadmapId) {
        await updateMutation.mutateAsync({ roadmapId: editingRoadmapId, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      clearForm();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  const updateStatus = (roadmapId, status) => statusMutation.mutate({ roadmapId, status });
  const toggleModule = (roadmapId, module) => {
    moduleMutation.mutate({
      roadmapId,
      moduleId: module.id,
      payload: { completed: !module.completed, notes: module.notes || '' },
    });
  };

  const deleteRoadmap = async (roadmapId) => {
    await deleteMutation.mutateAsync(roadmapId);
    if (editingRoadmapId === roadmapId) {
      clearForm();
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <header className="premium-page-header rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-sky-300">Learning Management</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Roadmap command center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Search, save, edit, pause, resume, and track backend-powered learning roadmaps with concept-level progress.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[520px]">
            <StatTile icon={BookOpenCheck} label="Learning" value={stats.active} />
            <StatTile icon={CheckCircle2} label="Completed" value={stats.completed} tone="text-emerald-200" />
            <StatTile icon={Pause} label="Paused" value={stats.paused} tone="text-amber-100" />
            <StatTile icon={Gauge} label="Completion" value={`${stats.completion}%`} />
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)]">
        <SectionCard title="Smart roadmap search">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Search any technology</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                <Search size={17} className="shrink-0 text-slate-500" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Python, React, Docker, System Design..."
                  className="w-full border-0 bg-transparent p-0 text-slate-100 outline-none"
                />
              </div>
            </label>
            <button
              type="button"
              onClick={() => {
                setPendingFilters((current) => ({ ...current, search: searchInput }));
                setFilters((current) => ({ ...current, search: searchInput }));
              }}
              className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white"
            >
              <Filter size={16} />
              Search saved
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {recommendationsQuery.isLoading ? <Spinner label="Finding recommendations" /> : null}
            {recommendationsQuery.data?.map((recommendation) => (
              <button
                type="button"
                key={`${recommendation.title}-${recommendation.saved}`}
                onClick={() => fillFromRecommendation(recommendation)}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left transition hover:border-sky-400/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Sparkles size={16} className="text-sky-300" />
                      {recommendation.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{recommendation.description}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                    {recommendation.saved ? 'Saved match' : 'Suggested path'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendation.concepts.slice(0, 8).map((concept) => (
                    <span key={concept} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                      {concept}
                    </span>
                  ))}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-200">
                  <Plus size={15} /> Add to My Learning
                </div>
              </button>
            ))}
            {searchInput.trim().length >= 2 && !recommendationsQuery.isLoading && !recommendationsQuery.data?.length ? (
              <EmptyState title="No recommendation yet" description="Try a broader technology name, then save the generated path." />
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title={editingRoadmapId ? 'Edit roadmap' : 'Add roadmap'}>
          {submitError ? <div className="mb-4"><ApiAlert title="Unable to save roadmap" description={submitError} /></div> : null}
          <form className="space-y-4" onSubmit={saveRoadmap}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Technology</span>
              <input value={formValues.title} onChange={(event) => updateForm('title', event.target.value)} className="w-full rounded-2xl px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Description</span>
              <textarea value={formValues.description} onChange={(event) => updateForm('description', event.target.value)} rows="3" className="w-full rounded-2xl px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Difficulty</span>
                <select value={formValues.difficulty} onChange={(event) => updateForm('difficulty', event.target.value)} className="w-full rounded-2xl px-4 py-3">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Hours</span>
                <input type="number" min="1" value={formValues.estimatedHours} onChange={(event) => updateForm('estimatedHours', event.target.value)} className="w-full rounded-2xl px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Status</span>
                <select value={formValues.status} onChange={(event) => updateForm('status', event.target.value)} className="w-full rounded-2xl px-4 py-3">
                  <option value="NOT_STARTED">Not started</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Concept checklist</span>
              <textarea
                value={formValues.modulesText}
                onChange={(event) => updateForm('modulesText', event.target.value)}
                rows="8"
                placeholder="One concept per line"
                className="w-full rounded-2xl px-4 py-3"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Resources</span>
                <textarea value={formValues.resources} onChange={(event) => updateForm('resources', event.target.value)} rows="3" className="w-full rounded-2xl px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Projects</span>
                <textarea value={formValues.projects} onChange={(event) => updateForm('projects', event.target.value)} rows="3" className="w-full rounded-2xl px-4 py-3" />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Spinner label="Saving roadmap" /> : <><Check size={16} /> {editingRoadmapId ? 'Update roadmap' : 'Add to My Learning'}</>}
              </button>
              {editingRoadmapId ? (
                <button type="button" onClick={clearForm} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200">
                  <X size={16} /> Cancel
                </button>
              ) : null}
            </div>
          </form>
        </SectionCard>
      </section>

      <SectionCard title="Learning dashboard">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatTile icon={ListChecks} label="Total roadmaps" value={stats.total} />
          <StatTile icon={Play} label="In progress" value={stats.active} />
          <StatTile icon={Clock3} label="Hours planned" value={stats.hours} />
          <StatTile icon={CheckCircle2} label="Concepts done" value={stats.completedConcepts} tone="text-emerald-200" />
          <StatTile icon={BookOpenCheck} label="Total topics" value={stats.totalConcepts} />
          <StatTile icon={Pause} label="Pending topics" value={Math.max(0, stats.totalConcepts - stats.completedConcepts)} tone="text-amber-100" />
        </div>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]" onSubmit={applyFilters}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Search</span>
            <input value={pendingFilters.search} onChange={(event) => setPendingFilters((current) => ({ ...current, search: event.target.value }))} className="w-full rounded-2xl px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Status</span>
            <select value={pendingFilters.status} onChange={(event) => setPendingFilters((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl px-4 py-3">
              <option value="">All</option>
              <option value="NOT_STARTED">Not started</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Difficulty</span>
            <select value={pendingFilters.difficulty} onChange={(event) => setPendingFilters((current) => ({ ...current, difficulty: event.target.value }))} className="w-full rounded-2xl px-4 py-3">
              <option value="">All</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Sort</span>
            <select value={pendingFilters.sortBy} onChange={(event) => setPendingFilters((current) => ({ ...current, sortBy: event.target.value }))} className="w-full rounded-2xl px-4 py-3">
              <option value="updatedAt">Last opened</option>
              <option value="createdAt">Newest</option>
              <option value="title">Alphabetical</option>
              <option value="estimatedHours">Duration</option>
              <option value="progress">Progress</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Direction</span>
            <select value={pendingFilters.sortDirection} onChange={(event) => setPendingFilters((current) => ({ ...current, sortDirection: event.target.value }))} className="w-full rounded-2xl px-4 py-3">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500 text-white" aria-label="Apply filters">
              <ArrowUpDown size={17} />
            </button>
            <button type="button" onClick={clearFilters} className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-700 text-slate-200" aria-label="Clear filters">
              <X size={17} />
            </button>
          </div>
        </form>
      </SectionCard>

      {roadmapsQuery.isError ? <ApiAlert title="Unable to load roadmaps" description={getApiErrorMessage(roadmapsQuery.error)} onRetry={roadmapsQuery.refetch} /> : null}
      {roadmapsQuery.isLoading ? <Spinner label="Loading roadmaps" /> : null}

      {!roadmapsQuery.isLoading && !roadmaps.length ? (
        <EmptyState
          title="No roadmaps found"
          description="Search a technology, use the backend suggestion, or create a roadmap manually to start tracking progress."
          actionLabel="Clear filters"
          onActionClick={clearFilters}
        />
      ) : null}

      <div className="grid gap-5">
        {roadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            onStatus={updateStatus}
            onToggleModule={toggleModule}
            onEdit={startEdit}
            onDelete={deleteRoadmap}
          />
        ))}
      </div>
    </div>
  );
}

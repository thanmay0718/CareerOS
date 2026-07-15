import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Archive, CheckCircle2, FileText, Trash2 } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/StatCard';
import { useActivateResume, useArchiveResume, useCreateResume, useDeleteResume, useResumes, useUpdateResume } from '../hooks/useResumes';
import { getApiErrorMessage } from '../utils/apiErrors';

const types = ['GENERAL', 'ATS', 'COMPANY_TARGETED', 'ROLE_TARGETED'];
const statuses = ['DRAFT', 'ACTIVE', 'ARCHIVED'];
const emptyValues = { version: '', createdDate: new Date().toISOString().slice(0, 10), fileName: '', resumeType: 'GENERAL', targetCompany: '', targetRole: '', notes: '', resumeStatus: 'DRAFT' };

export default function ResumesPage() {
  const { data, isLoading, isError, error, refetch } = useResumes();
  const createMutation = useCreateResume();
  const updateMutation = useUpdateResume();
  const activateMutation = useActivateResume();
  const archiveMutation = useArchiveResume();
  const deleteMutation = useDeleteResume();
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyValues });
  const resumes = data?.resumes ?? [];
  const summary = data?.summary;

  const save = async (values) => {
    const payload = normalize(values);
    if (editingId) await updateMutation.mutateAsync({ resumeId: editingId, payload });
    else await createMutation.mutateAsync(payload);
    setEditingId(null);
    reset(emptyValues);
  };

  const edit = (resume) => {
    setEditingId(resume.id);
    reset({ ...emptyValues, ...resume });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Resume Center</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Resume management</h1>
        <p className="mt-2 text-sm text-slate-400">Phase 2 stores resume versions, history, notes, active status, and archives. AI review is intentionally not included.</p>
      </header>
      {isError ? <ApiAlert title="Unable to load resumes" description={getApiErrorMessage(error)} onRetry={refetch} /> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Current Resume" value={summary?.currentResume || 'None'} highlight />
        <StatCard label="Last Updated" value={summary?.lastUpdated || '-'} />
        <StatCard label="Resume Versions" value={summary?.resumeVersions ?? 0} />
      </div>

      <form onSubmit={handleSubmit(save)} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit resume version' : 'Upload resume record'}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input label="Version" register={register('version', { required: true })} />
          <Input label="Created Date" type="date" register={register('createdDate')} />
          <Input label="File Name" register={register('fileName', { required: true })} />
          <label className="block text-sm text-slate-300">Resume Type<select {...register('resumeType')} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100">{types.map((item) => <option key={item}>{item}</option>)}</select></label>
          <Input label="Target Company" register={register('targetCompany')} />
          <Input label="Target Role" register={register('targetRole')} />
          <label className="block text-sm text-slate-300">Status<select {...register('resumeStatus')} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="mt-3"><Textarea label="Resume Notes" register={register('notes')} /></div>
        <div className="mt-4 flex gap-3">
          <button className="rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950">{editingId ? 'Update' : 'Save resume'}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); reset(emptyValues); }} className="rounded-2xl border border-slate-700 px-4 py-3 text-slate-200">Cancel</button> : null}
        </div>
      </form>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        {isLoading ? <Spinner label="Loading resumes" /> : null}
        {!isLoading && !resumes.length ? <EmptyState title="No resume versions" description="Upload your first resume record to start version history." /> : null}
        <div className="grid gap-4 xl:grid-cols-2">
          {resumes.map((resume) => (
            <article key={resume.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-200"><FileText size={19} /></div>
                  <div><h3 className="font-semibold text-white">{resume.fileName}</h3><p className="text-sm text-slate-400">Version {resume.version} / {resume.resumeType}</p></div>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{resume.resumeStatus}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3"><span>Date: {resume.createdDate}</span><span>Company: {resume.targetCompany || '-'}</span><span>Role: {resume.targetRole || '-'}</span></div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{resume.notes || 'No notes added.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => edit(resume)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200">Edit</button>
                <button onClick={() => activateMutation.mutate(resume.id)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 px-3 py-2 text-sm text-emerald-200"><CheckCircle2 size={15} />Active</button>
                <button onClick={() => archiveMutation.mutate(resume.id)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200"><Archive size={15} />Archive</button>
                <button onClick={() => deleteMutation.mutate(resume.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-200"><Trash2 size={15} />Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function normalize(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === '' ? null : value]));
}

function Input({ label, register, type = 'text' }) {
  return <label className="block text-sm text-slate-300">{label}<input type={type} {...register} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100" /></label>;
}

function Textarea({ label, register }) {
  return <label className="block text-sm text-slate-300">{label}<textarea rows="3" {...register} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100" /></label>;
}

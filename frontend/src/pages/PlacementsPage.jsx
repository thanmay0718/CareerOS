import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, Trash2 } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/StatCard';
import { useCreatePlacement, useDeletePlacement, usePlacements, useUpdatePlacement } from '../hooks/usePlacements';
import { getApiErrorMessage } from '../utils/apiErrors';

const statuses = ['WISHLIST', 'PREPARING', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'HR_ROUND', 'OFFER_RECEIVED', 'REJECTED', 'ACCEPTED', 'JOINED'];
const emptyValues = { company: '', role: '', packageAmount: '', location: '', applicationDate: '', onlineAssessmentDate: '', interviewDate: '', offerDate: '', applicationStatus: 'WISHLIST', referral: '', notes: '', jobDescription: '', applicationSource: '' };

export default function PlacementsPage() {
  const { data, isLoading, isError, error, refetch } = usePlacements();
  const createMutation = useCreatePlacement();
  const updateMutation = useUpdatePlacement();
  const deleteMutation = useDeletePlacement();
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState('applicationDate');
  const [page, setPage] = useState(1);
  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyValues });

  const applications = data?.applications ?? [];
  const summary = data?.summary;
  const pageSize = 8;
  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return applications
      .filter((item) => status === 'ALL' || item.applicationStatus === status)
      .filter((item) => [item.company, item.role, item.location, item.applicationSource].join(' ').toLowerCase().includes(term))
      .sort((a, b) => String(b[sort] || '').localeCompare(String(a[sort] || '')));
  }, [applications, query, sort, status]);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  const save = async (values) => {
    const payload = normalize(values);
    if (editingId) await updateMutation.mutateAsync({ applicationId: editingId, payload });
    else await createMutation.mutateAsync(payload);
    setEditingId(null);
    reset(emptyValues);
  };

  const edit = (item) => {
    setEditingId(item.id);
    reset({ ...emptyValues, ...item, packageAmount: item.packageAmount || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <header className="premium-page-header rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Placement Tracker</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">ATS pipeline</h1>
      </header>
      {isError ? <ApiAlert title="Unable to load applications" description={getApiErrorMessage(error)} onRetry={refetch} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Applications" value={summary?.totalApplications ?? 0} highlight />
        <StatCard label="Upcoming Interviews" value={summary?.upcomingInterviews ?? 0} highlight />
        <StatCard label="Offers" value={summary?.offers ?? 0} highlight />
        <StatCard label="Rejections" value={summary?.rejections ?? 0} />
        <StatCard label="Wishlist Count" value={summary?.wishlistCount ?? 0} />
      </div>

      <form onSubmit={handleSubmit(save)} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit application' : 'Create application'}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input label="Company" register={register('company', { required: true })} />
          <Input label="Role" register={register('role', { required: true })} />
          <Input label="Package" type="number" register={register('packageAmount')} />
          <Input label="Location" register={register('location')} />
          <Input label="Application Date" type="date" register={register('applicationDate')} />
          <Input label="OA Date" type="date" register={register('onlineAssessmentDate')} />
          <Input label="Interview Date" type="date" register={register('interviewDate')} />
          <Input label="Offer Date" type="date" register={register('offerDate')} />
          <label className="block text-sm text-slate-300">Status<select {...register('applicationStatus')} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <Input label="Referral" register={register('referral')} />
          <Input label="Application Source" register={register('applicationSource')} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Textarea label="Notes" register={register('notes')} />
          <Textarea label="Job Description" register={register('jobDescription')} />
        </div>
        <div className="mt-4 flex gap-3">
          <button className="rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950">{editingId ? 'Update' : 'Create'}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); reset(emptyValues); }} className="rounded-2xl border border-slate-700 px-4 py-3 text-slate-200">Cancel</button> : null}
        </div>
      </form>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search company, role, source" className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100" />
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100"><option value="ALL">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100"><option value="applicationDate">Application Date</option><option value="interviewDate">Interview Date</option><option value="company">Company</option><option value="packageAmount">Package</option></select>
        </div>
        {isLoading ? <Spinner label="Loading applications" /> : null}
        {!isLoading && !pageItems.length ? <EmptyState title="No applications" description="Create or adjust filters to see applications." /> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-slate-500"><tr>{['Company', 'Role', 'Package', 'Location', 'Status', 'Assessment', 'Interview', 'Actions'].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-800">
              {pageItems.map((item) => <tr key={item.id} className="text-slate-300"><td className="px-3 py-3 font-medium text-white">{item.company}</td><td className="px-3 py-3">{item.role}</td><td className="px-3 py-3">{item.packageAmount || '-'}</td><td className="px-3 py-3">{item.location || '-'}</td><td className="px-3 py-3">{item.applicationStatus}</td><td className="px-3 py-3">{item.onlineAssessmentDate || '-'}</td><td className="px-3 py-3">{item.interviewDate || '-'}</td><td className="px-3 py-3"><button onClick={() => edit(item)} className="mr-2 text-sky-300"><Edit3 size={16} /></button><button onClick={() => deleteMutation.mutate(item.id)} className="text-red-300"><Trash2 size={16} /></button></td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-xl border border-slate-700 px-3 py-2 disabled:opacity-40">Prev</button><button disabled={page === pageCount} onClick={() => setPage(page + 1)} className="rounded-xl border border-slate-700 px-3 py-2 disabled:opacity-40">Next</button></div></div>
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

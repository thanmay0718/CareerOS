import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Bookmark, BriefcaseBusiness, Edit3, Star, Trash2 } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useCompanies, useCreateCompany, useDeleteCompany, useUpdateCompany } from '../hooks/useCompanies';
import { getApiErrorMessage } from '../utils/apiErrors';

const hiringStatuses = ['OPEN', 'HIRING_SOON', 'CLOSED', 'UNKNOWN'];
const emptyValues = { companyName: '', logo: '', industry: '', location: '', averagePackage: '', hiringProcess: '', rounds: '', skillsRequired: '', importantTopics: '', website: '', careerPage: '', preparationNotes: '', personalNotes: '', bookmarked: false, preparationTracked: false, dreamCompany: false, hiringStatus: 'UNKNOWN' };

export default function CompaniesPage() {
  const { data = [], isLoading, isError, error, refetch } = useCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('ALL');
  const [hiringStatus, setHiringStatus] = useState('ALL');
  const [sort, setSort] = useState('companyName');
  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyValues });

  const industries = [...new Set(data.map((item) => item.industry).filter(Boolean))];
  const companies = useMemo(() => {
    const term = query.toLowerCase();
    return data
      .filter((item) => industry === 'ALL' || item.industry === industry)
      .filter((item) => hiringStatus === 'ALL' || item.hiringStatus === hiringStatus)
      .filter((item) => [item.companyName, item.location, item.skillsRequired, item.importantTopics].join(' ').toLowerCase().includes(term))
      .sort((a, b) => sort === 'averagePackage'
        ? Number(b.averagePackage || 0) - Number(a.averagePackage || 0)
        : String(a[sort] || '').localeCompare(String(b[sort] || '')));
  }, [data, hiringStatus, industry, query, sort]);

  const save = async (values) => {
    const payload = normalize(values);
    if (editingId) await updateMutation.mutateAsync({ companyId: editingId, payload });
    else await createMutation.mutateAsync(payload);
    setEditingId(null);
    reset(emptyValues);
  };

  const edit = (company) => {
    setEditingId(company.id);
    reset({ ...emptyValues, ...company, averagePackage: company.averagePackage || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Company Explorer</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Company database</h1>
      </header>
      {isError ? <ApiAlert title="Unable to load companies" description={getApiErrorMessage(error)} onRetry={refetch} /> : null}

      <form onSubmit={handleSubmit(save)} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit company' : 'Add company'}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input label="Company Name" register={register('companyName', { required: true })} />
          <Input label="Logo URL" register={register('logo')} />
          <Input label="Industry" register={register('industry')} />
          <Input label="Location" register={register('location')} />
          <Input label="Average Package" type="number" register={register('averagePackage')} />
          <label className="block text-sm text-slate-300">Hiring Status<select {...register('hiringStatus')} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100">{hiringStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {['hiringProcess', 'rounds', 'skillsRequired', 'importantTopics', 'preparationNotes', 'personalNotes'].map((field) => <Textarea key={field} label={labelFor(field)} register={register(field)} />)}
          <Input label="Website" register={register('website')} />
          <Input label="Career Page" register={register('careerPage')} />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          <label><input type="checkbox" {...register('bookmarked')} className="mr-2" />Bookmark</label>
          <label><input type="checkbox" {...register('preparationTracked')} className="mr-2" />Track preparation</label>
          <label><input type="checkbox" {...register('dreamCompany')} className="mr-2" />Dream company</label>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950">{editingId ? 'Update' : 'Create'}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); reset(emptyValues); }} className="rounded-2xl border border-slate-700 px-4 py-3 text-slate-200">Cancel</button> : null}
        </div>
      </form>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, skills, topics" className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100" />
          <select value={industry} onChange={(event) => setIndustry(event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100"><option value="ALL">All industries</option>{industries.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={hiringStatus} onChange={(event) => setHiringStatus(event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100"><option value="ALL">All hiring statuses</option>{hiringStatuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100"><option value="companyName">Company</option><option value="industry">Industry</option><option value="averagePackage">Package</option><option value="hiringStatus">Hiring Status</option></select>
        </div>
        {isLoading ? <Spinner label="Loading companies" /> : null}
        {!isLoading && !companies.length ? <EmptyState title="No companies" description="Add companies or change filters." /> : null}
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {companies.map((company) => (
            <article key={company.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-sky-200">
                    {company.logo ? <img src={company.logo} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <BriefcaseBusiness size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{company.companyName}</h3>
                    <p className="text-sm text-slate-400">{company.industry || '-'} / {company.location || '-'}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-slate-300">{company.bookmarked ? <Bookmark size={16} /> : null}{company.dreamCompany ? <Star size={16} /> : null}</div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3"><span>Package: {company.averagePackage || '-'}</span><span>Status: {company.hiringStatus}</span><span>Prep: {company.preparationTracked ? 'Tracked' : 'Not tracked'}</span></div>
              <p className="mt-3 text-sm leading-6 text-slate-400">Skills: {company.skillsRequired || '-'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Topics: {company.importantTopics || '-'}</p>
              <div className="mt-4 flex gap-2"><button onClick={() => edit(company)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200"><Edit3 size={15} />Edit</button><button onClick={() => deleteMutation.mutate(company.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-200"><Trash2 size={15} />Delete</button></div>
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

function labelFor(value) {
  return value.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase());
}

function Input({ label, register, type = 'text' }) {
  return <label className="block text-sm text-slate-300">{label}<input type={type} {...register} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100" /></label>;
}

function Textarea({ label, register }) {
  return <label className="block text-sm text-slate-300">{label}<textarea rows="3" {...register} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100" /></label>;
}

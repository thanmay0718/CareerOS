import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Bookmark,
  CalendarClock,
  CheckSquare,
  Code2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Image,
  Link2,
  Pin,
  Search,
  Share2,
  Star,
  StickyNote,
  Table2,
  Trash2,
  X,
} from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNoteCategories,
  useNotes,
  useRevisionNotes,
  useScheduleNoteRevision,
  useUpdateNote,
} from '../hooks/useNotes';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

const noteDefaults = {
  category: 'GENERAL_NOTES',
  title: '',
  contentMarkdown: '',
  tags: '',
  folderName: '',
  pinned: false,
  favorite: false,
  revisionDate: '',
  imageUrls: '',
  attachmentUrls: '',
};

const categories = [
  'JAVA',
  'SPRING_BOOT',
  'SQL',
  'ARRAYS',
  'DSA',
  'DBMS',
  'OPERATING_SYSTEM',
  'COMPUTER_NETWORKS',
  'APTITUDE',
  'REACT',
  'PROJECTS',
  'INTERVIEW_NOTES',
  'COMPANY_PREPARATION',
  'HR_QUESTIONS',
  'PERSONAL_NOTES',
  'GENERAL_NOTES',
];

const revisionPresets = [
  ['Tomorrow', 1],
  ['3 days', 3],
  ['7 days', 7],
  ['30 days', 30],
];

function formatDate(value, includeTime = false) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
  }).format(new Date(value));
}

function splitStoredList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function calculateReadingTime(content) {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function splitTags(value) {
  return splitStoredList(value);
}

function noteHeadings(content) {
  return (content || '')
    .split('\n')
    .filter((line) => /^#{1,3}\s+/.test(line.trim()))
    .map((line) => {
      const level = line.match(/^#+/)?.[0].length || 1;
      const title = line.replace(/^#{1,3}\s+/, '').trim();
      return { level, title };
    });
}

function renderInlineText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={`${part}-${index}`} className="rounded bg-slate-950 px-1.5 py-0.5 text-indigo-100">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return <a key={`${part}-${index}`} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-indigo-200 underline">{linkMatch[1]}</a>;
    }
    return part;
  });
}

function MarkdownReader({ content }) {
  const lines = (content || '').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3);
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={`code-${index}`} className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          {language ? <div className="mb-3 text-xs font-semibold text-slate-500">{language}</div> : null}
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    if (line.includes('|') && lines[index + 1]?.includes('|') && /^[-|:\s]+$/.test(lines[index + 1].trim())) {
      const tableLines = [line];
      index += 2;
      while (index < lines.length && lines[index].includes('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      const rows = tableLines.map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean));
      const [head, ...body] = rows;
      blocks.push(
        <div key={`table-${index}`} className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-white/[0.06] text-slate-200">
              <tr>{head.map((cell) => <th key={cell} className="px-4 py-3 font-semibold">{renderInlineText(cell)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={`${row.join('-')}-${rowIndex}`} className="border-t border-white/10">
                  {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-slate-300">{renderInlineText(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      blocks.push(
        <figure key={`image-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <img src={imageMatch[2]} alt={imageMatch[1] || 'Note image'} className="max-h-[460px] w-full object-contain" />
          {imageMatch[1] ? <figcaption className="px-4 py-3 text-xs text-slate-400">{imageMatch[1]}</figcaption> : null}
        </figure>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push(<h1 key={`h1-${index}`} className="text-3xl font-bold text-white">{renderInlineText(line.slice(2))}</h1>);
      index += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(<h2 key={`h2-${index}`} className="text-2xl font-bold text-white">{renderInlineText(line.slice(3))}</h2>);
      index += 1;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push(<h3 key={`h3-${index}`} className="text-xl font-semibold text-white">{renderInlineText(line.slice(4))}</h3>);
      index += 1;
      continue;
    }
    if (line.trim().startsWith('> ')) {
      const quotes = [];
      while (index < lines.length && lines[index].trim().startsWith('> ')) {
        quotes.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-indigo-300/50 bg-white/[0.04] px-5 py-4 text-base leading-8 text-slate-200">
          {renderInlineText(quotes.join('\n'))}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*]\s+\[[ xX]\]\s+/.test(line.trim())) {
      const items = [];
      while (index < lines.length && /^[-*]\s+\[[ xX]\]\s+/.test(lines[index].trim())) {
        const match = lines[index].trim().match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
        items.push({ checked: match?.[1].toLowerCase() === 'x', text: match?.[2] || lines[index] });
        index += 1;
      }
      blocks.push(
        <ul key={`checklist-${index}`} className="space-y-3 text-base leading-8 text-slate-300">
          {items.map((item) => (
            <li key={item.text} className="flex items-start gap-3">
              <CheckSquare size={18} className={item.checked ? 'mt-1 shrink-0 text-emerald-300' : 'mt-1 shrink-0 text-slate-500'} />
              <span className={item.checked ? 'text-slate-400 line-through' : ''}>{renderInlineText(item.text)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.trim().startsWith('- ')) {
      const items = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={`list-${index}`} className="list-disc space-y-2 pl-6 text-base leading-8 text-slate-300">
          {items.map((item) => <li key={item}>{renderInlineText(item)}</li>)}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ordered-${index}`} className="list-decimal space-y-2 pl-6 text-base leading-8 text-slate-300">
          {items.map((item) => <li key={item}>{renderInlineText(item)}</li>)}
        </ol>,
      );
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !lines[index].trim().startsWith('```')) {
      if (lines[index + 1]?.includes('|') && /^[-|:\s]+$/.test(lines[index + 1].trim())) {
        break;
      }
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={`p-${index}`} className="whitespace-pre-wrap text-base leading-8 text-slate-300">{renderInlineText(paragraph.join('\n'))}</p>);
  }

  return <div className="space-y-6">{blocks.length ? blocks : <p className="text-sm text-slate-400">No note content yet.</p>}</div>;
}

function exportMarkdown(note) {
  const blob = new Blob([note.contentMarkdown || ''], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${note.title || 'note'}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function NoteReaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-5 py-8">
      <div className="h-9 w-3/4 animate-pulse rounded-2xl bg-white/10" />
      <div className="flex gap-2">
        <div className="h-7 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-7 w-32 animate-pulse rounded-full bg-white/10" />
      </div>
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-8/12 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function NoteReaderModal({
  noteId,
  note,
  isLoading,
  isError,
  error,
  onClose,
  onRetry,
  onEdit,
  onDelete,
  onScheduleRevision,
  schedulePending,
  onOpenNote,
  relatedNotes,
}) {
  const dialogRef = useRef(null);
  const content = note?.contentMarkdown || '';
  const headings = useMemo(() => noteHeadings(content), [content]);
  const imageUrls = splitStoredList(note?.imageUrls);
  const attachmentUrls = splitStoredList(note?.attachmentUrls);
  const tags = splitTags(note?.tags);

  useEffect(() => {
    if (!noteId) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTarget = dialogRef.current;
    window.setTimeout(() => focusTarget?.focus(), 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [noteId, onClose]);

  if (!noteId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/72 p-0 backdrop-blur-xl animate-in fade-in duration-200" role="presentation">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-reader-title"
        className="mx-auto flex h-dvh w-full max-w-[1800px] scale-100 flex-col overflow-hidden border border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl outline-none sm:my-3 sm:h-[calc(100dvh-1.5rem)] sm:w-[calc(100%-1.5rem)] sm:rounded-2xl"
      >
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/92 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 px-3 py-1">{note?.category || 'Loading'}</span>
                {note?.folderName ? <span>{note.folderName}</span> : null}
                {note?.favorite ? <span className="inline-flex items-center gap-1 text-amber-200"><Star size={13} /> Favorite</span> : null}
                {note?.pinned ? <span className="inline-flex items-center gap-1 text-indigo-200"><Pin size={13} /> Pinned</span> : null}
              </div>
              <h2 id="note-reader-title" className="mt-2 truncate text-2xl font-bold text-white sm:text-3xl">
                {note?.title || 'Loading note'}
              </h2>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>Created {formatDate(note?.createdAt, true)}</span>
                <span>Updated {formatDate(note?.updatedAt, true)}</span>
                <span>Version {note?.versionNumber || '-'}</span>
                <span>{calculateReadingTime(content)} min read</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button type="button" onClick={() => note ? onEdit(note) : undefined} disabled={!note} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/10 disabled:opacity-40" aria-label="Edit note">
                <Edit3 size={17} />
              </button>
              <button type="button" onClick={() => navigator.share?.({ title: note?.title, text: note?.title })} disabled={!note || !navigator.share} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/10 disabled:opacity-40" aria-label="Share note">
                <Share2 size={17} />
              </button>
              <button type="button" onClick={() => note ? exportMarkdown(note) : undefined} disabled={!note} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/10 disabled:opacity-40" aria-label="Download markdown">
                <Download size={17} />
              </button>
              <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/10" aria-label="Copy link">
                <Link2 size={17} />
              </button>
              <button type="button" disabled={!note} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-200 transition hover:bg-white/10 disabled:opacity-40" aria-label="Bookmark note">
                <Bookmark size={17} />
              </button>
              <button type="button" onClick={() => note ? onDelete(note.id) : undefined} disabled={!note} className="grid h-10 w-10 place-items-center rounded-2xl border border-red-500/30 text-red-200 transition hover:bg-red-500/10 disabled:opacity-40" aria-label="Delete note">
                <Trash2 size={17} />
              </button>
              <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15" aria-label="Close reader">
                <X size={20} />
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? <NoteReaderSkeleton /> : null}
          {isError ? (
            <div className="mx-auto grid min-h-[60vh] w-full max-w-xl place-items-center px-5 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <FileText size={42} className="mx-auto text-slate-500" />
                <h3 className="mt-4 text-xl font-bold text-white">Unable to open this note</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{getApiErrorMessage(error)}</p>
                <button type="button" onClick={onRetry} className="stitch-button mt-5 rounded-full px-5 py-3 text-sm font-semibold">
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          {!isLoading && !isError && note ? (
            <div className="grid gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[1fr_320px]">
              <main className="mx-auto w-full max-w-3xl">
                <article className="space-y-8">
                  {tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{tag}</span>)}
                    </div>
                  ) : null}
                  <MarkdownReader content={content} />

                  {imageUrls.length ? (
                    <section className="grid gap-4 sm:grid-cols-2">
                      {imageUrls.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                          <img src={url} alt={note.title} className="max-h-[420px] w-full object-contain" />
                        </a>
                      ))}
                    </section>
                  ) : null}

                  {attachmentUrls.length ? (
                    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <h3 className="text-lg font-bold text-white">Attachments</h3>
                      <div className="mt-4 space-y-2">
                        {attachmentUrls.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 truncate rounded-2xl border border-white/10 px-4 py-3 text-sm text-indigo-200 transition hover:bg-white/10">
                            <ExternalLink size={15} />
                            <span className="truncate">{url}</span>
                          </a>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </article>
              </main>

              <aside className="hidden lg:block">
                <div className="sticky top-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <h3 className="text-sm font-bold text-white">Quick navigation</h3>
                    <div className="mt-3 space-y-2">
                      {headings.length ? headings.slice(0, 10).map((heading) => (
                        <div key={`${heading.title}-${heading.level}`} className={`text-sm text-slate-400 ${heading.level > 1 ? 'pl-3' : ''}`}>
                          {heading.title}
                        </div>
                      )) : <p className="text-sm text-slate-500">No headings in this note.</p>}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <h3 className="text-sm font-bold text-white">Metadata</h3>
                    <dl className="mt-3 space-y-3 text-sm">
                      <div><dt className="text-slate-500">Revision</dt><dd className="text-slate-300">{formatDate(note.revisionDate)}</dd></div>
                      <div><dt className="text-slate-500">Attachments</dt><dd className="text-slate-300">{attachmentUrls.length}</dd></div>
                      <div><dt className="text-slate-500">Images</dt><dd className="text-slate-300">{imageUrls.length}</dd></div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <CalendarClock size={16} />
                      Schedule revision
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {revisionPresets.map(([label, days]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => onScheduleRevision(note.id, days)}
                          disabled={schedulePending}
                          className="stitch-button-secondary rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-60"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <h3 className="text-sm font-bold text-white">Related notes</h3>
                    <div className="mt-3 space-y-2">
                      {relatedNotes.length ? relatedNotes.map((related) => (
                        <button key={related.id} type="button" onClick={() => onOpenNote(related.id)} className="block w-full rounded-xl px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/10">
                          {related.title}
                        </button>
                      )) : <p className="text-sm text-slate-500">No related notes yet.</p>}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function NotesPage() {
  const [filters, setFilters] = useState({ search: '', category: '', favorite: '', pinned: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [readingNoteId, setReadingNoteId] = useState(null);
  const notesQuery = useNotes(filters);
  const noteDetailQuery = useNote(readingNoteId);
  const categoriesQuery = useNoteCategories();
  const revisionsQuery = useRevisionNotes();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const scheduleRevisionMutation = useScheduleNoteRevision();
  const { register, handleSubmit, reset, setError, setValue, getValues, formState: { errors, isSubmitting } } = useForm({ defaultValues: noteDefaults });

  const notes = notesQuery.data ?? [];
  const categorySummaries = categoriesQuery.data ?? [];
  const revisionNotes = revisionsQuery.data ?? [];
  const editingNote = useMemo(() => notes.find((note) => note.id === editingNoteId) ?? null, [editingNoteId, notes]);
  const readingNote = noteDetailQuery.data;
  const relatedNotes = useMemo(() => {
    if (!readingNote) {
      return [];
    }
    const tags = splitTags(readingNote.tags).map((tag) => tag.toLowerCase());
    return notes
      .filter((note) => note.id !== readingNote.id)
      .filter((note) => note.category === readingNote.category || splitTags(note.tags).some((tag) => tags.includes(tag.toLowerCase())))
      .slice(0, 5);
  }, [notes, readingNote]);

  const beginEdit = (note) => {
    setEditingNoteId(note.id);
    setReadingNoteId(null);
    reset({
      category: note.category || 'GENERAL_NOTES',
      title: note.title || '',
      contentMarkdown: note.contentMarkdown || '',
      tags: note.tags || '',
      folderName: note.folderName || '',
      pinned: Boolean(note.pinned),
      favorite: Boolean(note.favorite),
      revisionDate: note.revisionDate || '',
      imageUrls: note.imageUrls || '',
      attachmentUrls: note.attachmentUrls || '',
    });
  };

  const clearEdit = () => {
    setEditingNoteId(null);
    reset(noteDefaults);
  };

  const insertSnippet = (snippet) => {
    const current = getValues('contentMarkdown') || '';
    setValue('contentMarkdown', `${current}${current ? '\n\n' : ''}${snippet}`, { shouldDirty: true });
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      contentMarkdown: values.contentMarkdown || null,
      tags: values.tags || null,
      folderName: values.folderName || null,
      revisionDate: values.revisionDate || null,
      imageUrls: values.imageUrls || null,
      attachmentUrls: values.attachmentUrls || null,
      pinned: Boolean(values.pinned),
      favorite: Boolean(values.favorite),
    };

    try {
      const saved = editingNoteId
        ? await updateNoteMutation.mutateAsync({ noteId: editingNoteId, payload })
        : await createNoteMutation.mutateAsync(payload);
      setReadingNoteId(saved.id);
      clearEdit();
    } catch (mutationError) {
      const validationErrors = getApiValidationErrors(mutationError);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => setError(field, { type: 'server', message }));
      }
    }
  };

  const scheduleRevision = async (noteId, daysFromToday) => {
    const saved = await scheduleRevisionMutation.mutateAsync({ noteId, daysFromToday });
    setReadingNoteId(saved.id);
  };

  const deleteNote = async (noteId) => {
    await deleteNoteMutation.mutateAsync(noteId);
    if (readingNoteId === noteId) {
      setReadingNoteId(null);
    }
    if (editingNoteId === noteId) {
      clearEdit();
    }
  };

  return (
    <div className="space-y-6">
      <header className="premium-page-header rounded-2xl p-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300">
          <StickyNote size={15} />
          Notes
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white">Smart revision notes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Write once, revise later. Notes store markdown, code, tables, images, tags, pin/favorite state, and backend-generated revision dates.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categoriesQuery.isLoading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
        ) : categorySummaries.length ? categorySummaries.slice(0, 4).map((summary) => (
          <article key={summary.category} className="stitch-panel rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400">{summary.category}</div>
            <div className="mt-2 text-2xl font-bold text-white">{summary.notes} notes</div>
            <p className="mt-2 text-xs text-slate-400">Last edited: {formatDate(summary.lastEdited, true)}</p>
            {summary.needsRevision ? <p className="mt-2 text-xs font-semibold text-amber-200">Needs revision</p> : null}
          </article>
        )) : (
          <EmptyState title="No note categories yet" description="Create your first note to start category summaries." />
        )}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title={editingNote ? `Edit note: ${editingNote.title}` : 'Create note'}>
          {(createNoteMutation.isError || updateNoteMutation.isError) ? (
            <div className="mb-4">
              <ApiAlert title="Note save failed" description={getApiErrorMessage(createNoteMutation.error || updateNoteMutation.error)} />
            </div>
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Title</span>
                <input {...register('title', { required: 'Title is required' })} className="w-full rounded-2xl px-4 py-3" />
                {errors.title ? <p className="mt-2 text-sm text-red-300">{errors.title.message}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Category</span>
                <select {...register('category')} className="w-full rounded-2xl px-4 py-3">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['Heading', '## Topic'],
                ['Bold', '**important point**'],
                ['Code', '```java\n// code here\n```'],
                ['Table', '| Concept | Status |\n| --- | --- |\n| Revision | Pending |'],
                ['Image', '![diagram](https://example.com/image.png)'],
              ].map(([label, snippet]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => insertSnippet(snippet)}
                  className="stitch-button-secondary inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
                >
                  {label === 'Code' ? <Code2 size={14} /> : null}
                  {label === 'Table' ? <Table2 size={14} /> : null}
                  {label === 'Image' ? <Image size={14} /> : null}
                  {label}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Markdown / rich text source</span>
              <textarea
                rows="12"
                {...register('contentMarkdown')}
                placeholder="Use headings, bold text, code fences, markdown tables, links, and ![image](url)."
                className="w-full rounded-2xl px-4 py-3 font-mono text-sm leading-6"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Tags</span>
                <input {...register('tags')} placeholder="java, spring, revision" className="w-full rounded-2xl px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Revision date</span>
                <input type="date" {...register('revisionDate')} className="w-full rounded-2xl px-4 py-3" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Image URLs</span>
                <textarea rows="2" {...register('imageUrls')} placeholder="One URL per line or comma separated" className="w-full rounded-2xl px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Attachment URLs</span>
                <textarea rows="2" {...register('attachmentUrls')} placeholder="PDFs, docs, references" className="w-full rounded-2xl px-4 py-3" />
              </label>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" {...register('pinned')} />
                Pin
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" {...register('favorite')} />
                Favorite
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting || createNoteMutation.isPending || updateNoteMutation.isPending}
                className="stitch-button rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSubmitting || createNoteMutation.isPending || updateNoteMutation.isPending ? 'Saving...' : editingNote ? 'Update note' : 'Save note'}
              </button>
              {editingNote ? (
                <button type="button" onClick={clearEdit} className="stitch-button-secondary rounded-full px-5 py-3 text-sm font-semibold">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </SectionCard>

        <div className="min-w-0">
          <SectionCard title="Notes library">
            <div className="mb-4 grid gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4">
                <Search size={16} className="text-slate-500" />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search title, markdown, tags, folder"
                  className="w-full border-0 bg-transparent"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} className="rounded-2xl px-4 py-3">
                  <option value="">All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <select value={filters.favorite} onChange={(event) => setFilters((current) => ({ ...current, favorite: event.target.value }))} className="rounded-2xl px-4 py-3">
                  <option value="">All favorites</option>
                  <option value="true">Favorites</option>
                  <option value="false">Not favorite</option>
                </select>
                <select value={filters.pinned} onChange={(event) => setFilters((current) => ({ ...current, pinned: event.target.value }))} className="rounded-2xl px-4 py-3">
                  <option value="">All pins</option>
                  <option value="true">Pinned</option>
                  <option value="false">Not pinned</option>
                </select>
              </div>
            </div>

            {notesQuery.isError ? (
              <ApiAlert title="Unable to load notes" description={getApiErrorMessage(notesQuery.error)} onRetry={notesQuery.refetch} />
            ) : notesQuery.isLoading ? (
              <Spinner label="Loading notes" />
            ) : notes.length ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <article key={note.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-indigo-300/30">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{note.category}</span>
                      {note.pinned ? <Pin size={13} className="text-indigo-200" /> : null}
                      {note.favorite ? <Star size={13} className="text-amber-200" /> : null}
                      {note.needsRevision ? <span className="rounded-full border border-amber-300/30 px-2 py-0.5 text-amber-200">Revision due</span> : null}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-bold text-white">{note.title}</h3>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">{note.contentMarkdown || 'No content yet.'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>Tags: {note.tags || 'None'}</span>
                      <span>Last edited: {formatDate(note.updatedAt, true)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setReadingNoteId(note.id)} className="stitch-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold">
                        <Eye size={14} />
                        Read
                      </button>
                      <button type="button" onClick={() => beginEdit(note)} className="stitch-button-secondary inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold">
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button type="button" onClick={() => exportMarkdown(note)} className="stitch-button-secondary inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold">
                        <Download size={14} />
                        Markdown
                      </button>
                      <button type="button" onClick={() => deleteNote(note.id)} className="rounded-full border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No notes found" description="Create notes for learning topics, interviews, projects, companies, or revision plans." />
            )}
          </SectionCard>
        </div>
      </section>

      <SectionCard title="Revision queue">
        {revisionsQuery.isLoading ? (
          <Spinner label="Loading revisions" />
        ) : revisionNotes.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {revisionNotes.map((note) => (
              <button key={note.id} type="button" onClick={() => setReadingNoteId(note.id)} className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-left transition hover:border-amber-200/40">
                <div className="text-xs font-semibold text-amber-200">{note.category}</div>
                <h3 className="mt-2 font-bold text-white">{note.title}</h3>
                <p className="mt-2 text-sm text-slate-400">Revision date: {formatDate(note.revisionDate)}</p>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="No revisions due" description="Notes scheduled for revision by the backend will appear here." />
        )}
      </SectionCard>

      <NoteReaderModal
        noteId={readingNoteId}
        note={readingNote}
        isLoading={noteDetailQuery.isLoading}
        isError={noteDetailQuery.isError}
        error={noteDetailQuery.error}
        onClose={() => setReadingNoteId(null)}
        onRetry={noteDetailQuery.refetch}
        onEdit={beginEdit}
        onDelete={deleteNote}
        onScheduleRevision={scheduleRevision}
        schedulePending={scheduleRevisionMutation.isPending}
        onOpenNote={setReadingNoteId}
        relatedNotes={relatedNotes}
      />
    </div>
  );
}

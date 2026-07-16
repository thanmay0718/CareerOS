import { Inbox } from 'lucide-react';

export function EmptyState({ title, description, actionLabel, onActionClick }) {
  return (
    <div className="stitch-panel rounded-2xl border-dashed p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-sky-300 shadow-glow">
        <Inbox size={26} />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onActionClick}
          disabled={!onActionClick}
          className="stitch-button mt-5 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

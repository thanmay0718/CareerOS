export function ApiAlert({ title, description, onRetry, retryLabel = 'Retry' }) {
  return (
    <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <h3 className="text-lg font-semibold text-red-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-200/80">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full border border-red-300/30 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/10"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}


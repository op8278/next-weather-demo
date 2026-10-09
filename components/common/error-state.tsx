"use client";

type ErrorStateProps = {
  message: string;
  retryLabel: string;
  onRetry?: () => void;
};

export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center text-white">
      <p className="max-w-xs text-base text-white/85">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/18"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

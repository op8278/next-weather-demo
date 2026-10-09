"use client";

type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/80">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white/90"
        aria-hidden
      />
      <p className="text-sm tracking-wide">{label}</p>
    </div>
  );
}

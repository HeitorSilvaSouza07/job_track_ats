type ATSScoreProps = {
  score: number;
};

export function ATSScore({ score }: ATSScoreProps) {
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">ATS Score</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{safeScore}%</p>
        </div>
        <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-950" style={{ width: `${safeScore}%` }} />
        </div>
      </div>
    </section>
  );
}

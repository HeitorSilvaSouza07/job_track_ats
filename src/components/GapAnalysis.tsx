type GapAnalysisProps = {
  matchedSkills: string[];
  missingSkills: string[];
};

function SkillColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Sem itens para exibir.</p>
        )}
      </div>
    </div>
  );
}

export function GapAnalysis({ matchedSkills, missingSkills }: GapAnalysisProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Gap Analysis</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <SkillColumn title="Skills compativeis" items={matchedSkills} />
        <SkillColumn title="Skills faltantes" items={missingSkills} />
      </div>
    </section>
  );
}

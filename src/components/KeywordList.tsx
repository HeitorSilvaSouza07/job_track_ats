type KeywordListProps = {
  title: string;
  keywords: string[];
};

export function KeywordList({ title, keywords }: KeywordListProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {keywords.length ? (
          keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-700"
            >
              {keyword}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">Nenhuma keyword encontrada.</p>
        )}
      </div>
    </section>
  );
}

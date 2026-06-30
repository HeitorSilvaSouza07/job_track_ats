type ResumePreviewProps = {
  title: string;
  content: string;
};

export function ResumePreview({ title, content }: ResumePreviewProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
        {content || "Nenhum conteudo disponivel ainda."}
      </pre>
    </section>
  );
}

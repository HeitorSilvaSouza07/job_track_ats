"use client";

import { useMemo, useState } from "react";
import { ATSScore } from "@/components/ATSScore";
import { GapAnalysis } from "@/components/GapAnalysis";
import { KeywordList } from "@/components/KeywordList";
import { ResumePreview } from "@/components/ResumePreview";
import { UploadForm } from "@/components/UploadForm";
import type { AtsAnalysis } from "@/types/ats";

type AnalyzeResponse = AtsAnalysis;
type OptimizeResponse = AtsAnalysis;

export function ATSWorkspace() {
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [optimized, setOptimized] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadLabel = useMemo(
    () => (optimized?.optimizedContent ? "Baixar PDF otimizado" : "Baixar PDF"),
    [optimized?.optimizedContent]
  );

  async function handleAnalyze(payload: { jobDescription: string; file: File }) {
    setError(null);
    setLoading(true);
    setOptimized(null);

    try {
      const formData = new FormData();
      formData.append("jobDescription", payload.jobDescription);
      formData.append("file", payload.file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Falha ao analisar o curriculo.");
      }

      const data = (await response.json()) as AnalyzeResponse;
      setAnalysis(data);
      setOptimized(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOptimize() {
    if (!analysis) {
      return;
    }

    setError(null);
    setOptimizing(true);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ resumeId: analysis.resumeId })
      });

      if (!response.ok) {
        throw new Error("Falha ao otimizar o curriculo.");
      }

      const data = (await response.json()) as OptimizeResponse;
      setOptimized(data);
      setAnalysis((current) => (current ? { ...current, optimizedContent: data.optimizedContent, score: data.score } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setOptimizing(false);
    }
  }

  async function handleDownload() {
    const resumeId = optimized?.resumeId ?? analysis?.resumeId;
    if (!resumeId) {
      return;
    }

    const response = await fetch("/api/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ resumeId })
    });

    if (!response.ok) {
      setError("Nao foi possivel gerar o PDF.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume-optimized.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  const active = optimized ?? analysis;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-8">
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">ATS Resume Optimizer</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cole a vaga, envie o curriculo e deixe o sistema apontar o score, os gaps e a versao otimizada.
          </p>
        </div>
        <UploadForm onAnalyze={handleAnalyze} isSubmitting={loading} />
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        {analysis ? (
          <button
            type="button"
            onClick={handleOptimize}
            disabled={optimizing}
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {optimizing ? "Otimizando..." : "Otimizar com IA"}
          </button>
        ) : null}
        {active ? (
          <button
            type="button"
            onClick={handleDownload}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            {downloadLabel}
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        {active ? (
          <>
            <ATSScore score={active.score} />
            <KeywordList title="Keywords encontradas" keywords={active.keywords} />
            <GapAnalysis matchedSkills={active.matchedKeywords} missingSkills={active.missingKeywords} />
            <ResumePreview
              title={optimized?.optimizedContent ? "Curriculo otimizado" : "Previa do curriculo original"}
              content={optimized?.optimizedContent ?? analysis?.originalContent ?? ""}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 shadow-sm">
            O resultado da analise vai aparecer aqui.
          </div>
        )}
      </div>
    </div>
  );
}

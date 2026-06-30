"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const uploadSchema = z.object({
  jobDescription: z.string().min(80, "Cole a vaga com mais detalhes.")
});

type UploadValues = z.infer<typeof uploadSchema>;

type UploadFormProps = {
  onAnalyze: (payload: { jobDescription: string; file: File }) => Promise<void>;
  isSubmitting: boolean;
};

export function UploadForm({ onAnalyze, isSubmitting }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      jobDescription: ""
    }
  });

  const submitHandler = handleSubmit(async (values) => {
    if (!selectedFile) {
      setFileError("Selecione um PDF ou DOCX.");
      return;
    }

    setFileError(null);
    await onAnalyze({ jobDescription: values.jobDescription, file: selectedFile });
  });

  return (
    <form onSubmit={submitHandler} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="jobDescription" className="text-sm font-medium text-slate-700">
          Descricao da vaga
        </label>
        <textarea
          id="jobDescription"
          rows={12}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-950"
          placeholder="Cole aqui o texto completo da vaga..."
          {...register("jobDescription")}
        />
        {errors.jobDescription ? <p className="mt-2 text-sm text-red-600">{errors.jobDescription.message}</p> : null}
      </div>

      <div>
        <label htmlFor="resumeFile" className="text-sm font-medium text-slate-700">
          Curriculo em PDF ou DOCX
        </label>
        <input
          id="resumeFile"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null);
            setFileError(null);
          }}
        />
        {fileError ? <p className="mt-2 text-sm text-red-600">{fileError}</p> : null}
        {!fileError && !selectedFile ? <p className="mt-2 text-sm text-slate-500">Nenhum arquivo selecionado.</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Analisando..." : "Analisar curriculo"}
      </button>
    </form>
  );
}

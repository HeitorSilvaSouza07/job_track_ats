async function readFileBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isDocx(file: File): boolean {
  return (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  );
}

import { PdfReader } from "pdfreader";

function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const rows: string[] = [];
    const reader = new PdfReader();

    reader.parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
        return;
      }

      if (!item) {
        resolve(rows.join("\n").trim());
        return;
      }

      if (item.text) {
        rows.push(item.text);
      }
    });
  });
}

export async function extractResumeText(file: File): Promise<string> {
  const buffer = await readFileBuffer(file);

  if (isPdf(file)) {
    return extractPdfText(buffer);
  }

  if (isDocx(file)) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return String(result.value ?? "").trim();
  }

  throw new Error("Only PDF and DOCX files are supported");
}

export function normalizeFilename(fileName: string): string {
  return fileName.replace(/[^\w.\- ]+/g, "_").trim();
}

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { exportRequestSchema } from "@/lib/schemas";
import { findResumeById } from "@/services/resume.service";

export const runtime = "nodejs";

function wrapText(text: string, maxCharacters = 92): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxCharacters) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
      continue;
    }

    currentLine = candidate;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

async function buildPdf(title: string, content: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 40;
  const lineHeight = 14;
  let cursorY = 800;

  const drawText = (text: string, size = 11, bold = false) => {
    page.drawText(text, {
      x: margin,
      y: cursorY,
      size,
      font: bold ? boldFont : font,
      color: rgb(0.08, 0.1, 0.14)
    });
    cursorY -= lineHeight;
  };

  drawText(title, 18, true);
  cursorY -= 10;

  for (const line of wrapText(content, 88)) {
    if (cursorY < 60) {
      page = pdf.addPage([595.28, 841.89]);
      cursorY = 800;
    }

    drawText(line, 10, false);
  }

  return pdf.save();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId } = exportRequestSchema.parse(body);
    const resume = await findResumeById(resumeId);

    if (!resume) {
      return NextResponse.json({ message: "Curriculo nao encontrado." }, { status: 404 });
    }

    const content = resume.optimizedContent || resume.originalContent;
    const pdfBytes = await buildPdf(
      `ATS Resume Optimizer - ${resume.fileName}`,
      `Job score: ${resume.atsScore}%\n\n${content}`
    );

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resume.fileName.replace(/\.[^.]+$/, "")}-optimized.pdf"`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao exportar";
    return NextResponse.json({ message }, { status: 400 });
  }
}

"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, FileText, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { saveApplicationDraft } from "@/app/actions/applications";
import { AppHeader, AppShell } from "@/components/layout";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui";
import type { DraftSection } from "@/lib/applications/defaults";

interface ViewDraftPageProps {
  applicationId: string;
  title: string;
  sections: DraftSection[];
  savedAt: string;
}

export function ViewDraftPage({
  applicationId,
  title: initialTitle,
  sections: initialSections,
  savedAt,
}: ViewDraftPageProps) {
  const [title, setTitle] = useState(initialTitle);
  const [sections, setSections] = useState(initialSections);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function updateSection(index: number, body: string) {
    setSections((current) =>
      current.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, body } : section,
      ),
    );
  }

  function handleExportPdf() {
    const pdf = createDraftPdf(title, sections);
    const url = window.URL.createObjectURL(
      new Blob([pdf], { type: "application/pdf" }),
    );
    const link = document.createElement("a");

    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "application-draft"}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function handleSaveDraft() {
    setSaveMessage(null);

    startSaving(async () => {
      const result = await saveApplicationDraft({
        id: applicationId,
        title,
        sections,
      });

      setSaveMessage(result.success ? "Draft saved" : result.error);
    });
  }

  return (
    <AppShell header={<AppHeader showSearch={false} title="View Draft" />}>
      <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
        <Link
          href="/applications/builder"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to drafting lab
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card padding="lg">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="default">AI draft</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-success-dark">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Generated just now
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-text">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Last saved {new Date(savedAt).toLocaleDateString()}.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleExportPdf}>
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button size="sm" onClick={handleSaveDraft} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save draft"}
                </Button>
              </div>
            </div>

            <div className="space-y-5 pt-6">
              <Input
                label="Draft title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              {saveMessage && (
                <p className="text-sm text-text-secondary">{saveMessage}</p>
              )}
              {sections.map((section, index) => (
                <section
                  key={section.title}
                  className="rounded-md border border-border bg-bg p-4"
                >
                  <div className="mb-3">
                    <h2 className="font-semibold text-text">{section.title}</h2>
                  </div>
                  <Textarea
                    value={section.body}
                    rows={5}
                    onChange={(event) => updateSection(index, event.target.value)}
                    className="min-h-32 resize-y bg-surface leading-relaxed"
                  />
                </section>
              ))}
            </div>
          </Card>

          <aside className="space-y-4">
            <Card padding="md" className="border-primary/20 bg-primary-light/20">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-semibold text-text">AI review panel</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Use these tools to refine the generated application.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {["Improve tone", "Add measurable outcomes", "Shorten draft"].map(
                  (action) => (
                    <Button
                      key={action}
                      type="button"
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      {action}
                    </Button>
                  ),
                )}
              </div>
            </Card>

            <Card padding="md">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-semibold text-text">Draft status</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Ready for internal edits before submission.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function createDraftPdf(
  title: string,
  sections: { title: string; body: string }[],
) {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 72;
  const contentWidth = pageWidth - margin * 2;
  const pages: string[][] = [[]];
  let y = pageHeight - margin;

  function currentPage() {
    return pages[pages.length - 1];
  }

  function addPage() {
    pages.push([]);
    y = pageHeight - margin;
  }

  function ensureSpace(height: number) {
    if (y - height < margin) {
      addPage();
    }
  }

  function addText(text: string, x: number, size: number, lineHeight: number) {
    ensureSpace(lineHeight);
    currentPage().push(`BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
    y -= lineHeight;
  }

  function addWrappedText(text: string, size: number, lineHeight: number) {
    const maxChars = Math.max(20, Math.floor(contentWidth / (size * 0.52)));
    const paragraphs = text.split(/\n+/);

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lines = wrapText(paragraph, maxChars);
      lines.forEach((line) => addText(line, margin, size, lineHeight));

      if (paragraphIndex < paragraphs.length - 1) {
        y -= lineHeight / 2;
      }
    });
  }

  addText(title, margin, 20, 28);
  addText("Generated draft - GrantClient", margin, 10, 24);
  y -= 8;

  sections.forEach((section) => {
    ensureSpace(64);
    addText(section.title, margin, 14, 20);
    addWrappedText(section.body, 11, 16);
    y -= 12;
  });

  return buildPdfDocument(pages, pageWidth, pageHeight);
}

function buildPdfDocument(pages: string[][], pageWidth: number, pageHeight: number) {
  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((lines) => {
    const content = lines.join("\n");
    const contentObjectNumber = objects.length + 2;
    const pageObjectNumber = objects.length + 1;

    pageObjectNumbers.push(pageObjectNumber);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
    );
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects[1] =
    `<< /Type /Pages /Kids [${pageObjectNumbers
      .map((number) => `${number} 0 R`)
      .join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function wrapText(text: string, maxChars: number) {
  const words = sanitizePdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;

    if (nextLine.length <= maxChars) {
      line = nextLine;
      return;
    }

    if (line) {
      lines.push(line);
    }

    line = word;
  });

  if (line) {
    lines.push(line);
  }

  return lines.length > 0 ? lines : [""];
}

function escapePdfText(value: string) {
  return sanitizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function sanitizePdfText(value: string) {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/•/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

"use client";

import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Download, FileText, Sparkles, Wand2 } from "lucide-react";
import { useState, useTransition } from "react";
import { saveApplicationDraft } from "@/app/actions/applications";
import { generateApplicationSection } from "@/app/actions/ai";
import { AppShell } from "@/components/layout";
import { Badge, Button, Card, Input, PageContainer, Textarea } from "@/components/ui";
import type { DraftSection } from "@/lib/applications/defaults";
import { proposalTemplate } from "@/lib/applications/proposal-template";

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
  const [isGenerating, startGenerating] = useTransition();
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);

  function updateSection(index: number, body: string) {
    setSections((current) =>
      current.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, body, status: "draft" } : section,
      ),
    );
  }

  function generateSection(index: number) {
    const section = sections[index];
    if (!section?.sectionKey) return;
    setSaveMessage(null);
    setGeneratingKey(section.sectionKey);
    startGenerating(async () => {
      const result = await generateApplicationSection({
        applicationId,
        sectionKey: section.sectionKey!,
      });
      setGeneratingKey(null);
      if (!result.success) {
        setSaveMessage(result.error);
        return;
      }
      setSections((current) => current.map((item, sectionIndex) =>
        sectionIndex === index
          ? {
              ...item,
              previousBody: result.section.previousContent,
              body: result.section.content,
              missingInformation: result.section.missingInformation,
              usedSourceFields: result.section.usedSourceFields,
              status: "draft",
            }
          : item,
      ));
      setSaveMessage("Section generated and saved");
    });
  }

  function setSectionComplete(index: number) {
    setSections((current) => current.map((section, sectionIndex) =>
      sectionIndex === index
        ? { ...section, status: section.status === "complete" ? "draft" : "complete" }
        : section,
    ));
  }

  async function handleExportPdf() {
    const logo = await loadPdfLogo().catch(() => null);
    const pdf = createDraftPdf(title, sections, logo);
    const url = window.URL.createObjectURL(
      new Blob([pdf], { type: "application/pdf" }),
    );
    const link = document.createElement("a");

    link.href = url;
    link.download = formatPdfFileName(title);
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
    <AppShell header={null}>
      <PageContainer size="lg" className="space-y-6 py-8 sm:py-10 lg:py-12">
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
                  <Badge variant="default">Structured proposal</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-success-dark">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Saved section by section
                  </span>
                </div>
                <h1 className="text-3xl font-semibold tracking-[-0.035em] text-text sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Last saved {new Date(savedAt).toLocaleDateString()}.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={handleExportPdf}
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
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
              {sections.map((section, index) => {
                const template = proposalTemplate.find((item) => item.id === section.sectionKey);
                return (
                <section
                  key={section.sectionKey ?? section.title}
                  className="rounded-xl border border-border bg-bg p-4 sm:p-5"
                >
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="font-semibold text-text">{section.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {template?.aiEnabled && (
                        <Button
                          type="button"
                          variant={section.body ? "ghost" : "secondary"}
                          size="sm"
                          onClick={() => generateSection(index)}
                          disabled={isGenerating}
                        >
                          <Wand2 className="h-4 w-4" />
                          {generatingKey === section.sectionKey
                            ? "Generating..."
                            : section.body
                              ? "Regenerate"
                              : "Generate section"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        className={
                          section.status === "complete"
                            ? "bg-success hover:bg-success-dark"
                            : undefined
                        }
                        onClick={() => setSectionComplete(index)}
                      >
                        <Check className="h-4 w-4" />
                        {section.status === "complete" ? "Completed" : "Mark complete"}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={section.body}
                    rows={5}
                    placeholder={template?.deterministic ? "Saved facts appear here." : "Generate this section or write your own response."}
                    onChange={(event) => updateSection(index, event.target.value)}
                    className="min-h-32 resize-y bg-surface leading-relaxed"
                  />
                  {section.missingInformation && section.missingInformation.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-1 text-xs text-warning-dark">
                      <span>Needs input:</span>
                      {section.missingInformation.map((item, itemIndex) => (
                        <span key={`${item}-${itemIndex}`}>
                          <Link
                            href={`/applications/builder?edit=${encodeURIComponent(applicationId)}`}
                            className="font-medium underline underline-offset-2 hover:text-warning-dark/80"
                          >
                            {item}
                          </Link>
                          {itemIndex < section.missingInformation!.length - 1
                            ? ","
                            : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
                );
              })}
            </div>
          </Card>

          <aside className="space-y-4">
            <Card padding="md" className="border-primary/20 bg-primary-light/20">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-semibold text-text">Section drafting</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Generate one narrative section at a time. Existing text remains intact if generation fails.
                  </p>
                </div>
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
      </PageContainer>
    </AppShell>
  );
}

function formatPdfFileName(value: string) {
  const cleaned = value
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "");
  const titleCased = cleaned
    .split(" ")
    .map((word) => word ? `${word[0].toUpperCase()}${word.slice(1)}` : word)
    .join(" ");

  return `${titleCased || "Application Draft"}.pdf`;
}

interface PdfLogoImage {
  hex: string;
  width: number;
  height: number;
}

function loadPdfLogo(): Promise<PdfLogoImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to prepare the PDF logo."));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const encoded = canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
      if (!encoded) {
        reject(new Error("Unable to encode the PDF logo."));
        return;
      }

      const binary = window.atob(encoded);
      let hex = "";
      for (let index = 0; index < binary.length; index += 1) {
        hex += binary.charCodeAt(index).toString(16).padStart(2, "0");
      }

      resolve({ hex, width: canvas.width, height: canvas.height });
    };
    image.onerror = () => reject(new Error("Unable to load the PDF logo."));
    image.src = "/brand/grantclient-logo-transparent.png";
  });
}

function createDraftPdf(
  title: string,
  sections: { title: string; body: string }[],
  logo: PdfLogoImage | null,
) {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 54;
  const footerBoundary = 54;
  const contentWidth = pageWidth - margin * 2;
  const pages: string[][] = [];
  let y = 0;

  function currentPage() {
    return pages[pages.length - 1];
  }

  function addPage() {
    pages.push([]);
    currentPage().push(
      "q 0.04 0.66 0.91 rg 54 745 504 2 re f Q",
      logo
        ? `q 106 0 0 23 ${margin} 751 cm /Logo Do Q`
        : `BT /F2 9 Tf 0.12 0.36 0.55 rg ${margin} 758 Td (GRANTCLIENT) Tj ET`,
      `BT /F2 8 Tf 0.37 0.44 0.50 rg ${pageWidth - margin - 42} 758 Td (DRAFT) Tj ET`,
    );
    y = 718;
  }

  function ensureSpace(height: number) {
    if (y - height < footerBoundary) {
      addPage();
    }
  }

  function addText(
    text: string,
    x: number,
    size: number,
    lineHeight: number,
    font = "F1",
    color = "0.12 0.15 0.20",
  ) {
    ensureSpace(lineHeight);
    currentPage().push(
      `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(text)}) Tj ET`,
    );
    y -= lineHeight;
  }

  function addWrappedLine(
    text: string,
    {
      x = margin,
      width = contentWidth,
      size = 10.5,
      lineHeight = 15,
      font = "F1",
      color = "0.18 0.21 0.25",
      characterWidthFactor = 0.5,
    }: {
      x?: number;
      width?: number;
      size?: number;
      lineHeight?: number;
      font?: string;
      color?: string;
      characterWidthFactor?: number;
    } = {},
  ) {
    const maxChars = Math.max(
      20,
      Math.floor(width / (size * characterWidthFactor)),
    );
    const lines = wrapText(text, maxChars);
    lines.forEach((line) => addText(line, x, size, lineHeight, font, color));
  }

  function addBodyText(text: string) {
    const sourceLines = sanitizePdfText(text).split(/\r?\n/);

    sourceLines.forEach((sourceLine, index) => {
      const paragraph = sourceLine.trim();
      if (!paragraph) {
        y -= 7;
        return;
      }

      const isBullet = /^[-*]\s+/.test(paragraph);
      const isNeedsInput = paragraph.includes("[NEEDS INPUT:");
      const textX = isBullet ? margin + 14 : margin;
      const textWidth = isBullet ? contentWidth - 14 : contentWidth;
      const textColor = isNeedsInput
        ? "0.65 0.34 0.08"
        : "0.18 0.21 0.25";
      const labelMatch = paragraph.match(/^([A-Za-z][A-Za-z /&-]{0,38}:)\s*(.*)$/);

      if (labelMatch && !isBullet) {
        const [, label, value] = labelMatch;
        const maxChars = Math.max(20, Math.floor(textWidth / (10.5 * 0.5)));
        const lines = wrapText(`${label} ${value}`.trim(), maxChars);

        lines.forEach((line, lineIndex) => {
          if (lineIndex === 0 && line.startsWith(label)) {
            ensureSpace(15);
            const remainder = line.slice(label.length);
            currentPage().push(
              `BT /F2 10.5 Tf ${textColor} rg ${textX} ${y} Td (${escapePdfText(label)}) Tj /F1 10.5 Tf (${escapePdfText(remainder)}) Tj ET`,
            );
            y -= 15;
          } else {
            addText(line, textX, 10.5, 15, "F1", textColor);
          }
        });
      } else {
        addWrappedLine(paragraph, {
          x: textX,
          width: textWidth,
          color: textColor,
        });
      }

      if (index < sourceLines.length - 1) y -= 4;
    });
  }

  addPage();
  const proposalTitle = title || "Untitled Application";
  const titleFontSize = 20;
  const titleLineHeight = 25;
  const titleWidth = contentWidth - 48;
  const titleLines = wrapText(
    proposalTitle,
    Math.floor(titleWidth / (titleFontSize * 0.56)),
  );
  const titleCardTop = 704;
  const titleCardHeight = 80 + titleLines.length * titleLineHeight;
  const titleCardBottom = titleCardTop - titleCardHeight;

  currentPage().push(
    `q 0.97 0.98 0.99 rg ${margin} ${titleCardBottom} ${contentWidth} ${titleCardHeight} re f Q`,
    `q 0.04 0.66 0.91 rg ${margin} ${titleCardBottom} 4 ${titleCardHeight} re f Q`,
    `q 0.90 0.92 0.94 RG 0.7 w ${margin} ${titleCardBottom} ${contentWidth} ${titleCardHeight} re S Q`,
  );
  y = titleCardTop - 25;
  addText(
    "FUNDING PROPOSAL",
    margin + 24,
    8,
    21,
    "F2",
    "0.04 0.53 0.75",
  );
  y -= 7;
  titleLines.forEach((line) =>
    addText(
      line,
      margin + 24,
      titleFontSize,
      titleLineHeight,
      "F2",
      "0.02 0.16 0.24",
    ),
  );
  y -= 5;
  addText(
    `Prepared ${new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`,
    margin + 24,
    9,
    15,
    "F1",
    "0.37 0.44 0.50",
  );
  y = titleCardBottom - 30;

  sections.forEach((section, index) => {
    ensureSpace(82);
    const headingLines = wrapText(
      `${index + 1}. ${section.title || "Untitled section"}`,
      58,
    ).slice(0, 2);
    const headingHeight = 24 + Math.max(0, headingLines.length - 1) * 15;
    currentPage().push(
      `q 0.93 0.96 0.98 rg ${margin} ${y - headingHeight + 7} ${contentWidth} ${headingHeight} re f Q`,
      `q 0.12 0.36 0.55 rg ${margin} ${y - headingHeight + 7} 4 ${headingHeight} re f Q`,
    );
    y -= 10;
    headingLines.forEach((line) =>
      addText(line, margin + 16, 12, 15, "F2", "0.08 0.19 0.28"),
    );
    y -= 12;

    if (section.body.trim()) {
      addBodyText(section.body);
    } else {
      addText(
        "No content has been added to this section.",
        margin,
        10,
        15,
        "F1",
        "0.48 0.51 0.55",
      );
    }
    y -= 22;
  });

  pages.forEach((page, index) => {
    page.push(
      `q 0.82 0.85 0.88 RG 0.5 w ${margin} 38 m ${pageWidth - margin} 38 l S Q`,
      `BT /F1 8 Tf 0.45 0.49 0.54 rg ${margin} 24 Td (Grantclient - Confidential draft) Tj ET`,
      `BT /F1 8 Tf 0.45 0.49 0.54 rg ${pageWidth - margin - 62} 24 Td (Page ${index + 1} of ${pages.length}) Tj ET`,
    );
  });

  return buildPdfDocument(pages, pageWidth, pageHeight, logo);
}

function buildPdfDocument(
  pages: string[][],
  pageWidth: number,
  pageHeight: number,
  logo: PdfLogoImage | null,
) {
  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>");
  const logoObjectNumber = logo ? objects.length + 1 : null;
  if (logo) {
    const imageStream = `${logo.hex}>`;
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${imageStream.length} >>\nstream\n${imageStream}\nendstream`,
    );
  }

  pages.forEach((lines) => {
    const content = lines.join("\n");
    const contentObjectNumber = objects.length + 2;
    const pageObjectNumber = objects.length + 1;

    pageObjectNumbers.push(pageObjectNumber);
    const imageResources = logoObjectNumber
      ? ` /XObject << /Logo ${logoObjectNumber} 0 R >>`
      : "";
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>${imageResources} >> /Contents ${contentObjectNumber} 0 R >>`,
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

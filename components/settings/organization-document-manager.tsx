"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import type { Tables } from "@/types/database";

type OrganizationDocument = Tables<"organization_documents">;

export function OrganizationDocumentManager({
  initialDocuments,
}: {
  initialDocuments: OrganizationDocument[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File) {
    setIsUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/organization-documents", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as {
      document?: OrganizationDocument;
      error?: string;
    };
    setIsUploading(false);
    if (!response.ok || !payload.document) {
      setMessage(payload.error ?? "Unable to upload the document.");
      return;
    }
    setDocuments((current) => [payload.document!, ...current]);
    setMessage("Document uploaded");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: string) {
    setMessage(null);
    const response = await fetch("/api/organization-documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Unable to remove the document.");
      return;
    }
    setDocuments((current) => current.filter((document) => document.id !== id));
    setMessage("Document removed");
  }

  return (
    <Card padding="md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-text">Supporting Documents</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Private attachments for applications and document checklists.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>
      {message && <p className="mt-3 text-sm text-text-secondary">{message}</p>}
      {documents.length > 0 ? (
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center gap-3 py-3">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{document.file_name}</p>
                <p className="text-xs text-text-muted">
                  {(document.size_bytes / 1024).toFixed(0)} KB
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label={`Remove ${document.file_name}`}
                title="Remove document"
                onClick={() => void remove(document.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-text-muted">No supporting documents uploaded.</p>
      )}
    </Card>
  );
}

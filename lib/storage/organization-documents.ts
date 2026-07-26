export const ORGANIZATION_DOCUMENT_BUCKET = "organization-documents";
export const MAX_ORGANIZATION_DOCUMENT_SIZE = 10 * 1024 * 1024;

export const ORGANIZATION_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]);

export function safeDocumentFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "document";
}

function startsWithBytes(bytes: Uint8Array, expected: number[]) {
  return expected.every((byte, index) => bytes[index] === byte);
}

export function matchesDocumentSignature(
  contentType: string,
  bytes: Uint8Array,
) {
  switch (contentType.trim().toLowerCase()) {
    case "application/pdf":
      return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
    case "image/png":
      return startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/jpeg":
      return startsWithBytes(bytes, [0xff, 0xd8, 0xff]);
    case "application/msword":
    case "application/vnd.ms-excel":
      return startsWithBytes(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return startsWithBytes(bytes, [0x50, 0x4b, 0x03, 0x04]);
    default:
      return false;
  }
}

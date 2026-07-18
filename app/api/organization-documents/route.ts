import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isGuestUser } from "@/lib/auth/session";
import {
  MAX_ORGANIZATION_DOCUMENT_SIZE,
  ORGANIZATION_DOCUMENT_BUCKET,
  ORGANIZATION_DOCUMENT_TYPES,
  safeDocumentFileName,
} from "@/lib/storage/organization-documents";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function authenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await authenticatedContext();
  if (!user) return jsonError("Sign in to upload documents.", 401);
  if (isGuestUser(user)) return jsonError("Create an account to upload documents.", 403);

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return jsonError("Choose a document to upload.", 400);
  if (
    file.size <= 0 ||
    file.size > MAX_ORGANIZATION_DOCUMENT_SIZE ||
    !ORGANIZATION_DOCUMENT_TYPES.has(file.type)
  ) {
    return jsonError("Choose a PDF, Word, Excel, PNG, or JPEG file under 10 MB.", 400);
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organization) return jsonError("Complete organization setup first.", 400);

  const fileName = safeDocumentFileName(file.name);
  const storagePath = `${user.id}/${crypto.randomUUID()}-${fileName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(ORGANIZATION_DOCUMENT_BUCKET)
    .upload(storagePath, bytes, { contentType: file.type, cacheControl: "3600" });
  if (uploadError) return jsonError("Unable to upload the document.", 400);

  const { data, error } = await supabase
    .from("organization_documents")
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      file_name: file.name.slice(0, 255),
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("*")
    .single();
  if (error) {
    await supabase.storage.from(ORGANIZATION_DOCUMENT_BUCKET).remove([storagePath]);
    return jsonError("Unable to save the document reference.", 400);
  }
  return NextResponse.json({ document: data });
}

const deleteSchema = z.object({ id: z.uuid() });

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await authenticatedContext();
  if (!user) return jsonError("Sign in to remove documents.", 401);
  if (isGuestUser(user)) return jsonError("Create an account to remove documents.", 403);
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid document request.", 400);

  const { data: document } = await supabase
    .from("organization_documents")
    .select("id, storage_path")
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!document) return jsonError("Document not found.", 404);

  const { error: storageError } = await supabase.storage
    .from(ORGANIZATION_DOCUMENT_BUCKET)
    .remove([document.storage_path]);
  if (storageError) return jsonError("Unable to remove the document.", 400);

  const { error } = await supabase
    .from("organization_documents")
    .delete()
    .eq("id", document.id)
    .eq("user_id", user.id);
  if (error) return jsonError("Unable to remove the document reference.", 400);
  return NextResponse.json({ success: true });
}

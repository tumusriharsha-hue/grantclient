import { NextResponse, type NextRequest } from "next/server";
import { isGuestUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  getProfilePictureType,
  MAX_PROFILE_PICTURE_SIZE,
  PROFILE_PICTURE_BUCKET,
} from "@/lib/storage/profile-pictures";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Sign in to update your profile picture.", 401);
  }

  if (isGuestUser(user)) {
    return jsonError("Create an account to update your profile picture.", 403);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Choose an image to upload.", 400);
  }

  if (file.size <= 0 || file.size > MAX_PROFILE_PICTURE_SIZE) {
    return jsonError("Choose an image smaller than 2 MB.", 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const imageType = getProfilePictureType(file.type, bytes);

  if (!imageType) {
    return jsonError("Choose a PNG, JPEG, WebP, or GIF image.", 400);
  }

  const path = `${user.id}/profile-${crypto.randomUUID()}.${imageType.extension}`;
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_PICTURE_BUCKET)
    .upload(path, bytes, {
      cacheControl: "3600",
      contentType: imageType.contentType,
      upsert: false,
    });

  if (uploadError) {
    return jsonError("Unable to upload profile picture.", 400);
  }

  const { data: publicUrlData } = supabase.storage
    .from(PROFILE_PICTURE_BUCKET)
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("organizations")
    .update({ profile_picture_url: publicUrlData.publicUrl })
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (updateError) {
    await supabase.storage.from(PROFILE_PICTURE_BUCKET).remove([path]);
    return jsonError("Unable to update profile picture.", 400);
  }

  return NextResponse.json({ profilePictureUrl: publicUrlData.publicUrl });
}

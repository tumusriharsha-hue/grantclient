"use client";

import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { updateOrganizationProfilePicture } from "@/app/actions/organization";
import { Button, Card } from "@/components/ui";

interface ProfilePictureUploaderProps {
  userId: string | null;
  organizationName: string;
  initialUrl?: string | null;
  canEditProfile: boolean;
}

const allowedProfileImageTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export function ProfilePictureUploader({
  userId,
  organizationName,
  initialUrl,
  canEditProfile,
}: ProfilePictureUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [profileUrl, setProfileUrl] = useState(initialUrl ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initials = organizationName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GC";

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !userId) return;

    const extension =
      allowedProfileImageTypes[file.type as keyof typeof allowedProfileImageTypes];

    if (!extension) {
      setMessage("Choose a PNG, JPEG, WebP, or GIF image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Choose an image smaller than 2 MB.");
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("file", file);

      const response = await fetch("/api/profile-picture", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        profilePictureUrl?: string;
      } | null;

      if (!response.ok || !payload?.profilePictureUrl) {
        setMessage(payload?.error ?? "Unable to upload profile picture.");
        return;
      }

      setProfileUrl(payload.profilePictureUrl);
      setMessage("Profile picture updated.");
    });

    event.target.value = "";
  }

  function handleRemove() {
    setMessage(null);

    startTransition(async () => {
      const result = await updateOrganizationProfilePicture(null);

      if (!result.success) {
        setMessage(result.error);
        return;
      }

      setProfileUrl(null);
      setMessage("Profile picture removed.");
    });
  }

  return (
    <Card padding="lg">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary-light text-xl font-bold text-primary">
            {profileUrl ? (
              <span
                aria-label={`${organizationName} profile`}
                role="img"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${profileUrl})` }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-text">Profile picture</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Add a square logo or organization image for your account profile.
            </p>
            {message && <p className="mt-2 text-sm text-text-secondary">{message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:w-44">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!canEditProfile || isPending || !userId}
            onClick={() => inputRef.current?.click()}
          >
            {profileUrl ? <Upload className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
            {profileUrl ? "Change photo" : "Add photo"}
          </Button>
          {profileUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canEditProfile || isPending}
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

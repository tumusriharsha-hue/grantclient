export const PROFILE_PICTURE_BUCKET = "profile-pictures";
export const MAX_PROFILE_PICTURE_SIZE = 2 * 1024 * 1024;

export const profilePictureTypes = [
  {
    contentType: "image/png",
    extension: "png",
    matches: (bytes: Uint8Array) =>
      hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    contentType: "image/jpeg",
    extension: "jpg",
    matches: (bytes: Uint8Array) =>
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
  },
  {
    contentType: "image/webp",
    extension: "webp",
    matches: (bytes: Uint8Array) =>
      hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8),
  },
  {
    contentType: "image/gif",
    extension: "gif",
    matches: (bytes: Uint8Array) =>
      hasBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
      hasBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
  },
] as const;

export type ProfilePictureType = (typeof profilePictureTypes)[number];

function hasBytes(bytes: Uint8Array, expected: number[], offset = 0) {
  if (bytes.length < offset + expected.length) {
    return false;
  }

  return expected.every((byte, index) => bytes[offset + index] === byte);
}

export function getProfilePictureType(
  contentType: string,
  bytes: Uint8Array,
): ProfilePictureType | null {
  const normalizedContentType = contentType.trim().toLowerCase();

  return (
    profilePictureTypes.find(
      (type) =>
        type.contentType === normalizedContentType && type.matches(bytes),
    ) ?? null
  );
}

export function isOwnProfilePictureUrl(
  value: string,
  userId: string,
  supabaseUrl: string,
) {
  try {
    const url = new URL(value);
    const expectedOrigin = new URL(supabaseUrl).origin;
    const expectedPathPrefix = `/storage/v1/object/public/${PROFILE_PICTURE_BUCKET}/${userId}/`;

    if (url.origin !== expectedOrigin || !url.pathname.startsWith(expectedPathPrefix)) {
      return false;
    }

    return profilePictureTypes.some((type) =>
      url.pathname.toLowerCase().endsWith(`.${type.extension}`),
    );
  } catch {
    return false;
  }
}

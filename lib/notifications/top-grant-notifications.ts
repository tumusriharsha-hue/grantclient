export const GRANT_NOTIFICATIONS_UPDATED_EVENT =
  "grantclient:grant-notifications-updated";

export interface GrantNotification {
  id: string;
  grantId: string;
  grantTitle: string;
  createdAt: string;
  read: boolean;
}

interface TopGrantSummary {
  id: string;
  title: string;
}

function seenKey(userId: string) {
  return `grantclient:seen-top-grants:${userId}`;
}

function notificationsKey(userId: string) {
  return `grantclient:grant-notifications:${userId}`;
}

function readStringArray(key: string) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function getGrantNotifications(userId: string): GrantNotification[] {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(
      window.localStorage.getItem(notificationsKey(userId)) ?? "[]",
    );
    if (!Array.isArray(value)) return [];

    const notifications = value.filter(
      (item): item is GrantNotification =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            !item.id.startsWith("preview:") &&
            !item.id.startsWith("preview-2:") &&
            typeof item.grantId === "string" &&
            typeof item.grantTitle === "string" &&
            typeof item.createdAt === "string" &&
            typeof item.read === "boolean" &&
            item.preview !== true,
        ),
    );
    if (notifications.length !== value.length) {
      window.localStorage.setItem(
        notificationsKey(userId),
        JSON.stringify(notifications),
      );
    }
    return notifications;
  } catch {
    return [];
  }
}

export function syncTopGrantNotifications(
  userId: string,
  grants: TopGrantSummary[],
) {
  if (typeof window === "undefined" || grants.length === 0) return;

  const currentIds = grants.map((grant) => grant.id);
  const seenIds = new Set(readStringArray(seenKey(userId)));
  const newGrants = grants.filter((grant) => !seenIds.has(grant.id));
  window.localStorage.setItem(
    seenKey(userId),
    JSON.stringify([...new Set([...seenIds, ...currentIds])]),
  );
  if (newGrants.length === 0) return;

  const existing = getGrantNotifications(userId);
  const createdAt = new Date().toISOString();
  const added = newGrants.map((grant) => ({
    id: `${grant.id}:${createdAt}`,
    grantId: grant.id,
    grantTitle: grant.title,
    createdAt,
    read: false,
  }));
  window.localStorage.setItem(
    notificationsKey(userId),
    JSON.stringify([...added, ...existing].slice(0, 20)),
  );
  window.dispatchEvent(new Event(GRANT_NOTIFICATIONS_UPDATED_EVENT));
}

export function markGrantNotificationsRead(userId: string) {
  const notifications = getGrantNotifications(userId).map((notification) => ({
    ...notification,
    read: true,
  }));
  window.localStorage.setItem(
    notificationsKey(userId),
    JSON.stringify(notifications),
  );
  return notifications;
}

export function clearGrantNotifications(userId: string) {
  window.localStorage.removeItem(notificationsKey(userId));
  window.dispatchEvent(new Event(GRANT_NOTIFICATIONS_UPDATED_EVENT));
}

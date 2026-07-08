export const DEV_FULL_ACCESS_KEY = "grantclient:dev-full-access";
export const DEV_FULL_ACCESS_COOKIE = "grantclient_dev_full_access";

export function isDevFullAccessEnabled(value: string | undefined): boolean {
  return process.env.NODE_ENV !== "production" && value === "true";
}

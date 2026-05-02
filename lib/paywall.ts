export const ACCESS_COOKIE_NAME = "fec_access";

export function createAccessCookieValue(email: string): string {
  const normalized = email.trim().toLowerCase();
  return `paid:${normalized}`;
}

export function isAccessCookieValid(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return value.startsWith("paid:") && value.length > "paid:".length;
}

export function getEmailFromAccessCookie(value: string | undefined): string | null {
  if (!isAccessCookieValid(value)) {
    return null;
  }

  return value!.slice("paid:".length);
}

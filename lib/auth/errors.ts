export function formatAuthError(message: string, mode?: "signup" | "signin"): string {
  const lower = message.toLowerCase();
  const rateLimitMatch = message.match(/after (\d+) seconds/i);

  if (
    message.includes("For security purposes") ||
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit exceeded")
  ) {
    const wait = rateLimitMatch?.[1];
    if (mode === "signup") {
      return wait
        ? `Supabase email limit reached (applies to all signups, not just one address). Wait ${wait} seconds before trying again.`
        : "Supabase email limit reached (applies to all signups on this project). Try again in a few minutes.";
    }

    return wait
      ? `Too many attempts. Please wait ${wait} seconds before trying again.`
      : "Too many attempts. Please wait about a minute before trying again.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email first. Check your inbox for the confirmation link, then sign in.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }

  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  return message;
}

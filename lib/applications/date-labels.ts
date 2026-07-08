const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

function formatShortDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return shortDateFormatter.format(new Date(year, month - 1, day));
}

export function getLastUpdatedLabel(value: string) {
  return `Last updated: ${formatShortDate(value)}`;
}

export function getSubmittedLabel(value: string) {
  return `Submitted ${formatShortDate(value)}`;
}

export function getDecisionLabel(value: string) {
  return `Decided ${formatShortDate(value)}`;
}

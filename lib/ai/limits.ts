export const AI_LIMITS = {
  organizationMissionCharacters: 1200,
  grantDescriptionCharacters: 1000,
  applicationContextCharacters: 8000,
  applicationQuestionCharacters: 4000,
  sectionMaximumWords: 600,
  matchExplanationOutputTokens: 700,
  sectionOutputTokens: 900,
} as const;

export function truncateForModel(value: string | null | undefined, maxCharacters: number) {
  const text = value?.trim() ?? "";
  return text.length <= maxCharacters ? text : `${text.slice(0, maxCharacters - 3)}...`;
}

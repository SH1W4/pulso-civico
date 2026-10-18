export const COMMUNITY_FEEDBACK_SURVEYS = {
  "feature-priorities": {
    title: "O que você quer acompanhar primeiro?",
    options: [
      { key: "poll-trends", label: "Evolução das pesquisas" },
      { key: "pollster-comparison", label: "Comparar institutos" },
      { key: "regional-context", label: "Meu estado no contexto nacional" },
      { key: "official-results", label: "Apuração oficial" },
    ],
  },
  "transparency-priorities": {
    title: "O que não pode faltar em uma pesquisa?",
    options: [
      { key: "methodology", label: "Metodologia acessível" },
      { key: "verifiable-source", label: "Fonte verificável" },
      { key: "margin-explanation", label: "Margem de erro explicada" },
      { key: "update-history", label: "Histórico de atualizações" },
    ],
  },
} as const;

export type CommunityFeedbackSurvey = keyof typeof COMMUNITY_FEEDBACK_SURVEYS;

export function isCommunityFeedbackSurvey(value: unknown): value is CommunityFeedbackSurvey {
  return typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(COMMUNITY_FEEDBACK_SURVEYS, value);
}

export function isValidFeedbackOption(
  survey: CommunityFeedbackSurvey,
  option: unknown,
): option is string {
  return typeof option === "string" &&
    COMMUNITY_FEEDBACK_SURVEYS[survey].options.some((item) => item.key === option);
}

export function normalizeKey(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isNationalResearch(office: string, state: string, scope: string): boolean {
  const normalizedOffice = normalizeKey(office);
  const normalizedState = normalizeKey(state);
  const normalizedScope = normalizeKey(scope);
  const presidential = normalizedOffice.includes("PRESIDENT");
  const explicitNationalState = ["BR", "BRASIL", "NACIONAL", "PAIS"].includes(normalizedState);
  const explicitNationalScope =
    normalizedScope.includes("NACIONAL") || normalizedScope.includes("BRASIL");
  // An empty UF is not evidence of national scope by itself.
  return presidential && (explicitNationalState || explicitNationalScope);
}

export function parseSampleSize(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Accept plain integers or Brazilian thousands separators (e.g. 2.000),
  // but reject arbitrary text and ambiguous decimal values.
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(trimmed)) return null;
  const parsed = Number(trimmed.replace(/\./g, ""));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

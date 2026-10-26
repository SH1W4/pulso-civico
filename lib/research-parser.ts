import { isNationalResearch, parseSampleSize } from "./research-validation";

export type ResearchCsvRow = Record<string, string>;

export type PresidentialResearchRecord = {
  registration: string;
  institute: string;
  contractor: string | null;
  registeredAt: string | null;
  publishableAt: string | null;
  fieldStart: string | null;
  fieldEnd: string | null;
  sampleSize: number | null;
  state: string;
  status: string | null;
};

function normalizeColumn(value: string): string {
  return value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function field(row: ResearchCsvRow, ...aliases: string[]): string {
  const normalized = new Map(
    Object.entries(row).map(([name, value]) => [normalizeColumn(name), String(value ?? "").trim()]),
  );
  for (const alias of aliases) {
    const value = normalized.get(normalizeColumn(alias));
    if (value) return value;
  }
  return "";
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const brazilian = value.match(/^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/);
  if (brazilian) return `${brazilian[3]}-${brazilian[2]}-${brazilian[1]}`;
  const iso = value.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null;
}

function isNationalPresidentialRow(row: ResearchCsvRow): boolean {
  const office = field(row, "DS_CARGO", "NM_CARGO", "CARGO", "DS_CARGO_PESQUISA");
  const state = field(row, "SG_UF", "UF", "SG_UF_PESQUISA");
  const scope = field(row, "TP_ABRANGENCIA", "DS_ABRANGENCIA", "ABRANGENCIA");
  return isNationalResearch(office, state, scope);
}

/** Maps parsed official CSV rows into the public API contract. */
export function parsePresidentialResearchRows(rows: ResearchCsvRow[]): PresidentialResearchRecord[] {
  return rows
    .filter(isNationalPresidentialRow)
    .map((row) => ({
      registration: field(row, "NR_PESQUISA", "NR_REGISTRO", "DS_REGISTRO", "CD_REGISTRO") || "Registro não identificado",
      institute: field(row, "NM_EMPRESA", "NM_ENTIDADE", "NM_EMPRESA_PESQUISA", "EMPRESA") || "Instituto não informado",
      contractor: field(row, "NM_ENTIDADE", "NM_CONTRATANTE", "CONTRATANTE") || null,
      registeredAt: parseDate(field(row, "DT_REGISTRO", "DT_CADASTRO")),
      publishableAt: parseDate(field(row, "DT_DIVULGACAO", "DT_PREVISTA_DIVULGACAO", "DT_DIVULGACAO_PREVISTA")),
      fieldStart: parseDate(field(row, "DT_INICIO_PESQUISA", "DT_INICIO", "DT_INICIO_CAMPO")),
      fieldEnd: parseDate(field(row, "DT_FIM_PESQUISA", "DT_FIM", "DT_FIM_CAMPO")),
      sampleSize: parseSampleSize(field(row, "QT_ENTREVISTADOS", "QT_AMOSTRA", "QT_ENTREVISTAS", "AMOSTRA")),
      state: field(row, "SG_UF", "UF") || "BR",
      status: field(row, "DS_SITUACAO", "DS_STATUS", "SITUACAO") || null,
    }))
    .sort((a, b) => (b.registeredAt ?? "").localeCompare(a.registeredAt ?? ""));
}

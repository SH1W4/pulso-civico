import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATASET_URL =
  "https://dadosabertos.tse.jus.br/api/3/action/package_show?id=pesquisas-eleitorais-2026";
const TSE_DATASET_PAGE =
  "https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026";
const PESQELE_URL = "https://pesqele-divulgacao.tse.jus.br/";
const MAX_DOWNLOAD_BYTES = 80 * 1024 * 1024;

type CkanResource = { name?: string; format?: string; url?: string; mimetype?: string; last_modified?: string };
type CsvRow = Record<string, string>;

function key(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function field(row: CsvRow, ...aliases: string[]): string {
  const normalized = new Map(Object.entries(row).map(([name, value]) => [key(name), String(value ?? "").trim()]));
  for (const alias of aliases) {
    const value = normalized.get(key(alias));
    if (value) return value;
  }
  return "";
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null;
}

function presidential(row: CsvRow): boolean {
  const office = field(row, "DS_CARGO", "NM_CARGO", "CARGO", "DS_CARGO_PESQUISA");
  const state = field(row, "SG_UF", "UF", "SG_UF_PESQUISA");
  const scope = field(row, "TP_ABRANGENCIA", "DS_ABRANGENCIA", "ABRANGENCIA");
  const isPresident = key(office).includes("PRESIDENT");
  const isNational = !state || ["BR", "BRASIL", "NACIONAL", "PAIS"].includes(key(state)) ||
    key(scope).includes("NACIONAL") || key(scope).includes("BRASIL");
  return isPresident && isNational;
}

export async function GET() {
  try {
    const metadataResponse = await fetch(DATASET_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!metadataResponse.ok) throw new Error("O portal de dados abertos não respondeu.");
    const metadata = (await metadataResponse.json()) as {
      success?: boolean;
      result?: { resources?: CkanResource[] };
    };
    if (!metadata.success || !metadata.result?.resources) {
      throw new Error("O portal não retornou os metadados esperados do conjunto de 2026.");
    }

    const resource = metadata.result.resources.find((item) =>
      /pesquisas eleitorais/i.test(item.name ?? "") &&
      /csv|zip/i.test(`${item.format ?? ""} ${item.mimetype ?? ""}`) &&
      Boolean(item.url),
    );
    if (!resource?.url) throw new Error("O arquivo principal de pesquisas não foi encontrado no conjunto oficial.");

    const fileResponse = await fetch(resource.url, {
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
    if (!fileResponse.ok) throw new Error("Não foi possível baixar o arquivo oficial de pesquisas.");
    const declaredSize = Number(fileResponse.headers.get("content-length") ?? 0);
    if (declaredSize > MAX_DOWNLOAD_BYTES) throw new Error("O arquivo oficial excede o limite de processamento.");
    const archiveBuffer = Buffer.from(await fileResponse.arrayBuffer());
    if (archiveBuffer.byteLength > MAX_DOWNLOAD_BYTES) {
      throw new Error("O arquivo oficial excede o limite de processamento.");
    }

    const archive = new AdmZip(archiveBuffer);
    const csvEntry = archive.getEntries().find((entry) =>
      !entry.isDirectory && /\.(csv|txt)$/i.test(entry.entryName),
    );
    if (!csvEntry) throw new Error("O arquivo compactado não contém CSV/TXT reconhecível.");

    const text = csvEntry.getData().toString("latin1");
    const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
    const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
    const rows = parse(text, {
      columns: true,
      delimiter,
      bom: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    }) as CsvRow[];

    const polls = rows.filter(presidential).map((row) => ({
      registration: field(row, "NR_PESQUISA", "NR_REGISTRO", "DS_REGISTRO", "CD_REGISTRO") || "Registro não identificado",
      institute: field(row, "NM_EMPRESA", "NM_ENTIDADE", "NM_EMPRESA_PESQUISA", "EMPRESA") || "Instituto não informado",
      contractor: field(row, "NM_ENTIDADE", "NM_CONTRATANTE", "CONTRATANTE") || null,
      registeredAt: parseDate(field(row, "DT_REGISTRO", "DT_CADASTRO")),
      publishableAt: parseDate(field(row, "DT_DIVULGACAO", "DT_PREVISTA_DIVULGACAO", "DT_DIVULGACAO_PREVISTA")),
      fieldStart: parseDate(field(row, "DT_INICIO_PESQUISA", "DT_INICIO", "DT_INICIO_CAMPO")),
      fieldEnd: parseDate(field(row, "DT_FIM_PESQUISA", "DT_FIM", "DT_FIM_CAMPO")),
      sampleSize: Number(field(row, "QT_ENTREVISTADOS", "QT_AMOSTRA", "QT_ENTREVISTAS", "AMOSTRA").replace(/\D/g, "")) || null,
      state: field(row, "SG_UF", "UF") || "BR",
      status: field(row, "DS_SITUACAO", "DS_STATUS", "SITUACAO") || null,
    })).sort((a, b) => (b.registeredAt ?? "").localeCompare(a.registeredAt ?? ""));

    if (polls.length === 0) {
      return NextResponse.json({
        error: "O arquivo oficial foi obtido, mas o esquema atual não permitiu identificar registros presidenciais nacionais com segurança.",
        source: TSE_DATASET_PAGE,
        checkedAt: new Date().toISOString(),
      }, { status: 502 });
    }

    return NextResponse.json({
      source: TSE_DATASET_PAGE,
      sourceName: resource.name ?? "Pesquisas eleitorais 2026",
      sourceUpdatedAt: resource.last_modified ?? null,
      checkedAt: new Date().toISOString(),
      count: polls.length,
      records: polls,
      links: { dataset: TSE_DATASET_PAGE, pesqele: PESQELE_URL },
      notice: "Este catálogo contém metadados de registros públicos. Registro no TSE não significa que o Tribunal validou os resultados. Percentuais de intenção de voto devem ser conferidos na publicação ou no relatório associado a cada pesquisa.",
    }, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível consultar a fonte oficial.",
      source: TSE_DATASET_PAGE,
      checkedAt: new Date().toISOString(),
    }, { status: 503 });
  }
}

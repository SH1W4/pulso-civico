import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import { NextResponse } from "next/server";
import { parsePresidentialResearchRows, type ResearchCsvRow } from "@/lib/research-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATASET_URL =
  "https://dadosabertos.tse.jus.br/api/3/action/package_show?id=pesquisas-eleitorais-2026";
const TSE_DATASET_PAGE =
  "https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026";
const PESQELE_URL = "https://pesqele-divulgacao.tse.jus.br/";
const MAX_DOWNLOAD_BYTES = 80 * 1024 * 1024;
const MAX_ARCHIVE_UNCOMPRESSED_BYTES = 160 * 1024 * 1024;

type CkanResource = { name?: string; format?: string; url?: string; mimetype?: string; last_modified?: string };
type CsvRow = ResearchCsvRow;

async function readLimitedBody(response: Response, maxBytes: number): Promise<Buffer> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("A fonte oficial retornou uma resposta sem corpo legível.");
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error("O arquivo oficial excede o limite de processamento.");
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, totalBytes);
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
    const archiveBuffer = await readLimitedBody(fileResponse, MAX_DOWNLOAD_BYTES);

    const archive = new AdmZip(archiveBuffer);
    const entries = archive.getEntries();
    const declaredUncompressedBytes = entries.reduce(
      (sum, entry) => sum + Math.max(0, Number(entry.header.size) || 0),
      0,
    );
    if (declaredUncompressedBytes > MAX_ARCHIVE_UNCOMPRESSED_BYTES) {
      throw new Error("O conteúdo descompactado excede o limite de processamento.");
    }
    const csvEntry = entries.find((entry) =>
      !entry.isDirectory && /\.(csv|txt)$/i.test(entry.entryName),
    );
    if (!csvEntry) throw new Error("O arquivo compactado não contém CSV/TXT reconhecível.");
    if (Number(csvEntry.header.size) > MAX_DOWNLOAD_BYTES) {
      throw new Error("O CSV descompactado excede o limite de processamento.");
    }

    const text = csvEntry.getData().toString("latin1");
    const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
    const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
    const rows = parse(text, {
      columns: true,
      delimiter,
      bom: true,
      skip_empty_lines: true,
      relax_column_count: false,
      trim: true,
    }) as CsvRow[];

    const polls = parsePresidentialResearchRows(rows);

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

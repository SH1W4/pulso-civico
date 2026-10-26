import { describe, expect, it } from "vitest";
import { parsePresidentialResearchRows, type ResearchCsvRow } from "../lib/research-parser";

const nationalRow = (overrides: ResearchCsvRow = {}): ResearchCsvRow => ({
  DS_CARGO: "Presidente",
  SG_UF: "BR",
  TP_ABRANGENCIA: "Nacional",
  NR_PESQUISA: "BR-00001/2026",
  NM_EMPRESA: "Instituto Exemplo",
  DT_REGISTRO: "24/10/2026",
  DT_DIVULGACAO: "2026-10-28",
  DT_INICIO_PESQUISA: "20/10/2026",
  DT_FIM_PESQUISA: "22/10/2026",
  QT_ENTREVISTADOS: "2.000",
  DS_SITUACAO: "Registrada",
  ...overrides,
});

describe("parsePresidentialResearchRows", () => {
  it("maps official national rows into the API record contract", () => {
    expect(parsePresidentialResearchRows([nationalRow()])).toEqual([{
      registration: "BR-00001/2026",
      institute: "Instituto Exemplo",
      contractor: null,
      registeredAt: "2026-10-24",
      publishableAt: "2026-10-28",
      fieldStart: "2026-10-20",
      fieldEnd: "2026-10-22",
      sampleSize: 2000,
      state: "BR",
      status: "Registrada",
    }]);
  });

  it("rejects malformed sample sizes instead of extracting arbitrary digits", () => {
    const rows = [
      nationalRow({ QT_ENTREVISTADOS: "1,5" }),
      nationalRow({ NR_PESQUISA: "BR-00002/2026", QT_ENTREVISTADOS: "2.000 entrevistas" }),
      nationalRow({ NR_PESQUISA: "BR-00003/2026", QT_ENTREVISTADOS: "abc123" }),
    ];
    expect(parsePresidentialResearchRows(rows).map((record) => record.sampleSize)).toEqual([null, null, null]);
  });

  it("excludes state-level records when the national scope is not explicit", () => {
    const rows = [
      nationalRow({ SG_UF: "BA", TP_ABRANGENCIA: "Estadual" }),
      nationalRow({ NR_PESQUISA: "BR-00002/2026", SG_UF: "", TP_ABRANGENCIA: "" }),
    ];
    expect(parsePresidentialResearchRows(rows)).toEqual([]);
  });

  it("sorts newest registration first and tolerates missing optional metadata", () => {
    const rows = [
      nationalRow({ NR_PESQUISA: "OLDER", DT_REGISTRO: "01/10/2026", QT_ENTREVISTADOS: "" }),
      nationalRow({ NR_PESQUISA: "NEWER", DT_REGISTRO: "23/10/2026", NM_EMPRESA: "" }),
    ];
    const parsed = parsePresidentialResearchRows(rows);
    expect(parsed.map((record) => record.registration)).toEqual(["NEWER", "OLDER"]);
    expect(parsed[0].institute).toBe("Instituto não informado");
    expect(parsed[1].sampleSize).toBeNull();
  });
});

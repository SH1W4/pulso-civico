import { describe, expect, it } from "vitest";
import { isNationalResearch, parseSampleSize } from "../lib/research-validation";

describe("isNationalResearch", () => {
  it("accepts explicit national state and scope", () => {
    expect(isNationalResearch("Presidente", "BR", "")).toBe(true);
    expect(isNationalResearch("Presidente", "", "Nacional")).toBe(true);
    expect(isNationalResearch("Presidente", "", "Brasil")).toBe(true);
  });
  it("rejects missing scope and state", () => {
    expect(isNationalResearch("Presidente", "", "")).toBe(false);
  });
  it("rejects state-level presidential research without national scope", () => {
    expect(isNationalResearch("Presidente", "BA", "Estadual")).toBe(false);
  });
  it("rejects non-presidential offices", () => {
    expect(isNationalResearch("Governador", "BR", "Nacional")).toBe(false);
  });
});

describe("parseSampleSize", () => {
  it("parses plain and Brazilian thousands-formatted positive integers", () => {
    expect(parseSampleSize("1200")).toBe(1200);
    expect(parseSampleSize("2.000")).toBe(2000);
  });
  it("rejects empty, zero, decimal and arbitrary text instead of guessing", () => {
    expect(parseSampleSize("")).toBeNull();
    expect(parseSampleSize("0")).toBeNull();
    expect(parseSampleSize("1,5")).toBeNull();
    expect(parseSampleSize("2.000 entrevistas")).toBeNull();
    expect(parseSampleSize("abc123")).toBeNull();
  });
});

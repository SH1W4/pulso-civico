#!/usr/bin/env python3
"""Reproducible public-source collection for Pulso Cívico Observatory.

Writes raw responses and a manifest to ./data-collection/<timestamp>/.
Never writes results to the app database or dashboard.
"""
from __future__ import annotations
import csv, hashlib, json, os, re, zipfile
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo
import requests

TZ = ZoneInfo("America/Bahia")
START = datetime.now(TZ)
OUT = Path("data-collection") / START.strftime("%Y%m%d_%H%M%S")
OUT.mkdir(parents=True, exist_ok=True)
S = requests.Session()
S.headers.update({"User-Agent": "PulsoCivicoObservatory/0.1 (+public-data research)", "Accept": "*/*"})
TIMEOUT = (15, 90)
SOURCES = {
    "polymarket_event": ("https://gamma-api.polymarket.com/events?slug=brazil-presidential-election", "json"),
    "polymarket_markets": ("https://gamma-api.polymarket.com/markets?slug=brazil-presidential-election", "json"),
    "tse_research_zip": ("https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip", "binary"),
    "tse_contractors_zip": ("https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_contratante_2026.zip", "binary"),
    "tse_payers_zip": ("https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_pagante_2026.zip", "binary"),
    "tse_catalog": ("https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026", "html"),
    "pesqele": ("https://pesqele-divulgacao.tse.jus.br/", "html"),
}
manifest = {
    "project": "Pulso Cívico Observatory",
    "started_at_local": START.isoformat(),
    "started_at_utc": datetime.now(timezone.utc).isoformat(),
    "timezone": "America/Bahia",
    "sources": [],
    "caveats": [
        "Snapshot only; prices and order books may change immediately.",
        "Market prices are not polling data or official election results.",
        "TSE ZIP files are preserved with checksums; data timestamps must be read from the downloaded files.",
        "Collection is read-only and does not write to the dashboard or application database.",
    ],
}
def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()
def fetch(name, url, kind):
    rec = {"name": name, "url": url, "attempted_at": datetime.now(TZ).isoformat()}
    try:
        with S.get(url, timeout=TIMEOUT, stream=True) as response:
            rec.update(http_status=response.status_code, content_type=response.headers.get("content-type"),
                       last_modified=response.headers.get("last-modified"), etag=response.headers.get("etag"))
            response.raise_for_status()
            suffix = {"json": ".json", "binary": ".zip", "html": ".html"}[kind]
            path = OUT / f"{name}{suffix}"
            with path.open("wb") as f:
                for chunk in response.iter_content(1024 * 256):
                    if chunk:
                        f.write(chunk)
            rec.update(result="downloaded", file=str(path), bytes=path.stat().st_size, sha256=sha256(path))
            if kind == "json":
                try:
                    rec["parsed"] = json.loads(path.read_text(encoding="utf-8"))
                except Exception as e:
                    rec["parse_error"] = str(e)
            if kind == "binary":
                try:
                    with zipfile.ZipFile(path) as z:
                        bad = z.testzip()
                        rec["zip_integrity"] = "ok" if bad is None else f"bad member: {bad}"
                        rec["zip_members"] = z.namelist()
                        target = OUT / f"{name}_extracted"
                        target.mkdir(exist_ok=True)
                        for member in z.infolist():
                            dest = (target / member.filename).resolve()
                            if not str(dest).startswith(str(target.resolve()) + os.sep):
                                continue
                            if member.is_dir():
                                dest.mkdir(parents=True, exist_ok=True)
                            else:
                                dest.parent.mkdir(parents=True, exist_ok=True)
                                with z.open(member) as src, dest.open("wb") as dst:
                                    for chunk in iter(lambda: src.read(1024 * 1024), b""):
                                        dst.write(chunk)
                        inventory = []
                        for cp in target.rglob("*"):
                            if not cp.is_file() or cp.suffix.lower() not in (".csv", ".txt"):
                                continue
                            item = {"file": str(cp), "bytes": cp.stat().st_size, "sha256": sha256(cp)}
                            try:
                                with cp.open("r", encoding="utf-8-sig", errors="replace", newline="") as f:
                                    sample = f.read(8192); f.seek(0)
                                    try: dialect = csv.Sniffer().sniff(sample, delimiters=";,\t|")
                                    except Exception: dialect = csv.excel
                                    reader = csv.DictReader(f, dialect=dialect)
                                    item["columns"] = reader.fieldnames
                                    item["row_count"] = sum(1 for _ in reader)
                            except Exception as e:
                                item["csv_error"] = str(e)
                            inventory.append(item)
                        inv_path = OUT / f"{name}_csv_inventory.json"
                        inv_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding="utf-8")
                        rec["csv_inventory_file"] = str(inv_path)
                        rec["csv_file_count"] = len(inventory)
                except Exception as e:
                    rec["zip_error"] = f"{type(e).__name__}: {e}"
    except Exception as e:
        rec.update(result="failed", error=f"{type(e).__name__}: {e}")
    return rec

for name, (url, kind) in SOURCES.items():
    record = fetch(name, url, kind)
    manifest["sources"].append(record)

# Use IDs returned by Gamma to fetch top-of-book snapshots for relevant Brazilian election markets.
market_record = next((x for x in manifest["sources"] if x["name"] == "polymarket_markets"), {})
payload = market_record.get("parsed")
if isinstance(payload, dict):
    markets = payload.get("markets", []) if isinstance(payload.get("markets"), list) else [payload]
elif isinstance(payload, list):
    markets = payload
else:
    markets = []
relevant = []
books = []
for market in markets:
    if not isinstance(market, dict):
        continue
    blob = " ".join(str(market.get(k, "")) for k in ("question", "title", "slug", "description", "groupItemTitle"))
    if not re.search(r"brazil|brasil|bolsonaro|lula|presidential election|elei[cç][aã]o", blob, re.I):
        continue
    relevant.append(market)
    token_ids = market.get("clobTokenIds") or market.get("clob_token_ids") or []
    if isinstance(token_ids, str):
        try: token_ids = json.loads(token_ids)
        except Exception: token_ids = []
    if not isinstance(token_ids, list):
        token_ids = []
    for token_id in token_ids[:4]:
        url = "https://clob.polymarket.com/book?token_id=" + requests.utils.quote(str(token_id), safe="")
        rec = fetch("clob_book_" + re.sub(r"[^a-zA-Z0-9_-]", "", str(token_id))[:24], url, "json")
        manifest["sources"].append(rec)
        book = rec.get("parsed")
        if isinstance(book, dict):
            bids = sorted(book.get("bids", []), key=lambda x: float(x.get("price", 0)), reverse=True)
            asks = sorted(book.get("asks", []), key=lambda x: float(x.get("price", 0)))
            books.append({
                "market": market.get("question") or market.get("title"),
                "slug": market.get("slug"), "token_id": str(token_id),
                "observed_at": datetime.now(TZ).isoformat(),
                "best_bids": bids[:5], "best_asks": asks[:5],
                "bid_levels": len(bids), "ask_levels": len(asks), "source_url": url,
            })
(OUT / "polymarket_relevant_markets.json").write_text(json.dumps(relevant, ensure_ascii=False, indent=2), encoding="utf-8")
(OUT / "polymarket_orderbooks.json").write_text(json.dumps(books, ensure_ascii=False, indent=2), encoding="utf-8")
manifest["relevant_market_count"] = len(relevant)
manifest["orderbook_snapshots"] = len(books)
manifest["finished_at_local"] = datetime.now(TZ).isoformat()
manifest["finished_at_utc"] = datetime.now(timezone.utc).isoformat()
(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
print(json.dumps({
    "output_directory": str(OUT),
    "manifest": str(OUT / "manifest.json"),
    "results": [{"name": x["name"], "result": x.get("result"), "http_status": x.get("http_status"), "error": x.get("error")} for x in manifest["sources"]]
}, ensure_ascii=False, indent=2))

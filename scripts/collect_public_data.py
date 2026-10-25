#!/usr/bin/env python3
"""Auditable public-data collector for Pulso Cívico.

Downloads source responses into data-collection/<timestamp>/ and writes a
small manifest with metadata only. It never writes to the app database.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
import zipfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from zoneinfo import ZoneInfo

import requests

TZ = ZoneInfo("America/Bahia")
BASE = Path("data-collection")
TIMEOUT = (15, 90)
MAX_ZIP_MEMBERS = 20_000
MAX_UNCOMPRESSED_BYTES = 2 * 1024 * 1024 * 1024
MAX_MARKET_PAGES = 5
PAGE_SIZE = 100
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "PulsoCivicoObservatory/0.2 (+public-data research)",
    "Accept": "application/json, text/csv, text/html, */*",
})
OUT = BASE / datetime.now(TZ).strftime("%Y%m%d_%H%M%S")


def now_local() -> str:
    return datetime.now(TZ).isoformat()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def safe_extract_zip(archive: Path, destination: Path) -> list[Path]:
    """Extract ZIP members only if names and declared sizes are within limits."""
    destination.mkdir(parents=True, exist_ok=True)
    root = destination.resolve()
    extracted: list[Path] = []
    with zipfile.ZipFile(archive) as zf:
        bad_member = zf.testzip()
        if bad_member is not None:
            raise ValueError(f"ZIP integrity check failed at member: {bad_member}")
        infos = zf.infolist()
        if len(infos) > MAX_ZIP_MEMBERS:
            raise ValueError(f"ZIP has too many members: {len(infos)}")
        total = sum(item.file_size for item in infos)
        if total > MAX_UNCOMPRESSED_BYTES:
            raise ValueError(f"ZIP exceeds uncompressed-size limit: {total}")
        for info in infos:
            member = PurePosixPath(info.filename)
            if member.is_absolute() or ".." in member.parts:
                raise ValueError(f"Unsafe ZIP member path: {info.filename}")
            target = (destination / Path(*member.parts)).resolve()
            if target != root and root not in target.parents:
                raise ValueError(f"ZIP member escapes destination: {info.filename}")
            if info.is_dir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as source, target.open("wb") as output:
                shutil.copyfileobj(source, output, length=1024 * 1024)
            extracted.append(target)
    return extracted


def csv_inventory(paths: list[Path]) -> list[dict]:
    inventory = []
    for path in paths:
        if not path.is_file() or path.suffix.lower() not in {".csv", ".txt"}:
            continue
        item = {"file": str(path), "bytes": path.stat().st_size, "sha256": sha256(path)}
        try:
            with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as stream:
                sample = stream.read(8192)
                stream.seek(0)
                try:
                    dialect = csv.Sniffer().sniff(sample, delimiters=";,\t|")
                except csv.Error:
                    dialect = csv.excel
                reader = csv.DictReader(stream, dialect=dialect)
                item["columns"] = reader.fieldnames
                item["row_count"] = sum(1 for _ in reader)
        except (OSError, csv.Error) as exc:
            item["csv_error"] = f"{type(exc).__name__}: {exc}"
        inventory.append(item)
    return inventory


def fetch_to_file(name: str, url: str, suffix: str, manifest: dict) -> Path | None:
    record = {"name": name, "url": url, "attempted_at": now_local()}
    manifest["sources"].append(record)
    try:
        with SESSION.get(url, timeout=TIMEOUT, stream=True) as response:
            record.update(
                http_status=response.status_code,
                content_type=response.headers.get("content-type"),
                last_modified=response.headers.get("last-modified"),
                etag=response.headers.get("etag"),
            )
            response.raise_for_status()
            path = OUT / f"{name}{suffix}"
            with path.open("wb") as stream:
                for chunk in response.iter_content(256 * 1024):
                    if chunk:
                        stream.write(chunk)
            record.update(
                result="downloaded",
                file=str(path),
                bytes=path.stat().st_size,
                sha256=sha256(path),
            )
            return path
    except (requests.RequestException, OSError, ValueError) as exc:
        record.update(result="failed", error=f"{type(exc).__name__}: {exc}")
        return None


def is_relevant_market(market: dict) -> bool:
    text = " ".join(str(market.get(key, "")) for key in (
        "question", "title", "slug", "description", "groupItemTitle", "name"
    ))
    return bool(re.search(
        r"\b(brazil|brasil|presidential election|elei[cç][aã]o presidencial|"
        r"presidente do brasil|presidente brasileiro|lula|bolsonaro)\b",
        text, re.IGNORECASE
    ))


def get_market_list(payload: object) -> list[dict]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("markets", "data"):
            if isinstance(payload.get(key), list):
                return [item for item in payload[key] if isinstance(item, dict)]
    return []


def fetch_polymarket(manifest: dict) -> None:
    events: list[dict] = []
    for page in range(MAX_MARKET_PAGES):
        offset = page * PAGE_SIZE
        url = (
            "https://gamma-api.polymarket.com/events"
            f"?active=true&closed=false&limit={PAGE_SIZE}&offset={offset}"
        )
        path = fetch_to_file(f"polymarket_events_page_{page + 1}", url, ".json", manifest)
        if path is None:
            break
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            manifest["sources"][-1]["parse_error"] = f"{type(exc).__name__}: {exc}"
            break
        batch = get_market_list(payload)
        if not batch:
            break
        events.extend(batch)
        if len(batch) < PAGE_SIZE:
            break

    relevant_events = []
    relevant_markets = []
    seen_tokens: set[str] = set()
    books = []
    for event in events:
        nested = event.get("markets", [])
        if not isinstance(nested, list):
            nested = []
        matches = [market for market in nested if isinstance(market, dict) and (
            is_relevant_market(market) or is_relevant_market(event)
        )]
        if is_relevant_market(event) or matches:
            relevant_events.append({
                "id": event.get("id"), "slug": event.get("slug"),
                "title": event.get("title") or event.get("name"),
                "url": event.get("url"), "market_count": len(matches),
            })
            relevant_markets.extend(matches)

    for market in relevant_markets:
        token_ids = market.get("clobTokenIds") or market.get("clob_token_ids") or []
        if isinstance(token_ids, str):
            try:
                token_ids = json.loads(token_ids)
            except json.JSONDecodeError:
                token_ids = []
        if not isinstance(token_ids, list):
            continue
        for token_id in token_ids[:4]:
            token = str(token_id)
            if not token or token in seen_tokens:
                continue
            seen_tokens.add(token)
            url = "https://clob.polymarket.com/book?token_id=" + requests.utils.quote(token, safe="")
            path = fetch_to_file("clob_book_" + re.sub(r"[^A-Za-z0-9_-]", "", token)[:24], url, ".json", manifest)
            if path is None:
                continue
            try:
                book = json.loads(path.read_text(encoding="utf-8"))
                bids = sorted(book.get("bids", []), key=lambda row: float(row.get("price", 0)), reverse=True)
                asks = sorted(book.get("asks", []), key=lambda row: float(row.get("price", 0)))
                books.append({
                    "market": market.get("question") or market.get("title"),
                    "slug": market.get("slug"), "token_id": token,
                    "observed_at": now_local(), "best_bids": bids[:5], "best_asks": asks[:5],
                    "bid_levels": len(bids), "ask_levels": len(asks), "source_url": url,
                })
            except (json.JSONDecodeError, AttributeError, TypeError, ValueError) as exc:
                manifest["sources"][-1]["parse_error"] = f"{type(exc).__name__}: {exc}"

    write_json(OUT / "polymarket_relevant_events.json", relevant_events)
    write_json(OUT / "polymarket_relevant_markets.json", relevant_markets)
    write_json(OUT / "polymarket_orderbooks.json", books)
    manifest["polymarket"] = {
        "pages_fetched": min(len(events) // PAGE_SIZE + 1, MAX_MARKET_PAGES) if events else 0,
        "relevant_event_count": len(relevant_events),
        "relevant_market_count": len(relevant_markets),
        "unique_orderbook_snapshots": len(books),
        "discovery_note": "Active events are paginated with a fixed safety cap; review the cap if the API reports more pages.",
    }


def fetch_tse(manifest: dict) -> None:
    # Resolve current resources from the official TSE CKAN catalog; do not guess CDN ZIP paths.
    api_url = "https://dadosabertos.tse.jus.br/api/3/action/package_show?id=pesquisas-eleitorais-2026"
    catalog_path = fetch_to_file("tse_dataset_catalog", api_url, ".json", manifest)
    if catalog_path is None:
        manifest["tse"] = {"result": "catalog_unavailable"}
        return
    try:
        payload = json.loads(catalog_path.read_text(encoding="utf-8"))
        if not payload.get("success") or not isinstance(payload.get("result"), dict):
            raise ValueError("TSE CKAN package_show did not return success=true with a result object")
        resources = payload["result"].get("resources", [])
    except (json.JSONDecodeError, OSError, ValueError) as exc:
        manifest["sources"][-1]["parse_error"] = f"{type(exc).__name__}: {exc}"
        manifest["tse"] = {"result": "catalog_parse_failed", "error": str(exc)}
        return

    wanted = {
        "research": re.compile(r"pesquisas? eleitorais?(?!.*contratantes?)(?!.*pagantes?)", re.I),
        "contractors": re.compile(r"pesquisas? eleitorais?.*contratantes?|contratantes? de pesquisas?", re.I),
        "payers": re.compile(r"pesquisas? eleitorais?.*pagantes?|pagantes? de pesquisas?", re.I),
    }
    selected = {}
    for resource in resources:
        if not isinstance(resource, dict):
            continue
        label = " ".join(str(resource.get(key, "")) for key in ("name", "description", "format"))
        fmt = str(resource.get("format", "")).lower()
        if fmt not in {"csv", "zip", "txt"}:
            continue
        for key, pattern in wanted.items():
            if key not in selected and pattern.search(label) and resource.get("url"):
                selected[key] = resource
    results = {}
    for key, resource in selected.items():
        suffix = ".zip" if str(resource.get("format", "")).lower() == "zip" else (
            ".csv" if str(resource.get("format", "")).lower() == "csv" else ".txt"
        )
        path = fetch_to_file(f"tse_{key}", str(resource["url"]), suffix, manifest)
        results[key] = {"resource_id": resource.get("id"), "name": resource.get("name"), "format": resource.get("format")}
        if path is None:
            results[key]["result"] = "download_failed"
            continue
        if suffix == ".zip":
            try:
                extracted = safe_extract_zip(path, OUT / f"tse_{key}_extracted")
                results[key]["csv_inventory"] = csv_inventory(extracted)
                results[key]["zip_integrity"] = "ok"
            except (OSError, zipfile.BadZipFile, ValueError, RuntimeError) as exc:
                results[key]["zip_error"] = f"{type(exc).__name__}: {exc}"
        elif suffix in {".csv", ".txt"}:
            results[key]["csv_inventory"] = csv_inventory([path])
    manifest["tse"] = {
        "dataset_title": "Pesquisas Eleitorais - 2026",
        "catalog_url": api_url,
        "selected_resource_count": len(selected),
        "resources": results,
        "missing_resource_types": sorted(set(wanted) - set(selected)),
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=False)
    manifest = {
        "project": "Pulso Cívico",
        "collector_version": "0.2",
        "started_at_local": now_local(),
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "timezone": "America/Bahia",
        "sources": [],
        "caveats": [
            "Public market data are snapshots, not official polling or election results.",
            "TSE resources are resolved from the official CKAN dataset catalog at run time.",
            "No data are written to the app database or dashboard.",
            "A successful HTTP response is not proof of semantic correctness; inspect resource metadata and inventories.",
        ],
    }
    fetch_tse(manifest)
    fetch_polymarket(manifest)
    manifest["finished_at_local"] = now_local()
    manifest["finished_at_utc"] = datetime.now(timezone.utc).isoformat()
    manifest["source_summary"] = {
        "attempted": len(manifest["sources"]),
        "downloaded": sum(item.get("result") == "downloaded" for item in manifest["sources"]),
        "failed": sum(item.get("result") == "failed" for item in manifest["sources"]),
    }
    write_json(OUT / "manifest.json", manifest)
    print(json.dumps({
        "output_directory": str(OUT),
        "manifest": str(OUT / "manifest.json"),
        "source_summary": manifest["source_summary"],
        "tse": manifest.get("tse", {}),
        "polymarket": manifest.get("polymarket", {}),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

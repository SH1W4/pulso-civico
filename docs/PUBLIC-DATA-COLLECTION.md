# Public data collection

This collector fetches public Polymarket event/market data, CLOB order-book snapshots, and the TSE 2026 election-research datasets. It records source URLs, collection timestamps in `America/Bahia`, HTTP metadata, checksums, ZIP integrity and CSV inventories.

## Run locally

```bash
python -m pip install requests
python scripts/collect_public_data.py
```

## Run on GitHub Actions

Open **Actions → Collect public civic data → Run workflow**. The workflow is also scheduled hourly. Each run uploads the raw responses, TSE ZIP files, extracted CSVs, inventories, and manifest as an artifact retained for 30 days.

## Important limitations

- Collection is read-only: it does not update the application database or hosted dashboard.
- Raw source snapshots are stored as workflow artifacts, not committed to Git history.
- Prices and order books are volatile snapshots, not official polling or election results.
- Gamma market discovery can return no markets for a particular slug; the manifest records this rather than substituting guessed values.
- TSE datasets may change. Always retain the exact ZIP, checksum, generation metadata, and collection timestamp used for a report.
- This is a first-stage extractor; it does not yet reconstruct full transaction histories or attribute identities to wallet activity.

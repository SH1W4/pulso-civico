# Public data collection

The collector downloads public market snapshots from Polymarket and resolves 2026 election-research resources from the official TSE open-data catalog at run time.

## Run locally

```bash
python -m pip install requests
python scripts/collect_public_data.py
```

Run unit tests without making requests to external services:

```bash
python -m unittest discover -s tests -v
```

## GitHub Actions

- **Collect public civic data** runs manually or on its hourly schedule and uploads the output directory as a 30-day artifact.
- **Test public-data collector** runs unit tests for relevant pull requests and pushes to `main`.

## Output and integrity

Each run creates `data-collection/<timestamp>/`. The manifest records source URL, attempt time, HTTP status and headers, downloaded byte size, SHA-256, parse errors, and summary counts. Full response bodies are saved as separate files; they are not duplicated inside the manifest.

The TSE resources are selected from the official CKAN `package_show` response for `pesquisas-eleitorais-2026`, rather than relying on guessed CDN ZIP filenames. The manifest lists resource types not found in the catalog. CSV inventories include column names, row counts, byte sizes, and checksums.

ZIP extraction validates archive integrity, rejects traversal paths, and applies member-count and uncompressed-size limits. Treat downloaded files as untrusted input and inspect the manifest and inventory before analysis.

## Important limitations

- Collection is read-only and does not update the application database or hosted dashboard.
- Raw data are stored as workflow artifacts, not committed to Git history; artifacts are retained for 30 days.
- Polymarket prices and order books are volatile market snapshots, not official polls or election results.
- Market discovery scans a bounded number of active event pages. Review the page cap and the returned event coverage if the API indicates additional pages.
- HTTP success is not proof of semantic correctness. Validate the exact TSE resource title, generation metadata, and CSV schema before using a dataset in a public analysis.
- This is not a full trade-history collector and does not attribute wallet identities.

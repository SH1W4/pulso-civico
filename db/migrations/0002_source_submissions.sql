-- Community source catalog. Submissions remain private until explicitly approved.
CREATE TABLE IF NOT EXISTS source_submissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url TEXT NOT NULL CHECK (char_length(url) <= 2048),
  normalized_url TEXT NOT NULL UNIQUE CHECK (char_length(normalized_url) <= 2048),
  category TEXT NOT NULL CHECK (category IN (
    'Checagem de fatos',
    'Fonte oficial / dados públicos',
    'Jornalismo',
    'Ferramenta de verificação',
    'Pesquisa e universidade',
    'Outro recurso'
  )),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 1000),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW'
  )),
  moderation_note TEXT CHECK (moderation_note IS NULL OR char_length(moderation_note) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS source_submissions_status_updated_idx
  ON source_submissions (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS source_moderation_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id BIGINT NOT NULL REFERENCES source_submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('APPROVED', 'REJECTED', 'NEEDS_REVIEW')),
  moderation_note TEXT CHECK (moderation_note IS NULL OR char_length(moderation_note) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS source_moderation_events_source_created_idx
  ON source_moderation_events (source_id, created_at DESC);

-- No IP address, user-agent, name, email, or other direct identifier is stored.
-- Set an operational retention period before enabling public submissions in production.

-- Pulso Cívico: armazenamento mínimo para consultas comunitárias.
-- Execute no PostgreSQL do ambiente antes de ativar a coleta.
CREATE TABLE IF NOT EXISTS community_poll_votes (
  id UUID PRIMARY KEY,
  poll_id TEXT NOT NULL CHECK (poll_id IN ('prioridades', 'transparencia')),
  option_id TEXT NOT NULL,
  voter_hash CHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_poll_one_vote_per_browser UNIQUE (poll_id, voter_hash),
  CONSTRAINT community_poll_option_matches CHECK (
    (poll_id = 'prioridades' AND option_id IN ('evolucao', 'institutos', 'territorio', 'apuracao'))
    OR
    (poll_id = 'transparencia' AND option_id IN ('metodologia', 'fonte', 'margem', 'historico'))
  )
);

CREATE INDEX IF NOT EXISTS community_poll_votes_poll_created_idx
  ON community_poll_votes (poll_id, created_at DESC);

-- Do not expose this table directly to browser clients. All reads/writes go through the server API.

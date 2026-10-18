-- Non-political product-priority feedback only.
-- Do not use this table for candidate preference or political-opinion polling.
CREATE TABLE IF NOT EXISTS community_feedback_responses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_key TEXT NOT NULL CHECK (
    survey_key IN ('feature-priorities', 'transparency-priorities')
  ),
  option_key TEXT NOT NULL,
  participant_hash CHAR(64) NOT NULL,
  privacy_notice_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_feedback_participant_once UNIQUE (survey_key, participant_hash),
  CONSTRAINT community_feedback_option_key_valid CHECK (
    (survey_key = 'feature-priorities' AND option_key IN (
      'poll-trends', 'pollster-comparison', 'regional-context', 'official-results'
    ))
    OR
    (survey_key = 'transparency-priorities' AND option_key IN (
      'methodology', 'verifiable-source', 'margin-explanation', 'update-history'
    ))
  )
);

CREATE INDEX IF NOT EXISTS community_feedback_results_idx
  ON community_feedback_responses (survey_key, option_key);

-- Retention must be configured before enabling public collection.
-- Do not store IP addresses, user-agent strings, names, emails, CPF, or voter IDs here.

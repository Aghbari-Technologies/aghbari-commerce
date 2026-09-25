-- Make import provenance explicit while preserving the existing job id as correlation identity.
ALTER TABLE public.import_jobs
  ADD COLUMN IF NOT EXISTS source_version text NOT NULL DEFAULT 'xlsx-v1';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.import_jobs'::regclass
      AND conname = 'import_jobs_source_version_chk'
  ) THEN
    ALTER TABLE public.import_jobs
      ADD CONSTRAINT import_jobs_source_version_chk
      CHECK (source_version = 'xlsx-v1');
  END IF;
END
$$;

COMMENT ON COLUMN public.import_jobs.source_version IS
  'Version of the canonical spreadsheet import contract used to validate and stage the source.';
COMMENT ON COLUMN public.import_jobs.id IS
  'Server-generated import job/correlation identifier for the complete staging and commit lifecycle.';

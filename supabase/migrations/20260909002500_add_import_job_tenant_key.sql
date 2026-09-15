-- Composite tenant foreign keys require a matching unique key on import_jobs.
-- Keep the import job identity tenant-bound without changing the legacy fingerprint contract.
ALTER TABLE public.import_jobs
  ADD CONSTRAINT import_jobs_id_organization_key UNIQUE (id, organization_id);

-- Finance branch/cash-account integrity.
-- Future expense writes must use a cash account belonging to the same branch
-- and organization. Existing rows are not blocked by this rollout.

ALTER TABLE public.cash_accounts
  ADD CONSTRAINT cash_accounts_id_branch_organization_key UNIQUE (id,branch_id,organization_id);

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_cash_account_branch_org_fkey
  FOREIGN KEY (cash_account_id,branch_id,organization_id)
  REFERENCES public.cash_accounts(id,branch_id,organization_id)
  ON DELETE RESTRICT
  NOT VALID;

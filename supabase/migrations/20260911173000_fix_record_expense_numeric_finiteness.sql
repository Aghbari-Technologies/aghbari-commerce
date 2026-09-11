-- Correct numeric finiteness validation for record_expense on PostgreSQL numeric.
-- No RLS/policy behavior is changed.
CREATE OR REPLACE FUNCTION public.record_expense(p_branch_id uuid,p_cash_account_id uuid,p_category text,p_amount numeric,p_currency text DEFAULT 'YER',p_description text DEFAULT NULL,p_expense_date date DEFAULT current_date)
RETURNS public.expenses
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); a public.cash_accounts%rowtype; e public.expenses%rowtype; bal numeric;
BEGIN
  IF o IS NULL OR r NOT IN ('owner','admin') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
  IF p_branch_id IS NULL OR NOT EXISTS(SELECT 1 FROM public.branches WHERE id=p_branch_id AND organization_id=o AND is_active) THEN RAISE EXCEPTION USING errcode='42501',message='branch not available'; END IF;
  SELECT * INTO a FROM public.cash_accounts WHERE id=p_cash_account_id AND organization_id=o AND is_active FOR UPDATE;
  IF NOT FOUND OR p_amount IS NULL OR p_amount::text IN ('Infinity','-Infinity','NaN') OR p_amount<=0 OR p_amount>9007199254740991 OR p_currency IS NULL OR trim(p_currency) !~ '^[A-Za-z]{3}$' OR a.currency<>upper(trim(p_currency)) THEN RAISE EXCEPTION USING errcode='22023'; END IF;
  IF nullif(trim(p_category),'') IS NULL OR length(trim(p_category))>200 THEN RAISE EXCEPTION USING errcode='22023'; END IF;
  IF p_description IS NOT NULL AND length(p_description)>2000 THEN RAISE EXCEPTION USING errcode='22023'; END IF;
  SELECT a.opening_balance+coalesce(sum(CASE WHEN direction='in' THEN amount ELSE -amount END),0) INTO bal FROM public.cash_transactions WHERE organization_id=o AND cash_account_id=a.id;
  IF bal<p_amount THEN RAISE EXCEPTION USING errcode='22003'; END IF;
  INSERT INTO public.expenses(organization_id,branch_id,cash_account_id,category,amount,currency,description,expense_date,actor_id) VALUES(o,p_branch_id,p_cash_account_id,trim(p_category),p_amount,upper(trim(p_currency)),nullif(trim(p_description),''),coalesce(p_expense_date,current_date),auth.uid()) RETURNING * INTO e;
  INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,actor_id) VALUES(o,p_cash_account_id,'out',p_amount,'expense',e.id,auth.uid());
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) VALUES(o,auth.uid(),'expense.create','expense',e.id,'success',jsonb_build_object('amount',p_amount,'category',e.category));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload) VALUES(o,'expense',e.id,'expense.posted',jsonb_build_object('expense_id',e.id,'amount',p_amount));
  RETURN e;
END;
$$;

REVOKE ALL ON FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date) TO authenticated;

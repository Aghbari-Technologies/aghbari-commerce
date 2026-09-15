-- Performance-only RLS hardening: keep authorization semantics while ensuring
-- auth/context lookups are evaluated once per statement and avoid overlapping SELECT policies.

DROP POLICY IF EXISTS customer_price_tiers_select_own ON public.customer_price_tiers;
CREATE POLICY customer_price_tiers_select_own ON public.customer_price_tiers
  FOR SELECT TO authenticated
  USING (customer_id = (SELECT public.current_customer_id()));

DROP POLICY IF EXISTS customer_credit_accounts_select_own ON public.customer_credit_accounts;
CREATE POLICY customer_credit_accounts_select_own ON public.customer_credit_accounts
  FOR SELECT TO authenticated
  USING (customer_id = (SELECT public.current_customer_id()));

DROP POLICY IF EXISTS customer_ledger_entries_select_own ON public.customer_ledger_entries;
CREATE POLICY customer_ledger_entries_select_own ON public.customer_ledger_entries
  FOR SELECT TO authenticated
  USING (customer_id = (SELECT public.current_customer_id()));

DROP POLICY IF EXISTS client_ui_settings_select_org ON public.client_ui_settings;
DROP POLICY IF EXISTS client_ui_settings_write_staff ON public.client_ui_settings;
CREATE POLICY client_ui_settings_select_org ON public.client_ui_settings
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT public.current_organization_id()));
CREATE POLICY client_ui_settings_insert_staff ON public.client_ui_settings
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = (SELECT public.current_organization_id()) AND (SELECT public.is_staff()));
CREATE POLICY client_ui_settings_update_staff ON public.client_ui_settings
  FOR UPDATE TO authenticated
  USING (organization_id = (SELECT public.current_organization_id()) AND (SELECT public.is_staff()))
  WITH CHECK (organization_id = (SELECT public.current_organization_id()) AND (SELECT public.is_staff()));
CREATE POLICY client_ui_settings_delete_staff ON public.client_ui_settings
  FOR DELETE TO authenticated
  USING (organization_id = (SELECT public.current_organization_id()) AND (SELECT public.is_staff()));

DROP POLICY IF EXISTS order_template_lines_select_own ON public.order_template_lines;
CREATE POLICY order_template_lines_select_own ON public.order_template_lines
  FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT public.current_organization_id())
    AND template_id IN (
      SELECT ot.id FROM public.order_templates ot
      WHERE ot.organization_id = (SELECT public.current_organization_id())
        AND ot.customer_id = (SELECT public.current_customer_id())
    )
  );

DROP POLICY IF EXISTS order_template_apply_ops_select_own ON public.order_template_apply_operations;
CREATE POLICY order_template_apply_ops_select_own ON public.order_template_apply_operations
  FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT public.current_organization_id())
    AND customer_id = (SELECT public.current_customer_id())
  );

DROP POLICY IF EXISTS order_templates_select_own ON public.order_templates;
CREATE POLICY order_templates_select_own ON public.order_templates
  FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT public.current_organization_id())
    AND customer_id = (SELECT public.current_customer_id())
  );

DROP POLICY IF EXISTS order_templates_insert_own ON public.order_templates;
CREATE POLICY order_templates_insert_own ON public.order_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = (SELECT public.current_organization_id())
    AND customer_id = (SELECT public.current_customer_id())
  );

DROP POLICY IF EXISTS order_templates_update_own ON public.order_templates;
CREATE POLICY order_templates_update_own ON public.order_templates
  FOR UPDATE TO authenticated
  USING (
    organization_id = (SELECT public.current_organization_id())
    AND customer_id = (SELECT public.current_customer_id())
  )
  WITH CHECK (
    organization_id = (SELECT public.current_organization_id())
    AND customer_id = (SELECT public.current_customer_id())
  );

DROP POLICY IF EXISTS order_templates_delete_own ON public.order_templates;
CREATE POLICY order_templates_delete_own ON public.order_templates
  FOR DELETE TO authenticated
  USING (
    organization_id = (SELECT public.current_organization_id())
    AND customer_id = (SELECT public.current_customer_id())
  );

DROP POLICY IF EXISTS payments_customer_read ON public.payments;
DROP POLICY IF EXISTS payments_staff_read ON public.payments;
CREATE POLICY payments_read ON public.payments
  FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT public.current_organization_id())
    AND (
      EXISTS (
        SELECT 1 FROM public.operational_invoices i
        WHERE i.id = payments.invoice_id
          AND i.organization_id = payments.organization_id
          AND i.customer_id = (SELECT public.current_customer_id())
      )
      OR (SELECT public.is_staff())
    )
  );

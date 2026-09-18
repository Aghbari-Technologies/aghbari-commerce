-- Do not treat the initial NULL -> pending history row as a customer status transition.
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.from_status IS DISTINCT FROM NULL
     AND NEW.to_status IS DISTINCT FROM NEW.from_status THEN
    INSERT INTO public.notifications(
      organization_id, customer_id, kind, title, body, entity_type, entity_id
    )
    SELECT
      NEW.organization_id,
      o.customer_id,
      'order',
      'تحديث حالة الطلب #' || o.order_number::text,
      CASE NEW.to_status::text
        WHEN 'confirmed' THEN 'تم تأكيد طلبك وسيبدأ التجهيز.'
        WHEN 'preparing' THEN 'بدأ تجهيز طلبك.'
        WHEN 'ready' THEN 'طلبك جاهز للتسليم أو الشحن.'
        WHEN 'completed' THEN 'تم إكمال طلبك.'
        WHEN 'cancelled' THEN 'تم إلغاء الطلب.'
        ELSE 'تم تحديث طلبك إلى: ' || NEW.to_status::text || '.'
      END,
      'order',
      o.id
    FROM public.orders o
    WHERE o.id = NEW.order_id
      AND o.organization_id = NEW.organization_id;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.notify_order_status_change() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.notify_order_status_change() IS 'Customer notifications for actual order status transitions only; initial pending history is not a transition.';

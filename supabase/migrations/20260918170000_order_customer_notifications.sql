-- Customer-visible order notifications are generated from the authoritative orders table.
-- The trigger is server-side so client code cannot forge or suppress order status messages.
CREATE OR REPLACE FUNCTION public.notify_order_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_title text;
  v_body text;
  v_kind text;
BEGIN
  IF NEW.customer_id IS NULL OR NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_kind := 'order_created';
    v_title := 'تم استلام طلبك';
    v_body := format('تم استلام الطلب #%s بقيمة %s %s وهو بانتظار المعالجة.', NEW.order_number, NEW.total, NEW.currency);
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    v_kind := 'order_status_changed';
    v_title := 'تحديث حالة الطلب #' || NEW.order_number;
    v_body := CASE NEW.status::text
      WHEN 'confirmed' THEN 'تم تأكيد طلبك وسيبدأ التجهيز.'
      WHEN 'preparing' THEN 'بدأ تجهيز طلبك.'
      WHEN 'ready' THEN 'طلبك جاهز للتسليم أو الشحن.'
      WHEN 'completed' THEN 'تم إكمال طلبك.'
      WHEN 'cancelled' THEN 'تم إلغاء الطلب.'
      ELSE 'تم تحديث حالة طلبك إلى: ' || NEW.status::text
    END;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications(
    organization_id, customer_id, kind, title, body, entity_type, entity_id
  )
  VALUES(
    NEW.organization_id, NEW.customer_id, v_kind, v_title, v_body, 'order', NEW.id
  );

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS orders_customer_notifications ON public.orders;
CREATE TRIGGER orders_customer_notifications
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_order_customer();

REVOKE EXECUTE ON FUNCTION public.notify_order_customer() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.notify_order_customer() IS 'Server-side customer notifications for authoritative order creation and status transitions.';

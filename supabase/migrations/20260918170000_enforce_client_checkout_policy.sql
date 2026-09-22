  VALUES(v_org,'order',v_order.id,'order.created',pg_catalog.jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'payment_method',v_requested_payment));

  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'order.create','order',v_order.id,'success',
         pg_catalog.jsonb_build_object('order_number',v_order.order_number,'cart_converted',v_cart_id IS NOT NULL,'payment_method',v_requested_payment));

  RETURN QUERY SELECT v_order.id,v_order.order_number,v_order.status,v_order.total;
END;
$function$;

revoke all on function public.create_order(text,uuid,jsonb,text) from public, anon;
grant execute on function public.create_order(text,uuid,jsonb,text) to authenticated;
commit;
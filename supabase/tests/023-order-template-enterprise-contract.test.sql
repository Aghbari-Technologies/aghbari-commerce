begin;
select plan(10);

select has_table('public','order_templates','canonical order_templates exists');
select has_table('public','order_template_lines','normalized order_template_lines exists');
select has_table('public','order_template_apply_operations','idempotency ledger exists');
select has_column('public','order_templates','organization_id','templates are tenant-bound');
select has_column('public','order_template_lines','product_id','template lines bind product ids');
select has_column('public','order_template_lines','quantity','template lines persist quantity');
select col_is_pk('public','order_template_lines','id','template line primary key exists');
select fk_ok('public','order_template_lines','template_id','public','order_templates','id','template lines reference canonical templates');
select function_privs_are('public','apply_order_template','uuid, uuid, text','public',false,'anonymous cannot execute atomic template apply');
select function_privs_are('public','save_order_template','text, jsonb, text','public',false,'anonymous cannot execute template save');

select * from finish();
rollback;

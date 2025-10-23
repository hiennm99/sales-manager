create table public.orders (
                               id serial not null,
                              shop_id integer not null,
                              order_id text not null,
                               order_date date not null,
                               scheduled_ship_date date null,
                               actual_ship_date date null,
                               customer_name text not null,
                              customer_address text not null,
                              customer_phone text null,
                              customer_email text null,
                              customer_notes text null,
                              item_total_usd numeric(10, 2) not null default 0,
                              discount_rate numeric(10, 2) not null default 0,
                              buyer_paid_usd numeric(10, 2) not null default 0,
                              order_earnings_usd numeric(10, 2) not null default 0,
                              exchange_rate numeric(10, 2) not null default 25000,
                              shipping_exchange_rate numeric(10, 2) not null default 25000,
                              refund_fee_exchange_rate numeric(10, 2) not null default 25000,
                              other_fee_exchange_rate numeric(10, 2) not null default 25000,
                              other_bonus_exchange_rate numeric(10, 2) not null default 25000,
                              item_total_vnd numeric(15, 2) not null default 0,
                              buyer_paid_vnd numeric(15, 2) not null default 0,
                              order_earnings_vnd numeric(15, 2) not null default 0,
                              carrier_unit text null,
                              carrier_notes text null,
                              internal_tracking_number text null,
                              tracking_number text null,
                              shipping_fee_usd numeric(10, 2) not null default 0,
                              shipping_fee_vnd numeric(15, 2) not null default 0,
                              refund_fee_usd numeric(10, 2) not null default 0,
                              refund_fee_vnd numeric(15, 2) not null default 0,
                              refund_fee_notes text null,
                              other_fee_usd numeric(10, 2) not null default 0,
                              other_fee_vnd numeric(15, 2) not null default 0,
                              other_fee_notes text null,
                              other_bonus_usd numeric(10, 2) not null default 0,
                              other_bonus_vnd numeric(15, 2) not null default 0,
                              other_bonus_notes text null,
                              profit_usd numeric(10, 2) not null default 0,
                              profit_vnd numeric(15, 2) not null default 0,
                              artist_commission_rate numeric(5, 2) null default 0,
                               general_status_id integer null default 1,
                               customer_status_id integer null default 1,
                               factory_status_id integer null default 1,
                               delivery_status_id integer null default 1,
                               created_at timestamp with time zone not null default now(),
                               updated_at timestamp with time zone not null default now(),
                               artist_employee_id bigint null,
                               seller_employee_id bigint null,
                               constraint orders_pkey primary key (id),
                               constraint orders_order_id_key unique (order_id),
                               constraint orders_seller_employee_id_fkey foreign KEY (seller_employee_id) references employees (id) on delete set null,
                              constraint orders_shop_id_fkey foreign KEY (shop_id) references shops (id) on update CASCADE on delete CASCADE,
                              constraint orders_artist_employee_id_fkey foreign KEY (artist_employee_id) references employees (id) on delete set null,
                              constraint orders_exchange_rate_positive check ((exchange_rate > (0)::numeric)),
                               constraint orders_exchange_rates_non_negative check (
                                  (
                                      (shipping_exchange_rate >= (0)::numeric)
                                          and (refund_fee_exchange_rate >= (0)::numeric)
                                          and (other_fee_exchange_rate >= (0)::numeric)
                                          and (other_bonus_exchange_rate >= (0)::numeric)
                                      )
                                  ),
                               constraint employee_commission_rate_check check (
                                  (
                                      (artist_commission_rate >= (0)::numeric)
                                          and (artist_commission_rate <= (100)::numeric)
                                      )
                                  ),
                              constraint orders_usd_amounts_non_negative check (
                                   (
                                       (item_total_usd >= (0)::numeric)
                                           and (buyer_paid_usd >= (0)::numeric)
                                           and (order_earnings_usd >= (0)::numeric)
                                           and (shipping_fee_usd >= (0)::numeric)
                                           and (refund_fee_usd >= (0)::numeric)
                                           and (other_fee_usd >= (0)::numeric)
                                           and (other_bonus_usd >= (0)::numeric)
                                       )
                                   ),
                               constraint orders_buyer_paid_reasonable check (
                                   (
                                       buyer_paid_usd >= (
                                           (
                                               (item_total_usd * ((100)::numeric - discount_rate)) / (100)::numeric
                                       ) * 0.5
                                   )
)
    ),
    constraint orders_discount_rate_check check (
      (
        (discount_rate >= (0)::numeric)
        and (discount_rate <= (100)::numeric)
      )
    ),
    constraint orders_email_format_check check (
      (
        (customer_email is null)
        or (
          customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
        )
      )
    )
  ) TABLESPACE pg_default;

create index IF not exists idx_orders_shop_id on public.orders using btree (shop_id) TABLESPACE pg_default;

create index IF not exists idx_orders_employee_id on public.orders using btree (artist_employee_id) TABLESPACE pg_default
    where
    (artist_employee_id is not null);

create index IF not exists idx_orders_order_date on public.orders using btree (order_date desc) TABLESPACE pg_default;

create index IF not exists idx_orders_created_at on public.orders using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_orders_order_id on public.orders using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_orders_shop_status on public.orders using btree (shop_id, general_status_id) TABLESPACE pg_default;

create index IF not exists idx_orders_employee_status on public.orders using btree (artist_employee_id, general_status_id) TABLESPACE pg_default
    where
    (artist_employee_id is not null);

create index IF not exists idx_orders_date_status on public.orders using btree (order_date desc, general_status_id) TABLESPACE pg_default;

create index IF not exists idx_orders_general_status on public.orders using btree (general_status_id) TABLESPACE pg_default
    where
    (general_status_id is not null);

create index IF not exists idx_orders_customer_status on public.orders using btree (customer_status_id) TABLESPACE pg_default
    where
    (customer_status_id is not null);

create index IF not exists idx_orders_factory_status on public.orders using btree (factory_status_id) TABLESPACE pg_default
    where
    (factory_status_id is not null);

create index IF not exists idx_orders_delivery_status on public.orders using btree (delivery_status_id) TABLESPACE pg_default
    where
    (delivery_status_id is not null);

create index IF not exists idx_orders_customer_name on public.orders using gin (to_tsvector('english'::regconfig, customer_name)) TABLESPACE pg_default;

create index IF not exists idx_orders_tracking_number on public.orders using btree (tracking_number) TABLESPACE pg_default
    where
    (tracking_number is not null);

create index IF not exists idx_orders_artist_employee_id on public.orders using btree (artist_employee_id) TABLESPACE pg_default;

create index IF not exists idx_orders_seller_employee_id on public.orders using btree (seller_employee_id) TABLESPACE pg_default;

create trigger orders_financials_trigger BEFORE INSERT
    or
update on orders for EACH row
    execute FUNCTION calculate_order_financials ();

create trigger orders_updated_at BEFORE
    update on orders for EACH row
    execute FUNCTION handle_updated_at ();

create trigger trigger_sync_commission
    after INSERT
        or
update OF actual_ship_date,
    artist_employee_id,
    seller_employee_id,
    artist_commission_rate,
    profit_vnd,
    order_earnings_vnd on orders for EACH row
    execute FUNCTION sync_employee_commission ();
INSERT INTO public.employees (
    name,
    email,
    code,
    avatar,
    role,
    is_active,
    is_admin,
    base_salary,
    sales_commission_rate,
    user_id,
    created_at,
    updated_at
) VALUES (
             'Nguyễn Minh Hiền',
             'hiennm11599@gmail.com',
             'NMH',  -- 3 ký tự code
             '',
             'Seller',
             true,
             true,
             1600000,
             3.0,
          '87706f14-7c07-4242-a043-11f28d1928a7',
             NOW(),
             NOW()
         );
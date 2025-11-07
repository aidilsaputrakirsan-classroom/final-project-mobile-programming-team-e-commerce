-- Create products table
create table public.products (
  id uuid not null default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  description text,
  price integer not null,
  stock integer not null default 0,
  image text,
  category text not null,
  variants jsonb not null default '[]'::jsonb,
  constraint products_pkey primary key (id)
);

-- Create RLS policies
alter table public.products enable row level security;

-- Allow read access for all authenticated users
create policy "Allow read access for all authenticated users"
  on public.products
  for select
  to authenticated
  using (true);

-- Allow write access only for admin users
create policy "Allow write access only for admin users"
  on public.products
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

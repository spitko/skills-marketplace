-- Create purchases table to track skill purchases
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  creem_product_id text not null,
  creem_checkout_id text,
  creem_transaction_id text,
  status text not null default 'pending', -- pending, completed, failed, refunded
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, skill_id) -- Prevent duplicate purchases
);

-- Create index for better query performance
create index if not exists purchases_user_id_idx on public.purchases(user_id);
create index if not exists purchases_skill_id_idx on public.purchases(skill_id);
create index if not exists purchases_status_idx on public.purchases(status);
create index if not exists purchases_creem_transaction_id_idx on public.purchases(creem_transaction_id);

-- Enable Row Level Security
alter table public.purchases enable row level security;

-- Create policy to allow users to read their own purchases
create policy "Users can view their own purchases" on public.purchases
  for select
  using (auth.uid() = user_id);

-- Create policy to allow service role to insert/update purchases (for webhooks)
create policy "Service role can manage purchases" on public.purchases
  for all
  using (true)
  with check (true);

-- Add creem_product_id column to skills table to link skills to Creem products
alter table public.skills 
  add column if not exists creem_product_id text;

create index if not exists skills_creem_product_id_idx on public.skills(creem_product_id);

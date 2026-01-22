-- Allow guest purchases (user_id can be null)
alter table public.purchases 
  alter column user_id drop not null,
  drop constraint if exists purchases_user_id_skill_id_key; -- Remove unique constraint that requires user_id

-- Add email column for guest purchases
alter table public.purchases 
  add column if not exists customer_email text;

-- Create new unique constraint that allows guest purchases
-- For authenticated users: one purchase per user per skill
-- For guests: multiple purchases allowed (identified by email + checkout_id)
create unique index if not exists purchases_user_skill_unique on public.purchases(user_id, skill_id) 
  where user_id is not null;

-- Create index for email lookups
create index if not exists purchases_customer_email_idx on public.purchases(customer_email);

-- Update RLS policy to allow public inserts (for guest purchases)
drop policy if exists "Users can view their own purchases" on public.purchases;
create policy "Users can view their own purchases" on public.purchases
  for select
  using (
    auth.uid() = user_id 
    or customer_email = (select email from auth.users where id = auth.uid())
  );

-- Allow public inserts for guest purchases (webhook will handle updates)
create policy "Allow public inserts for purchases" on public.purchases
  for insert
  with check (true);

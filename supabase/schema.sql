create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('猫', '狗', '其他')),
  breed text,
  gender text,
  birthday date,
  weight numeric(6,2),
  personality text,
  original_photo_url text,
  ai_avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  style text not null,
  prompt text,
  source_image_url text,
  result_image_url text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  weight numeric(6,2),
  food text,
  water text,
  poop text,
  exercise text,
  note text,
  health_score integer not null default 100 check (health_score >= 0 and health_score <= 100),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  expires_at timestamptz
);

create index if not exists pets_user_id_idx on public.pets(user_id);
create index if not exists image_generations_user_id_idx on public.image_generations(user_id);
create index if not exists chat_messages_pet_id_created_at_idx on public.chat_messages(pet_id, created_at);
create index if not exists health_records_pet_id_created_at_idx on public.health_records(pet_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.image_generations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.health_records enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles own read" on public.profiles for select using (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id);

create policy "pets own all" on public.pets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "image generations own all" on public.image_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chat messages own all" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "health records own all" on public.health_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions own read" on public.subscriptions for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-media', 'pet-media', true, 52428800, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 52428800, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

create policy "pet media public read" on storage.objects for select using (bucket_id = 'pet-media');
create policy "pet media auth upload" on storage.objects for insert with check (
  bucket_id = 'pet-media'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "pet media own update" on storage.objects for update using (
  bucket_id = 'pet-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

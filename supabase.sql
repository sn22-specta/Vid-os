-- FormaCAD Studio: exécuter ce script dans Supabase > SQL Editor.
create table if not exists public.formacad_projects (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Projet sans titre',
  project_data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.formacad_projects enable row level security;

drop policy if exists "Users can read own FormaCAD projects" on public.formacad_projects;
create policy "Users can read own FormaCAD projects"
  on public.formacad_projects for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own FormaCAD projects" on public.formacad_projects;
create policy "Users can insert own FormaCAD projects"
  on public.formacad_projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own FormaCAD projects" on public.formacad_projects;
create policy "Users can update own FormaCAD projects"
  on public.formacad_projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own FormaCAD projects" on public.formacad_projects;
create policy "Users can delete own FormaCAD projects"
  on public.formacad_projects for delete
  using (auth.uid() = user_id);

create index if not exists formacad_projects_user_updated_idx
  on public.formacad_projects (user_id, updated_at desc);

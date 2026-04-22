-- Phase 4A.3: Premium Vault cloud sync

CREATE TABLE IF NOT EXISTS public.premium_vault_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_premium_vault_files_user
  ON public.premium_vault_files(user_id, created_at DESC);

ALTER TABLE public.premium_vault_files ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'premium_vault_files'
      AND policyname = 'Users read own premium vault metadata'
  ) THEN
    CREATE POLICY "Users read own premium vault metadata"
      ON public.premium_vault_files
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'premium_vault_files'
      AND policyname = 'Users write own premium vault metadata'
  ) THEN
    CREATE POLICY "Users write own premium vault metadata"
      ON public.premium_vault_files
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'premium_vault_files'
      AND policyname = 'Users update own premium vault metadata'
  ) THEN
    CREATE POLICY "Users update own premium vault metadata"
      ON public.premium_vault_files
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

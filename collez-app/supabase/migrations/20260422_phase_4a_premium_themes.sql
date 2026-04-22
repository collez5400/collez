-- Phase 4A.1: Premium themes and monetization config

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS premium_config JSONB NOT NULL DEFAULT jsonb_build_object(
  'active_theme', 'default',
  'unlocked_themes', jsonb_build_array('default')
);

COMMENT ON COLUMN public.users.premium_config IS
'Premium personalization config. Stores active theme and unlocked premium themes.';

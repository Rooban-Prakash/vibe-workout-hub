CREATE TABLE public.app_user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connector_id text NOT NULL,
  connection_key_ciphertext text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, connector_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_user_connections TO service_role;
ALTER TABLE public.app_user_connections ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_sheet_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  spreadsheet_id text,
  workouts_tab text NOT NULL DEFAULT 'Workouts',
  weight_tab text NOT NULL DEFAULT 'Weight',
  mood_tab text NOT NULL DEFAULT 'Mood',
  habits_tab text NOT NULL DEFAULT 'Habits',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sheet_settings TO authenticated;
GRANT ALL ON public.user_sheet_settings TO service_role;
ALTER TABLE public.user_sheet_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own sheet settings"
  ON public.user_sheet_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
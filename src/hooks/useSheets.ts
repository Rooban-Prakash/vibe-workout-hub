import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SheetSettings {
  spreadsheet_id: string | null;
  workouts_tab: string;
  weight_tab: string;
  mood_tab: string;
  habits_tab: string;
}

const invoke = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('sheets-api', { body });
  if (error) throw new Error(error.message);
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
};

export const useSheetStatus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['sheet-status', user?.id],
    enabled: !!user,
    queryFn: () => invoke<{ connected: boolean; settings: SheetSettings | null }>({ action: 'status' }),
  });
};

export interface SheetWorkout {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
}

export const useSheetWorkouts = () => {
  const { data: status } = useSheetStatus();
  const tab = status?.settings?.workouts_tab ?? 'Workouts';
  const ready = !!status?.connected && !!status?.settings?.spreadsheet_id;
  return useQuery({
    queryKey: ['sheet-workouts', tab, ready],
    enabled: ready,
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const res = await invoke<{ values?: string[][] }>({ action: 'read', range: `${tab}!A1:E200` });
      const rows = res.values ?? [];
      const body = rows.length && /exercise|workout/i.test(rows[0]?.[0] ?? '') ? rows.slice(1) : rows;
      return body
        .filter((r) => (r[0] ?? '').trim().length > 0)
        .map<SheetWorkout>((r) => ({
          name: (r[0] ?? '').trim(),
          muscleGroup: (r[1] ?? '').trim() || 'General',
          sets: Number(r[2]) || 3,
          reps: Number(r[3]) || 10,
          weight: Number(r[4]) || 0,
        }));
    },
  });
};

export const useAppendToSheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { tab: string; values: (string | number)[][] }) =>
      invoke({ action: 'append', range: `${vars.tab}!A1`, values: vars.values }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sheet-workouts'] }),
  });
};

export const useSaveSheetSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: Record<string, unknown>) => invoke({ action: 'save-settings', ...vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sheet-status'] }),
  });
};

export const useSheetConnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const popup = window.open('', 'lovable-oauth', 'width=600,height=720');
      if (!popup) throw new Error('Popup blocked. Allow popups and try again.');
      try {
        const { data, error } = await supabase.functions.invoke('app-user-oauth-start', {
          body: { origin: window.location.origin },
        });
        if (error) throw new Error(error.message);
        const completion = new Promise<void>((resolve, reject) => {
          let poll: number | undefined;
          const cleanup = () => {
            window.removeEventListener('message', onMessage);
            if (poll !== undefined) window.clearInterval(poll);
          };
          const onMessage = (event: MessageEvent) => {
            const type = event.data?.type;
            if (
              event.origin !== window.location.origin ||
              event.data?.connectorId !== 'google_sheets' ||
              (type !== 'appUserConnectorOAuthComplete' && type !== 'appUserConnectorOAuthFailed')
            ) return;
            cleanup();
            if (type === 'appUserConnectorOAuthComplete') return resolve();
            popup.close();
            reject(new Error(event.data?.reason ?? 'Google connection failed.'));
          };
          window.addEventListener('message', onMessage);
          poll = window.setInterval(() => {
            if (!popup.closed) return;
            cleanup();
            reject(new Error('Connection window closed before finishing.'));
          }, 500);
        });
        popup.location.href = (data as { authorizationUrl: string }).authorizationUrl;
        await completion;
      } catch (e) {
        popup.close();
        throw e;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sheet-status'] }),
  });
};

export const useSheetDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invoke({ action: 'disconnect' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sheet-status'] }),
  });
};

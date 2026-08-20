import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet as SheetIcon, RefreshCw, Link2, Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useSheetStatus,
  useSheetConnect,
  useSheetDisconnect,
  useSaveSheetSettings,
  useSheetWorkouts,
} from '@/hooks/useSheets';

export const SheetsPanel = () => {
  const { data: status, isLoading } = useSheetStatus();
  const connect = useSheetConnect();
  const disconnect = useSheetDisconnect();
  const saveSettings = useSaveSheetSettings();
  const workouts = useSheetWorkouts();
  const { toast } = useToast();

  const [spreadsheet, setSpreadsheet] = useState('');
  const [workoutsTab, setWorkoutsTab] = useState('Workouts');

  useEffect(() => {
    if (status?.settings) {
      setSpreadsheet(status.settings.spreadsheet_id ?? '');
      setWorkoutsTab(status.settings.workouts_tab ?? 'Workouts');
    }
  }, [status?.settings]);

  const handleConnect = () => {
    connect.mutate(undefined, {
      onSuccess: () => toast({ title: 'Google Sheets connected!' }),
      onError: (error) => toast({ title: 'Connection failed', description: error.message, variant: 'destructive' }),
    });
  };

  const handleSave = () => {
    saveSettings.mutate(
      { spreadsheet, workouts_tab: workoutsTab },
      {
        onSuccess: () => toast({ title: 'Sheet settings saved' }),
        onError: (error) => toast({ title: 'Could not save', description: error.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <SheetIcon className="h-5 w-5 text-emerald-600" />
            Google Sheets Sync
          </span>
          <Badge variant={status?.connected ? 'default' : 'secondary'}>
            {isLoading ? 'Checking…' : status?.connected ? 'Connected' : 'Not connected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status?.connected ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Connect your Google account to read your workout routine from your own spreadsheet and log entries back into it.
            </p>
            <Button onClick={handleConnect} disabled={connect.isPending} className="w-full">
              <Link2 className="h-4 w-4 mr-2" />
              {connect.isPending ? 'Connecting…' : 'Connect Google Sheets'}
            </Button>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="spreadsheet">Spreadsheet link or ID</Label>
              <Input
                id="spreadsheet"
                value={spreadsheet}
                onChange={(e) => setSpreadsheet(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            <div>
              <Label htmlFor="workouts-tab">Workout routine tab</Label>
              <Input id="workouts-tab" value={workoutsTab} onChange={(e) => setWorkoutsTab(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">
                Columns: Exercise | Muscle Group | Sets | Reps | Weight (kg)
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saveSettings.isPending} className="flex-1">
                Save
              </Button>
              <Button variant="outline" onClick={() => workouts.refetch()} disabled={workouts.isFetching}>
                <RefreshCw className={`h-4 w-4 ${workouts.isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" onClick={() => disconnect.mutate()}>
                <Unlink className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            {workouts.error && (
              <p className="text-sm text-red-600">{(workouts.error as Error).message}</p>
            )}
            {workouts.data && (
              <p className="text-sm text-gray-600">
                {workouts.data.length} exercises loaded from your sheet.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CONNECTOR_ID = 'google_sheets';

export default function GoogleSheetsReturn() {
  const [message, setMessage] = useState('Finishing connection…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notify = (type: 'appUserConnectorOAuthComplete' | 'appUserConnectorOAuthFailed') => {
      window.opener?.postMessage({ type, connectorId: CONNECTOR_ID }, window.location.origin);
      window.close();
    };
    if (params.get('success') !== 'true') {
      setMessage(params.get('error') ?? 'Google authorization did not complete.');
      notify('appUserConnectorOAuthFailed');
      return;
    }
    const code = params.get('code');
    if (!code) {
      if (params.get('offline_access_allowed') === 'false') {
        const reason = 'Offline access must be enabled on the Google Sheets connector client.';
        setMessage(reason);
        window.opener?.postMessage(
          { type: 'appUserConnectorOAuthFailed', connectorId: CONNECTOR_ID, reason },
          window.location.origin,
        );
        return;
      }
      setMessage('Authorization completed without an exchange code.');
      notify('appUserConnectorOAuthFailed');
      return;
    }
    void supabase.functions
      .invoke('app-user-oauth-complete', { body: { code } })
      .then(({ error }) => {
        if (error) throw error;
        notify('appUserConnectorOAuthComplete');
      })
      .catch(() => {
        setMessage('Could not finish the connection.');
        notify('appUserConnectorOAuthFailed');
      });
  }, []);

  return <p className="p-6 text-center">{message}</p>;
}

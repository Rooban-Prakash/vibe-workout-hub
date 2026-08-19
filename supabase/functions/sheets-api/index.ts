import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { callAsAppUser, disconnectAppUser } from "../_shared/appUserConnector.ts";
import { getConnectionKeyForUser, deleteConnectionForUser } from "../_shared/appUserConnections.ts";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const CONNECTOR_ID = "google_sheets";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function extractSpreadsheetId(input: string): string {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return (match ? match[1] : input).trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);

    const payload = await req.json().catch(() => ({}));
    const action = payload?.action;

    const { data: settings } = await supabase
      .from("user_sheet_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const connectionAPIKey = await getConnectionKeyForUser(user.id, CONNECTOR_ID);

    if (action === "status") {
      return json({ connected: !!connectionAPIKey, settings: settings ?? null });
    }

    if (action === "save-settings") {
      const spreadsheetId = extractSpreadsheetId(String(payload.spreadsheet ?? ""));
      if (!spreadsheetId) return json({ error: "Spreadsheet link is required" }, 400);
      const row = {
        user_id: user.id,
        spreadsheet_id: spreadsheetId,
        workouts_tab: String(payload.workouts_tab ?? "Workouts"),
        weight_tab: String(payload.weight_tab ?? "Weight"),
        mood_tab: String(payload.mood_tab ?? "Mood"),
        habits_tab: String(payload.habits_tab ?? "Habits"),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("user_sheet_settings")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ settings: data });
    }

    if (action === "disconnect") {
      if (connectionAPIKey) {
        await disconnectAppUser({ gatewayBaseUrl: GATEWAY_BASE_URL, connectionAPIKey, connectorId: CONNECTOR_ID });
        await deleteConnectionForUser(user.id, CONNECTOR_ID);
      }
      return json({ connected: false });
    }

    if (!connectionAPIKey) return json({ connected: false, error: "Google Sheets is not connected" }, 400);
    if (!settings?.spreadsheet_id) return json({ error: "No spreadsheet selected yet" }, 400);

    const spreadsheetId = settings.spreadsheet_id;

    if (action === "read") {
      const range = String(payload.range ?? "A1:Z1000");
      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: CONNECTOR_ID,
        path: `/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(`Sheets read failed [${res.status}]: ${text}`);
        return json({ error: "Google Sheets request failed", status: res.status, details: text }, res.status);
      }
      return json(JSON.parse(text || "{}"));
    }

    if (action === "append") {
      const range = String(payload.range ?? "A1");
      const values = Array.isArray(payload.values) ? payload.values : null;
      if (!values) return json({ error: "values must be an array of rows" }, 400);
      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: CONNECTOR_ID,
        path: `/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values }) },
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(`Sheets append failed [${res.status}]: ${text}`);
        return json({ error: "Google Sheets request failed", status: res.status, details: text }, res.status);
      }
      return json({ ok: true });
    }

    if (action === "update") {
      const range = String(payload.range ?? "");
      const values = Array.isArray(payload.values) ? payload.values : null;
      if (!range || !values) return json({ error: "range and values are required" }, 400);
      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: CONNECTOR_ID,
        path: `/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
        init: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values }) },
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(`Sheets update failed [${res.status}]: ${text}`);
        return json({ error: "Google Sheets request failed", status: res.status, details: text }, res.status);
      }
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("sheets-api failed:", e);
    return json({ error: String(e) }, 500);
  }
});

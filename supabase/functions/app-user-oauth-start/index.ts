import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authorizeAppUserOAuth } from "../_shared/appUserConnector.ts";
import { getConnectionKeyForUser } from "../_shared/appUserConnections.ts";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const CONNECTOR_ID = "google_sheets";
const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/spreadsheets",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Sign in required", { status: 401, headers: corsHeaders });

    const clientAPIKey = Deno.env.get("GOOGLE_SHEETS_APP_USER_CONNECTOR_CLIENT_API_KEY");
    if (!clientAPIKey) {
      return new Response("Google Sheets connector client is not configured", { status: 500, headers: corsHeaders });
    }

    const { origin } = await req.json();
    if (typeof origin !== "string" || !/^https?:\/\//.test(origin)) {
      return new Response("Invalid origin", { status: 400, headers: corsHeaders });
    }
    const returnUrl = new URL("/oauth/google-sheets/return", origin).toString();
    const existing = await getConnectionKeyForUser(user.id, CONNECTOR_ID);

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: user.id,
      clientAPIKey,
      returnUrl,
      connectionAPIKey: existing ?? undefined,
      credentialsConfiguration: { scopes: SCOPES },
    });
    return new Response(JSON.stringify({ authorizationUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("app-user-oauth-start failed:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

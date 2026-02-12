import { createClient } from "@base44/sdk";
import { appParams } from "@/lib/app-params";

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId: appId || process.env.NEXT_PUBLIC_BASE44_APP_ID || "",
  token: token || process.env.NEXT_PUBLIC_BASE44_ACCESS_TOKEN || undefined,
  functionsVersion: functionsVersion || process.env.NEXT_PUBLIC_BASE44_FUNCTIONS_VERSION || undefined,
  serverUrl: process.env.NEXT_PUBLIC_BASE44_SERVER_URL || "https://base44.app",
  requiresAuth: false,
  appBaseUrl: appBaseUrl || process.env.NEXT_PUBLIC_BASE44_APP_BASE_URL
});

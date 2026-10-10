import TradlySDK from "tradly";
import { AppConfig } from "../config/app.config.ts";

// The Tradly JS SDK must be initialized with { domain, env } before any
// user/app call — it resolves the tenant's public key (pk_by_domain) and
// caches it. The boilerplate never did this, so every API call failed when
// the app booted. This module guarantees one-time init.

let initPromise: Promise<boolean> | null = null;

export function isWorkspaceConfigured(): boolean {
  const d = (AppConfig.domain || "").trim().toLowerCase();
  if (!d) return false;
  // Without VITE_TRADLY_DOMAIN the config falls back to window.location.host
  // (e.g. localhost:8099), which is never a Tradly workspace.
  if (d.startsWith("localhost") || d.startsWith("127.") || d === "0.0.0.0") return false;
  return true;
}

export const WORKSPACE_ERROR =
  "Workspace not connected. Set VITE_TRADLY_DOMAIN in .env.local (see DEPLOY.md), then restart.";

export function ensureTradlyInit(): Promise<boolean> {
  if (!initPromise) {
    initPromise = (async () => {
      if (!isWorkspaceConfigured()) return false;
      try {
        await (TradlySDK as any).init_v2.config({
          domain: AppConfig.domain,
          env: AppConfig.env,
        });
        return true;
      } catch {
        return false;
      }
    })();
  }
  return initPromise;
}

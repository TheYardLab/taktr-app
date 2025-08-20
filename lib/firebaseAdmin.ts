// lib/firebaseAdmin.ts
import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

type AdminBundle = { app: App; db: Firestore; auth: Auth };

function tryParseJSON(str?: string | null): any | null {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function tryParseBase64JSON(str?: string | null): any | null {
  if (!str) return null;
  try {
    const decoded = Buffer.from(str, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function buildCredential(): ServiceAccount {
  // --- Preferred: GOOGLE_APPLICATION_CREDENTIALS_JSON (raw JSON string in env) ---
  // This should be the full service account JSON pasted into .env.local,
  // wrapped in single quotes so quotes/newlines are preserved.
  const gacJsonRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const gacObj =
    tryParseJSON(gacJsonRaw) ||
    // Some hosts store it base64-encoded; support that too:
    tryParseBase64JSON(gacJsonRaw || "");

  if (gacObj && gacObj.client_email && gacObj.private_key) {
    const projectId = gacObj.project_id || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = gacObj.client_email;
    const privateKey = String(gacObj.private_key).replace(/\\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
      return { projectId, clientEmail, privateKey };
    }
  }

  // --- Back-compat: full JSON provided as base64 in FIREBASE_SERVICE_ACCOUNT_BASE64 ---
  const b64Full = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const b64Obj = tryParseBase64JSON(b64Full || "");
  if (b64Obj && b64Obj.client_email && b64Obj.private_key) {
    const projectId = b64Obj.project_id || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = b64Obj.client_email;
    const privateKey = String(b64Obj.private_key).replace(/\\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
      return { projectId, clientEmail, privateKey };
    }
  }

  // --- Last resort: split fields across discrete env vars ---
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      [
        "Firebase Admin credentials not found.",
        "Set GOOGLE_APPLICATION_CREDENTIALS_JSON to the FULL service account JSON",
        "  (or) FIREBASE_SERVICE_ACCOUNT_BASE64 with the JSON base64-encoded,",
        "  (or) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.",
      ].join(" ")
    );
  }

  return { projectId, clientEmail, privateKey };
}

function init(): AdminBundle {
  const credential = cert(buildCredential());
  const app = getApps().length === 0 ? initializeApp({ credential }) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  return { app, db, auth };
}

// Cache across Next.js dev reloads
const GLOBAL_KEY = "__taktr_admin__";

export default ((): AdminBundle => {
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = init();
  return g[GLOBAL_KEY] as AdminBundle;
})();
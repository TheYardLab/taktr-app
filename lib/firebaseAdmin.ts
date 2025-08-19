// lib/firebaseAdmin.ts
import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

type AdminBundle = { app: App; db: Firestore; auth: Auth };

function decodeBase64(str?: string | null): string | null {
  if (!str) return null;
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return null;
  }
}

function buildCredential(): ServiceAccount {
  // 1) Prefer a base64-encoded FULL service-account JSON
  //    (works with either FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_PRIVATE_KEY_BASE64 in your .env.local)
  const b64Json =
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ||
    process.env.FIREBASE_PRIVATE_KEY_BASE64;

  const decoded = decodeBase64(b64Json || "");
  if (decoded) {
    try {
      const obj = JSON.parse(decoded);
      // Expect fields present in a normal service-account JSON
      const projectId = obj.project_id;
      const clientEmail = obj.client_email;
      const privateKey = (obj.private_key || "").replace(/\\n/g, "\n");
      if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey };
      }
    } catch {
      // fall through to option 2
    }
  }

  // 2) Fall back to separate env vars (private key may have \n escapes)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials not found. Provide FIREBASE_SERVICE_ACCOUNT_BASE64 (or FIREBASE_PRIVATE_KEY_BASE64), or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY."
    );
  }

  return { projectId, clientEmail, privateKey };
}

function init(): AdminBundle {
  const credential = cert(buildCredential());

  const app =
    getApps().length === 0
      ? initializeApp({ credential })
      : getApp();

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
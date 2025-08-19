// lib/firebase.ts
// Safe Firebase client init for Next.js (SSR-friendly)

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Auth } from "firebase/auth";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string | undefined,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: process.env
    .NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: process.env
    .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string | undefined,
};

// Do NOT throw on server — just warn; the client will use the proper envs.
if (typeof window !== "undefined" && !firebaseConfig.apiKey) {
  // This is the only place we’d see the invalid API key symptom.
  // If you see this in the browser console, check .env.local values & restart.
  // eslint-disable-next-line no-console
  console.error(
    "Missing NEXT_PUBLIC_FIREBASE_* values. Check .env.local and restart the dev server."
  );
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Create Auth **only in the browser** to avoid SSR init errors.
export const auth: Auth | null =
  typeof window !== "undefined" ? getAuth(app) : null;

// Helpful globals for quick console testing in the browser.
if (typeof window !== "undefined") {
  (window as any).app = app;
  (window as any).db = db;
  (window as any).auth = auth;
}
export default app;
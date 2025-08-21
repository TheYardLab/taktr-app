// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // optional, browser-only

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}. Check your .env.local and Vercel env settings.`);
  return v;
}

const clientConfig = {
  apiKey: req("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: req("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: req("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: req("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: req("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: req("NEXT_PUBLIC_FIREBASE_APP_ID"),
  // Only include if set
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
    : {}),
};

const app = getApps().length ? getApp() : initializeApp(clientConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// If you want Analytics, gate it to browser only:
// const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;

export { app, auth, db, storage };
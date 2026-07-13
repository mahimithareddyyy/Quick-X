// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA3hkxFuzgTSq3yKvFaiFKnFNotO5Ta7do",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quick-x-8ed8e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quick-x-8ed8e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quick-x-8ed8e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "170611248907",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:170611248907:web:94893e8f734a83276c1c0e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QVLQJ8WLB7"
};

// Initialize Firebase (prevent duplicate app error)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Re-export types and utilities
export * from './types';
export * from './utils';

export default app;
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace these with your actual Firebase config keys
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyD_PLACEHOLDER",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "placeholder-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "placeholder.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

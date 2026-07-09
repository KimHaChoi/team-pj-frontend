import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if credentials are valid and not empty or placeholders
const isConfigValid = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

let app;
let db: any = null;
let storage: any = null;
let isFirebaseActive = false;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    storage = getStorage(app);
    isFirebaseActive = true;
    console.log('⚡ Firebase is successfully initialized and active.');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
  }
} else {
  console.log('ℹ️ Firebase configuration not found or invalid. Running in Local Storage Fallback Mode.');
}

export { db, storage, isFirebaseActive };
export default app;

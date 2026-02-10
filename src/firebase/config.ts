import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCV-QuBqz_6CftA-2WNz0GJcwwk6JCaYLw',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'kawiarniamenago.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'kawiarniamenago',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'kawiarniamenago.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '403180392583',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:403180392583:web:b4220e23405b384fe2a822',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;

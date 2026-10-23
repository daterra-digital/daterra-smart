import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBMHfYUCcC-E-FzKkUkPDRaJVVHcTl6MaY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'daterra-smart-4c0cf.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'daterra-smart-4c0cf',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'daterra-smart-4c0cf.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '467705911466',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:467705911466:web:53dce21622f9d2aa1418d3',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-T6VDSDCQJG'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDb = getFirestore(app);
export const functions = getFunctions(app);

export const analyticsPromise =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch(() => null)
    : Promise.resolve(null);

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-uNlP4_uPgvKZG-qR_1t9bPn4PeOYxh0",
  authDomain: "bankapp-de728.firebaseapp.com",
  projectId: "bankapp-de728",
  storageBucket: "bankapp-de728.firebasestorage.app",
  messagingSenderId: "626391983658",
  appId: "1:626391983658:web:0b7bc1d74e9a6d56a9c553",
  measurementId: "G-BDTTCDHZJL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export default app;

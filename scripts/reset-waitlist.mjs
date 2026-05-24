import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-uNlP4_uPgvKZG-qR_1t9bPn4PeOYxh0",
  authDomain: "bankapp-de728.firebaseapp.com",
  projectId: "bankapp-de728",
  storageBucket: "bankapp-de728.firebasestorage.app",
  messagingSenderId: "626391983658",
  appId: "1:626391983658:web:0b7bc1d74e9a6d56a9c553",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Delete all known test waitlist entries
const testEmails = [
  's.borjas@lucilla.ca',
  's.borjash@gmail.com',
];

for (const email of testEmails) {
  const id = email.toLowerCase().trim();
  try {
    await deleteDoc(doc(db, 'waitlist', id));
    console.log(`Deleted waitlist/${id}`);
  } catch (e) {
    console.log(`waitlist/${id}: ${e.message}`);
  }
}

// Reset counter to 0
try {
  await setDoc(doc(db, 'counters', 'waitlist'), { count: 0 });
  console.log('Counter reset to 0');
} catch (e) {
  console.log(`Counter reset failed: ${e.message}`);
}

process.exit(0);

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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

// Find user by email
const targetEmail = 's.borjash@gmail.com';
const usersSnap = await getDocs(collection(db, 'users'));
let uid = null;
usersSnap.forEach(d => {
  if (d.data().email === targetEmail) uid = d.id;
});

if (!uid) { console.log('User not found'); process.exit(1); }
console.log(`Found user: ${uid}`);

// Reset profile fields
await updateDoc(doc(db, 'users', uid), {
  bio: '',
  bannerUrl: '',
  countryOrigin: '',
  currentCity: '',
  phone: '',
  telegram: '',
  displayEmail: '',
  website: '',
  socialLinks: { linkedin: '', instagram: '', x: '', telegram: '' },
  socialVisibility: {},
});
console.log('Profile reset');

// Delete all posts by this user
const postsSnap = await getDocs(query(collection(db, 'posts'), where('authorId', '==', uid)));
for (const d of postsSnap.docs) {
  await deleteDoc(doc(db, 'posts', d.id));
  console.log(`Deleted post ${d.id}`);
}

console.log('Done');
process.exit(0);

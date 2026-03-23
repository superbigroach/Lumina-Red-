import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  addDoc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, Timestamp, increment,
  DocumentData, QueryConstraint
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ============ TYPES ============
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  countryOrigin: string;
  currentCity: string;
  currentProvince: string;
  socialLinks: { linkedin?: string; instagram?: string; x?: string; whatsapp?: string; tiktok?: string; };
  walletAddress: string | null;
  walletId: string | null;
  createdAt: Timestamp;
}

export interface Business {
  id: string;
  founderId: string;
  founderName: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logoUrl: string;
  galleryUrls: string[];
  fundingGoalUsdc: number;
  amountRaisedUsdc: number;
  backerCount: number;
  equityPoolPercent: number;
  status: 'active' | 'funded' | 'draft';
  isTemplate: boolean;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  businessId?: string;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: Timestamp;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  requesterName: string;
  receiverName: string;
  requesterPhoto: string;
  receiverPhoto: string;
  status: 'pending' | 'accepted';
  createdAt: Timestamp;
}

export interface LRTransaction {
  id: string;
  backerId: string;
  backerName: string;
  recipientId: string;
  businessId: string;
  businessName: string;
  amountUsdc: number;
  type: 'donation' | 'equity_purchase';
  status: 'pending' | 'completed' | 'failed';
  txHash: string | null;
  createdAt: Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Timestamp;
}

// ============ USER PROFILE ============
export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, 'users', uid), {
    uid, displayName: data.displayName || '', email: data.email || '', photoURL: data.photoURL || '',
    bio: '', countryOrigin: '', currentCity: '', currentProvince: '', socialLinks: {},
    walletAddress: null, walletId: null, createdAt: serverTimestamp(), ...data,
  }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } as UserProfile : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), data as DocumentData);
}

// ============ BUSINESSES ============
export async function createBusiness(data: Omit<Business, 'id' | 'createdAt' | 'amountRaisedUsdc' | 'backerCount'>): Promise<string> {
  const ref = await addDoc(collection(db, 'businesses'), { ...data, amountRaisedUsdc: 0, backerCount: 0, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getBusiness(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, 'businesses', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Business : null;
}

export function onBusinesses(callback: (businesses: Business[]) => void) {
  return onSnapshot(query(collection(db, 'businesses'), orderBy('createdAt', 'desc')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Business)));
  });
}

export async function updateBusiness(id: string, data: Partial<Business>) {
  await updateDoc(doc(db, 'businesses', id), data as DocumentData);
}

// ============ POSTS ============
export async function createPost(data: { content: string; mediaUrls?: string[]; businessId?: string }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await addDoc(collection(db, 'posts'), {
    authorId: user.uid, authorName: user.displayName || 'Anonymous', authorPhoto: user.photoURL || '',
    content: data.content, mediaUrls: data.mediaUrls || [], businessId: data.businessId || null,
    likeCount: 0, commentCount: 0, createdAt: serverTimestamp(),
  });
}

export function onPosts(callback: (posts: Post[]) => void, maxPosts = 50) {
  return onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(maxPosts)), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
  });
}

export async function toggleLike(postId: string) {
  const user = auth.currentUser;
  if (!user) return;
  const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
  const likeSnap = await getDoc(likeRef);
  const postRef = doc(db, 'posts', postId);
  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likeCount: increment(-1) });
    return false;
  } else {
    await setDoc(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
    await updateDoc(postRef, { likeCount: increment(1) });
    return true;
  }
}

export async function hasLiked(postId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, 'posts', postId, 'likes', user.uid));
  return snap.exists();
}

// ============ COMMENTS ============
export async function addComment(postId: string, content: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    authorId: user.uid, authorName: user.displayName || 'Anonymous', authorPhoto: user.photoURL || '', content, createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) });
}

export function onComments(postId: string, callback: (comments: Comment[]) => void) {
  return onSnapshot(query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
  });
}

// ============ FRIENDSHIPS ============
export async function sendFriendRequest(receiverId: string, receiverName: string, receiverPhoto: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await addDoc(collection(db, 'friendships'), {
    requesterId: user.uid, receiverId, requesterName: user.displayName || '', receiverName,
    requesterPhoto: user.photoURL || '', receiverPhoto, status: 'pending', createdAt: serverTimestamp(),
  });
}

export async function acceptFriendRequest(friendshipId: string) {
  await updateDoc(doc(db, 'friendships', friendshipId), { status: 'accepted' });
}

export function onFriendships(uid: string, callback: (f: Friendship[]) => void) {
  return onSnapshot(query(collection(db, 'friendships'), where('status', '==', 'accepted')), (snap) => {
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
    callback(all.filter(f => f.requesterId === uid || f.receiverId === uid));
  });
}

export function onPendingRequests(uid: string, callback: (r: Friendship[]) => void) {
  return onSnapshot(query(collection(db, 'friendships'), where('receiverId', '==', uid), where('status', '==', 'pending')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship)));
  });
}

// ============ TRANSACTIONS ============
export async function createTransaction(data: Omit<LRTransaction, 'id' | 'createdAt' | 'status' | 'txHash'>) {
  const ref = await addDoc(collection(db, 'transactions'), { ...data, status: 'pending', txHash: null, createdAt: serverTimestamp() });
  // Update business raised amount
  await updateDoc(doc(db, 'businesses', data.businessId), {
    amountRaisedUsdc: increment(data.amountUsdc),
    backerCount: increment(1),
  });
  // Mark as completed (in production, wait for on-chain confirmation)
  await updateDoc(ref, { status: 'completed' });
  return ref.id;
}

export function onUserTransactions(uid: string, callback: (txs: LRTransaction[]) => void) {
  return onSnapshot(query(collection(db, 'transactions'), where('backerId', '==', uid), orderBy('createdAt', 'desc')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as LRTransaction)));
  });
}

// ============ MESSAGING ============
export async function getOrCreateConversation(otherUid: string, otherName: string, otherPhoto: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const snap = await getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid)));
  const existing = snap.docs.find(d => d.data().participants.includes(otherUid));
  if (existing) return existing.id;
  const ref = await addDoc(collection(db, 'conversations'), {
    participants: [user.uid, otherUid],
    participantNames: { [user.uid]: user.displayName || '', [otherUid]: otherName },
    participantPhotos: { [user.uid]: user.photoURL || '', [otherUid]: otherPhoto },
    lastMessage: '', lastMessageAt: serverTimestamp(), createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function sendMessage(conversationId: string, content: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId: user.uid, senderName: user.displayName || 'Anonymous', content, createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', conversationId), { lastMessage: content, lastMessageAt: serverTimestamp() });
}

export function onConversations(uid: string, callback: (c: Conversation[]) => void) {
  return onSnapshot(query(collection(db, 'conversations'), where('participants', 'array-contains', uid), orderBy('lastMessageAt', 'desc')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation)));
  });
}

export function onMessages(conversationId: string, callback: (m: ChatMessage[]) => void) {
  return onSnapshot(query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
  });
}

// ============ SEED TEMPLATES ============
export async function seedTemplateBusinesses() {
  const snap = await getDocs(query(collection(db, 'businesses'), where('isTemplate', '==', true)));
  if (snap.size >= 3) return;
  const templates = [
    { founderId: 'template', founderName: 'Maria Gonzalez', name: 'Sabor de Casa', tagline: 'Authentic home-cooked Latin cuisine delivered to your door', description: 'Sabor de Casa brings the warmth of abuela\'s kitchen to every home. Traditional recipes from Mexico, Colombia, and Peru — prepared fresh daily. Our mission is to preserve culinary traditions while creating economic opportunity for immigrant women chefs.', category: 'Food & Restaurant', logoUrl: 'https://ui-avatars.com/api/?name=Sabor+Casa&background=C2652A&color=fff&size=200', galleryUrls: ['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800','https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'], fundingGoalUsdc: 15000, amountRaisedUsdc: 4250, backerCount: 18, equityPoolPercent: 15, status: 'active' as const, isTemplate: true },
    { founderId: 'template', founderName: 'Carlos Ramirez', name: 'NexoTech Labs', tagline: 'AI-powered tools for Latino small businesses', description: 'NexoTech Labs builds affordable AI tools that help Latino-owned small businesses compete. Our first product is an AI bookkeeper that handles invoicing, tax prep, and financial reporting in Spanish — all for $29/month.', category: 'Technology', logoUrl: 'https://ui-avatars.com/api/?name=NexoTech&background=0D9488&color=fff&size=200', galleryUrls: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'], fundingGoalUsdc: 50000, amountRaisedUsdc: 12800, backerCount: 34, equityPoolPercent: 20, status: 'active' as const, isTemplate: true },
    { founderId: 'template', founderName: 'Ana Lucia Torres', name: 'Raices Fitness', tagline: 'Movement rooted in culture — Latin dance fitness', description: 'Raices Fitness combines Latin dance traditions with modern fitness science. Hybrid studio + app: in-person classes in Toronto and on-demand workouts globally. Celebrating our culture while keeping our community healthy.', category: 'Health & Fitness', logoUrl: 'https://ui-avatars.com/api/?name=Raices+Fit&background=F59E0B&color=fff&size=200', galleryUrls: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'], fundingGoalUsdc: 25000, amountRaisedUsdc: 8900, backerCount: 42, equityPoolPercent: 10, status: 'active' as const, isTemplate: true },
  ];
  for (const t of templates) await addDoc(collection(db, 'businesses'), { ...t, createdAt: serverTimestamp() });
}

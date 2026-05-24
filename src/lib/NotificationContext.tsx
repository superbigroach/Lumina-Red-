import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

// ============ TYPES ============

export interface AppNotification {
  id: string;
  userId: string;
  type: 'donation' | 'friend_request' | 'friend_accepted' | 'message';
  title: string;
  body: string;
  relatedId: string;
  read: boolean;
  createdAt: Timestamp;
}

interface ConversationWithUnread {
  id: string;
  participants: string[];
  unreadCounts?: Record<string, number>;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  unreadMessages: number;
  totalUnread: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

// ============ CONTEXT ============

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  unreadMessages: 0,
  totalUnread: 0,
  markRead: async () => {},
  markAllRead: async () => {},
});

// ============ PROVIDER ============

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Listen to notifications for the current user
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const uid = user.uid;
    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(notifQuery, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification))
      );
    });

    return unsubscribe;
  }, [user]);

  // Listen to conversations and count unread for the current user
  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }

    const uid = user.uid;
    const convQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(convQuery, (snap) => {
      let count = 0;
      snap.docs.forEach((d) => {
        const conv = d.data() as ConversationWithUnread;
        const unread = conv.unreadCounts?.[uid] ?? 0;
        if (unread > 0) count += 1;
      });
      setUnreadMessages(count);
    });

    return unsubscribe;
  }, [user]);

  // ============ ACTIONS ============

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (!unread.length) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  // ============ DERIVED STATE ============

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalUnread = unreadCount + unreadMessages;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadMessages,
        totalUnread,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ============ HOOK ============

export function useNotifications() {
  return useContext(NotificationContext);
}

export { NotificationContext };
export type { NotificationContextType };

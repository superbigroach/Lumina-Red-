import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Heart,
  UserPlus,
  MessageCircle,
  Users,
  Check,
  ArrowLeft,
  CheckCheck,
} from 'lucide-react';
import { useNotifications, AppNotification } from '../lib/NotificationContext';

// ============ HELPERS ============

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'justo ahora';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function groupLabel(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return 'Esta semana';
  return 'Más antiguo';
}

// ============ ICON CONFIG ============

function NotificationIcon({ type }: { type: AppNotification['type'] }) {
  if (type === 'donation') {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-50">
        <Heart className="h-5 w-5 text-terracotta-500" />
      </div>
    );
  }
  if (type === 'friend_request') {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50">
        <UserPlus className="h-5 w-5 text-teal-500" />
      </div>
    );
  }
  if (type === 'friend_accepted') {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50">
        <Users className="h-5 w-5 text-teal-500" />
      </div>
    );
  }
  // message
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
      <MessageCircle className="h-5 w-5 text-blue-500" />
    </div>
  );
}

// ============ NOTIFICATION ITEM ============

interface NotificationItemProps {
  notification: AppNotification;
  onTap: (notification: AppNotification) => void;
}

function NotificationItem({ notification, onTap }: NotificationItemProps) {
  const date = notification.createdAt.toDate();

  return (
    <div
      onClick={() => onTap(notification)}
      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all hover:brightness-95 ${
        notification.read ? 'bg-white' : 'bg-terracotta-50/30'
      }`}
    >
      {/* Left: icon */}
      <NotificationIcon type={notification.type} />

      {/* Center: text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {notification.title}
        </p>
        <p className="mt-0.5 text-sm text-gray-600 leading-snug">
          {notification.body}
        </p>
        <p className="mt-1 text-xs text-gray-400">{timeAgo(date)}</p>
      </div>

      {/* Right: read indicator */}
      <div className="shrink-0 pt-1">
        {notification.read ? (
          <Check className="h-4 w-4 text-gray-300" />
        ) : (
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
        )}
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead } = useNotifications();
  const [showEmpty, setShowEmpty] = useState(false);

  const hasUnread = notifications.some((n) => !n.read);

  // Show empty state after 1 second if still no notifications
  useEffect(() => {
    if (notifications.length > 0) {
      setShowEmpty(false);
      return;
    }
    const timer = setTimeout(() => setShowEmpty(true), 1000);
    return () => clearTimeout(timer);
  }, [notifications.length]);

  // Group notifications by date label
  const grouped = useMemo(() => {
    const groups: Record<string, AppNotification[]> = {};
    const order: string[] = [];

    notifications.forEach((n) => {
      const label = groupLabel(n.createdAt.toDate());
      if (!groups[label]) {
        groups[label] = [];
        order.push(label);
      }
      groups[label].push(n);
    });

    return order.map((label) => ({ label, items: groups[label] }));
  }, [notifications]);

  const handleTap = async (notification: AppNotification) => {
    if (!notification.read) {
      await markRead(notification.id);
    }

    switch (notification.type) {
      case 'donation':
        navigate(`/business/${notification.relatedId}`);
        break;
      case 'friend_request':
      case 'friend_accepted':
        navigate('/profile');
        break;
      case 'message':
        navigate('/messages');
        break;
    }
  };

  // Loading state: no notifications yet and timer hasn't fired
  const isLoading = notifications.length === 0 && !showEmpty;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
        </div>

        {hasUnread && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-teal-500 px-3 py-1.5 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todo leído
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
        </div>
      )}

      {/* Empty state */}
      {showEmpty && notifications.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Bell className="h-16 w-16 text-gray-200" />
          <h2 className="mt-4 text-lg font-semibold text-gray-700">
            No tienes notificaciones aún
          </h2>
          <p className="mt-2 max-w-xs text-sm text-gray-400">
            Te notificaremos cuando alguien done a tu negocio, te envíe un
            mensaje o acepte tu solicitud de amistad.
          </p>
        </div>
      )}

      {/* Grouped notification list */}
      {notifications.length > 0 && (
        <div className="space-y-1">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              {/* Sticky group header */}
              <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
                  {label}
                </p>
              </div>

              {/* Items in this group */}
              <div className="space-y-1">
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onTap={handleTap}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

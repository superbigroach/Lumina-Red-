import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  X as XIcon,
  Send as SendIcon,
  UserPlus,
  Users,
  Clock,
  Check,
  MessageCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import {
  getUserProfile,
  onPosts,
  onUserBadges,
  onBusinesses,
  getOrCreateConversation,
  sendFriendRequest,
  onFriendships,
  UserProfile as UserProfileType,
  Post,
  DonationBadge,
  Business,
  Friendship,
} from '../lib/firestore';
import { BadgeGrid } from '../components/ContributionBadge';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── helpers ────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'justo ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

type FriendState = 'none' | 'pending_sent' | 'pending_received' | 'accepted';
type Tab = 'posts' | 'badges' | 'businesses';

// ─── component ───────────────────────────────────────────────────────────────

export default function PublicProfile() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [badges, setBadges] = useState<DonationBadge[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [friendState, setFriendState] = useState<FriendState>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('posts');

  // ── redirect if viewing own profile ───────────────────────────────────────
  useEffect(() => {
    if (user && uid && user.uid === uid) {
      navigate('/profile', { replace: true });
    }
  }, [user, uid, navigate]);

  // ── load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      const p = await getUserProfile(uid);
      if (cancelled) return;
      if (!p) {
        setNotFound(true);
      } else {
        setProfile(p);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  // ── subscribe to posts, badges, businesses ────────────────────────────────
  useEffect(() => {
    if (!uid) return;

    const unsubPosts = onPosts((all) => {
      setPosts(all.filter((p) => p.authorId === uid));
    });

    const unsubBadges = onUserBadges(uid, setBadges);

    const unsubBusinesses = onBusinesses((all) => {
      setBusinesses(all.filter((b) => b.founderId === uid));
    });

    return () => {
      unsubPosts();
      unsubBadges();
      unsubBusinesses();
    };
  }, [uid]);

  // ── subscribe to friendship status ────────────────────────────────────────
  useEffect(() => {
    if (!user || !uid) return;

    // Watch all friendships (any status) that involve current user
    // We query two sides: where I am requester, where I am receiver
    const qSent = query(
      collection(db, 'friendships'),
      where('requesterId', '==', user.uid),
      where('receiverId', '==', uid),
    );
    const qReceived = query(
      collection(db, 'friendships'),
      where('requesterId', '==', uid),
      where('receiverId', '==', user.uid),
    );

    const resolve = (friendships: Friendship[]) => {
      if (friendships.length === 0) {
        setFriendState('none');
        setFriendshipId(null);
        return;
      }
      const f = friendships[0];
      setFriendshipId(f.id);
      if (f.status === 'accepted') {
        setFriendState('accepted');
      } else if (f.requesterId === user.uid) {
        setFriendState('pending_sent');
      } else {
        setFriendState('pending_received');
      }
    };

    let sentData: Friendship[] = [];
    let receivedData: Friendship[] = [];

    const merge = () => resolve([...sentData, ...receivedData]);

    const unsubSent = onSnapshot(qSent, (snap) => {
      sentData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Friendship));
      merge();
    });

    const unsubReceived = onSnapshot(qReceived, (snap) => {
      receivedData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Friendship));
      merge();
    });

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [user, uid]);

  // ── action handlers ───────────────────────────────────────────────────────

  const handleMessage = async () => {
    if (!profile) return;
    setSendingMessage(true);
    try {
      await getOrCreateConversation(profile.uid, profile.displayName, profile.photoURL);
      navigate('/messages');
    } catch (err) {
      console.error('Failed to open conversation:', err);
    }
    setSendingMessage(false);
  };

  const handleFriendAction = async () => {
    if (!profile || friendState !== 'none') return;
    setSendingRequest(true);
    try {
      await sendFriendRequest(profile.uid, profile.displayName, profile.photoURL);
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
    setSendingRequest(false);
  };

  // ── derived ───────────────────────────────────────────────────────────────

  const avatarUrl =
    profile?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || '?')}&background=C2652A&color=fff&size=200`;

  const sv = profile?.socialVisibility || {};
  const profilePhone = profile?.phone;
  const profileTelegram = profile?.telegram || profile?.socialLinks?.telegram;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'posts', label: 'Posts', count: posts.length },
    { key: 'badges', label: 'Insignias', count: badges.length },
    { key: 'businesses', label: 'Negocios', count: businesses.length },
  ];

  // ── loading / not found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta-500" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-gray-700">Usuario no encontrado</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary py-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-warm-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        {/* ── Profile header card ─────────────────────────────────────────── */}
        <div className="card overflow-hidden">
          {/* Cover banner */}
          <div
            className="h-32 sm:h-40"
            style={(profile as any).bannerUrl
              ? { backgroundImage: `url(${(profile as any).bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: 'linear-gradient(135deg, #7B2D1A 0%, #C2652A 38%, #D4845A 52%, #0D9488 78%, #064E3B 100%)' }
            }
          />

          <div className="relative z-10 px-6 pb-6">
            {/* Avatar + name row */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
              <img
                src={avatarUrl}
                alt={profile.displayName}
                className="-mt-12 h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg sm:-mt-14 sm:h-24 sm:w-24"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl font-bold text-gray-900 truncate">
                  {profile.displayName}
                </h1>
                {sv.email && profile.email && (
                  <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                )}
                {(profile.currentCity || profile.countryOrigin) && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {[profile.currentCity, profile.countryOrigin].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{profile.bio}</p>
            )}

            {/* Stats row */}
            <div className="mt-5 flex gap-6 border-t border-gray-100 pt-5">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{badges.length}</p>
                <p className="text-xs text-gray-500">Insignias</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{businesses.length}</p>
                <p className="text-xs text-gray-500">Negocios</p>
              </div>
            </div>

            {/* Action buttons — only for logged-in users viewing someone else */}
            {user && (
              <div className="mt-5 flex flex-wrap gap-3">
                {/* Message button */}
                <button
                  onClick={handleMessage}
                  disabled={sendingMessage}
                  className="btn-primary py-2 text-sm"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  Enviar Mensaje
                </button>

                {/* Friend button */}
                {friendState === 'none' && (
                  <button
                    onClick={handleFriendAction}
                    disabled={sendingRequest}
                    className="btn-secondary py-2 text-sm"
                  >
                    {sendingRequest ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Agregar Amigo
                  </button>
                )}

                {friendState === 'pending_sent' && (
                  <button
                    disabled
                    className="btn-secondary py-2 text-sm cursor-not-allowed opacity-70"
                  >
                    <Clock className="h-4 w-4" />
                    Solicitud enviada
                  </button>
                )}

                {friendState === 'pending_received' && (
                  <button
                    disabled
                    className="btn-secondary py-2 text-sm cursor-not-allowed opacity-70"
                  >
                    <Check className="h-4 w-4" />
                    Aceptar solicitud
                  </button>
                )}

                {friendState === 'accepted' && (
                  <button
                    disabled
                    className="btn-secondary py-2 text-sm cursor-not-allowed opacity-70"
                  >
                    <Users className="h-4 w-4" />
                    Amigos ✓
                  </button>
                )}
              </div>
            )}

            {/* Public contact info */}
            {(
              (sv.email && profile.email) ||
              (sv.phone && profilePhone) ||
              (sv.linkedin && profile.socialLinks?.linkedin) ||
              (sv.x && profile.socialLinks?.x) ||
              (sv.telegram && profileTelegram)
            ) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Contacto
                </p>
                <div className="flex flex-wrap gap-2">
                  {sv.email && profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {profile.email}
                    </a>
                  )}
                  {sv.phone && profilePhone && (
                    <a
                      href={`tel:${profilePhone}`}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {profilePhone}
                    </a>
                  )}
                  {sv.linkedin && profile.socialLinks?.linkedin && (
                    <a
                      href={
                        profile.socialLinks.linkedin.startsWith('http')
                          ? profile.socialLinks.linkedin
                          : `https://${profile.socialLinks.linkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {sv.x && profile.socialLinks?.x && (
                    <a
                      href={`https://x.com/${profile.socialLinks.x.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                      {profile.socialLinks.x}
                    </a>
                  )}
                  {sv.telegram && profileTelegram && (
                    <a
                      href={`https://t.me/${profileTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <SendIcon className="h-3.5 w-3.5" />
                      {profileTelegram}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="mt-8 border-b border-gray-200">
          <div className="flex gap-6">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'border-terracotta-500 text-terracotta-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ─────────────────────────────────────────────────── */}
        <div className="mt-6">

          {/* Posts tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">Sin publicaciones aún</p>
              ) : (
                posts.map((post) => {
                  const createdAt = post.createdAt?.toDate
                    ? post.createdAt.toDate()
                    : new Date();
                  const postAvatar =
                    post.authorPhoto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=C2652A&color=fff&size=200`;
                  return (
                    <article key={post.id} className="card p-5">
                      <div className="flex items-start gap-3">
                        <img
                          src={postAvatar}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {post.authorName}
                          </p>
                          <p className="text-xs text-gray-400">{timeAgo(createdAt)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                        {post.content}
                      </p>
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {post.mediaUrls.map((url, i) => (
                            <img key={i} src={url} alt="" className="w-full rounded-xl object-cover max-h-80" loading="lazy" />
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                        <span>{post.likeCount} likes</span>
                        <span>{post.commentCount} comentarios</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* Badges tab */}
          {activeTab === 'badges' && (
            <BadgeGrid
              badges={badges}
              emptyText="Sin insignias aún"
            />
          )}

          {/* Businesses tab */}
          {activeTab === 'businesses' && (
            <div>
              {businesses.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">
                  Sin negocios registrados
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((biz) => {
                    const logoFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(biz.name)}&background=C2652A&color=fff&size=200`;
                    const pct = biz.fundingGoalUsdc > 0
                      ? Math.min(100, Math.round((biz.amountRaisedUsdc / biz.fundingGoalUsdc) * 100))
                      : 0;
                    return (
                      <Link
                        key={biz.id}
                        to={`/business/${biz.id}`}
                        className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
                      >
                        {/* Logo */}
                        <div className="flex items-center gap-3 p-4">
                          <img
                            src={biz.logoUrl || logoFallback}
                            alt={biz.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = logoFallback;
                            }}
                            className="h-12 w-12 flex-shrink-0 rounded-xl object-cover border border-gray-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-terracotta-600 transition-colors">
                              {biz.name}
                            </p>
                            <span className="inline-block rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500 mt-0.5">
                              {biz.category}
                            </span>
                          </div>
                        </div>

                        {/* Funding bar */}
                        <div className="border-t border-gray-50 px-4 py-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <span className="font-medium text-teal-600">
                              ${biz.amountRaisedUsdc.toLocaleString()} USDC
                            </span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div
                              className="h-1.5 rounded-full bg-teal-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

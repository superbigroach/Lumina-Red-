import { useState, useEffect } from 'react';
import {
  MapPin,
  Edit3,
  Save,
  X,
  TrendingUp,
  Users,
  Newspaper,
  Linkedin,
  Instagram,
  MessageCircle,
  UserPlus,
  Check,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import {
  getUserProfile, updateUserProfile, createUserProfile,
  onPosts, onFriendships, onPendingRequests, acceptFriendRequest,
  onUserTransactions,
  UserProfile as UserProfileType,
  Post, Friendship, LRTransaction,
} from '../lib/firestore';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type Tab = 'posts' | 'connections' | 'portfolio';

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [bio, setBio] = useState('');
  const [countryOrigin, setCountryOrigin] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialX, setSocialX] = useState('');
  const [saving, setSaving] = useState(false);

  // Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [transactions, setTransactions] = useState<LRTransaction[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      let p = await getUserProfile(user.uid);
      if (!p) {
        await createUserProfile(user.uid, {
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
        });
        p = await getUserProfile(user.uid);
      }
      if (!cancelled && p) {
        setProfile(p);
        setBio(p.bio || '');
        setCountryOrigin(p.countryOrigin || '');
        setCurrentCity(p.currentCity || '');
        setSocialLinkedin(p.socialLinks?.linkedin || '');
        setSocialInstagram(p.socialLinks?.instagram || '');
        setSocialX(p.socialLinks?.x || '');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onPosts((allPosts) => {
        setPosts(allPosts.filter((p) => p.authorId === user.uid));
      }),
      onFriendships(user.uid, setFriends),
      onPendingRequests(user.uid, setPendingRequests),
      onUserTransactions(user.uid, setTransactions),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        bio,
        countryOrigin,
        currentCity,
        socialLinks: {
          linkedin: socialLinkedin || undefined,
          instagram: socialInstagram || undefined,
          x: socialX || undefined,
        },
      } as any);
      setProfile((prev) => prev ? {
        ...prev, bio, countryOrigin, currentCity,
        socialLinks: { linkedin: socialLinkedin, instagram: socialInstagram, x: socialX },
      } : prev);
      setEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (profile) {
      setBio(profile.bio || '');
      setCountryOrigin(profile.countryOrigin || '');
      setCurrentCity(profile.currentCity || '');
      setSocialLinkedin(profile.socialLinks?.linkedin || '');
      setSocialInstagram(profile.socialLinks?.instagram || '');
      setSocialX(profile.socialLinks?.x || '');
    }
    setEditing(false);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId);
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const totalDonated = transactions.reduce((sum, tx) => sum + tx.amountUsdc, 0);
  const uniqueBusinesses = new Set(transactions.map((tx) => tx.businessId)).size;

  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || '?')}&background=C2652A&color=fff&size=200`;

  const tabs = [
    { key: 'posts' as const, label: 'Mis Posts', icon: Newspaper, count: posts.length },
    { key: 'connections' as const, label: 'Conexiones', icon: Users, count: friends.length },
    { key: 'portfolio' as const, label: 'Impact & Portfolio', icon: TrendingUp, count: transactions.length },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-terracotta-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Pending friend requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-6 card p-4">
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-terracotta-500" />
            Solicitudes de amistad ({pendingRequests.length})
          </p>
          <div className="mt-3 space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3">
                <img
                  src={req.requesterPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requesterName)}&background=0D9488&color=fff&size=100`}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="flex-1 text-sm text-gray-700">{req.requesterName}</span>
                <button
                  onClick={() => handleAcceptRequest(req.id)}
                  className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
                >
                  <Check className="mr-1 inline h-3 w-3" />
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile header */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-terracotta-400 via-terracotta-500 to-teal-500 sm:h-40" />

        <div className="px-6 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
            <img
              src={avatarUrl}
              alt={user?.displayName || 'Avatar'}
              className="-mt-12 h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg sm:-mt-14 sm:h-28 sm:w-28"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-gray-900">
                {user?.displayName || 'Anonymous'}
              </h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary py-2 text-sm"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Bio & editable fields */}
          <div className="mt-4">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Tell the community about yourself..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Country of Origin</label>
                    <input
                      type="text"
                      value={countryOrigin}
                      onChange={(e) => setCountryOrigin(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Mexico, Colombia"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Current City</label>
                    <input
                      type="text"
                      value={currentCity}
                      onChange={(e) => setCurrentCity(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Miami, Toronto"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">LinkedIn</label>
                    <input
                      type="text"
                      value={socialLinkedin}
                      onChange={(e) => setSocialLinkedin(e.target.value)}
                      className="input-field"
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Instagram</label>
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      className="input-field"
                      placeholder="@handle"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">X (Twitter)</label>
                    <input
                      type="text"
                      value={socialX}
                      onChange={(e) => setSocialX(e.target.value)}
                      className="input-field"
                      placeholder="@handle"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-2 text-sm">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleCancel} className="btn-secondary py-2 text-sm">
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-gray-600">
                  {profile?.bio || 'No bio yet. Click Edit Profile to tell the community about yourself!'}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  {profile?.currentCity && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {profile.currentCity}
                    </span>
                  )}
                  {profile?.countryOrigin && (
                    <span className="flex items-center gap-1.5">
                      From {profile.countryOrigin}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-3">
                  {profile?.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin.startsWith('http') ? profile.socialLinks.linkedin : `https://${profile.socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-blue-700"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {profile?.socialLinks?.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-pink-500"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{posts.length}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{friends.length}</p>
              <p className="text-xs text-gray-500">Conexiones</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-teal-600">${totalDonated.toFixed(0)}</p>
              <p className="text-xs text-gray-500">Total Impact</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'border-terracotta-500 text-terracotta-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="py-12 text-center text-gray-500">No posts yet. Share something with the community!</p>
            ) : (
              posts.map((post) => {
                const createdAt = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
                const postAvatar = post.authorPhoto || avatarUrl;
                return (
                  <article key={post.id} className="card p-5">
                    <div className="flex items-start gap-3">
                      <img src={postAvatar} alt="" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
                        <p className="text-xs text-gray-400">{timeAgo(createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">{post.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                      <span>{post.likeCount} likes</span>
                      <span>{post.commentCount} comments</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {friends.length === 0 ? (
              <p className="py-12 text-center text-gray-500 col-span-2">No connections yet. Start connecting with the community!</p>
            ) : (
              friends.map((f) => {
                const isRequester = f.requesterId === user?.uid;
                const friendName = isRequester ? f.receiverName : f.requesterName;
                const friendPhoto = isRequester ? f.receiverPhoto : f.requesterPhoto;
                const friendAvatar = friendPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(friendName)}&background=0D9488&color=fff&size=200`;
                return (
                  <div key={f.id} className="card flex items-center gap-4 p-4">
                    <img
                      src={friendAvatar}
                      alt={friendName}
                      className="h-12 w-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{friendName}</p>
                    </div>
                    <button className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100">
                      <MessageCircle className="mr-1 inline h-3 w-3" />
                      Message
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Impact summary */}
            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Tu Impacto
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-teal-50 p-4 text-center">
                  <p className="text-2xl font-bold text-teal-600">${totalDonated.toFixed(0)}</p>
                  <p className="text-xs text-teal-600/70">Total Donated</p>
                </div>
                <div className="rounded-xl bg-terracotta-50 p-4 text-center">
                  <p className="text-2xl font-bold text-terracotta-600">{uniqueBusinesses}</p>
                  <p className="text-xs text-terracotta-600/70">Businesses Backed</p>
                </div>
                <div className="rounded-xl bg-gold-100 p-4 text-center">
                  <p className="text-2xl font-bold text-gold-600">{transactions.length}</p>
                  <p className="text-xs text-gold-600/70">Transactions</p>
                </div>
              </div>
            </div>

            {/* Transaction list */}
            <div>
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Historial de contribuciones
              </h3>
              <div className="mt-4 space-y-3">
                {transactions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No contributions yet. Visit the Marketplace to support a business!</p>
                ) : (
                  transactions.map((tx) => {
                    const createdAt = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date();
                    return (
                      <div key={tx.id} className="card flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-50">
                          <TrendingUp className="h-5 w-5 text-terracotta-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{tx.businessName}</p>
                          <p className="text-xs text-gray-400">{tx.type} - {timeAgo(createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-teal-600">${tx.amountUsdc.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{tx.status}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

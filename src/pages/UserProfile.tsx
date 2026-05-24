import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Edit3,
  Save,
  X,
  Users,
  Newspaper,
  Linkedin,
  Instagram,
  MessageCircle,
  UserPlus,
  Check,
  Award,
  Phone,
  Mail,
  Send as SendIcon,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Camera,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import {
  getUserProfile, updateUserProfile, createUserProfile,
  onPosts, onFriendships, onPendingRequests, acceptFriendRequest,
  onUserTransactions, onUserBadges, uploadImage,
  UserProfile as UserProfileType,
  Post, Friendship, LRTransaction, DonationBadge,
} from '../lib/firestore';
import { BadgeGrid } from '../components/ContributionBadge';

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

type Tab = 'posts' | 'connections' | 'badges';

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
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [socialVisibility, setSocialVisibility] = useState<{
    email?: boolean;
    phone?: boolean;
    linkedin?: boolean;
    instagram?: boolean;
    x?: boolean;
    telegram?: boolean;
    website?: boolean;
  }>({});
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  // Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [transactions, setTransactions] = useState<LRTransaction[]>([]);
  const [badges, setBadges] = useState<DonationBadge[]>([]);

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
        setPhone((p as any).phone || '');
        setTelegram((p as any).telegram || p.socialLinks?.telegram || '');
        setDisplayEmail((p as any).displayEmail || '');
        setWebsite((p as any).website || '');
        setSocialVisibility((p as any).socialVisibility || {});
        setBannerUrl((p as any).bannerUrl || '');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubBadges = onUserBadges(user.uid, setBadges);
    const unsubs = [
      onPosts((allPosts) => {
        setPosts(allPosts.filter((p) => p.authorId === user.uid));
      }),
      onFriendships(user.uid, setFriends),
      onPendingRequests(user.uid, setPendingRequests),
      onUserTransactions(user.uid, setTransactions),
    ];
    return () => {
      unsubBadges();
      unsubs.forEach((u) => u());
    };
  }, [user]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';
    setUploadingBanner(true);
    try {
      const url = await uploadImage(file, `avatars/${user.uid}/banner`);
      setBannerUrl(url);
      await updateUserProfile(user.uid, { bannerUrl: url } as any);
    } catch (err) {
      console.error('Banner upload failed:', err);
    }
    setUploadingBanner(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        bio,
        countryOrigin,
        currentCity,
        phone,
        telegram,
        displayEmail,
        website,
        socialVisibility,
        socialLinks: {
          linkedin: socialLinkedin || '',
          instagram: socialInstagram || '',
          x: socialX || '',
          telegram: telegram || '',
        },
      } as any);
      setProfile((prev) => prev ? {
        ...prev,
        bio,
        countryOrigin,
        currentCity,
        phone,
        telegram,
        displayEmail,
        website,
        socialVisibility,
        socialLinks: {
          linkedin: socialLinkedin,
          instagram: socialInstagram,
          x: socialX,
          telegram,
        },
      } as any : prev);
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
      setPhone((profile as any).phone || '');
      setTelegram((profile as any).telegram || profile.socialLinks?.telegram || '');
      setDisplayEmail((profile as any).displayEmail || '');
      setWebsite((profile as any).website || '');
      setSocialVisibility((profile as any).socialVisibility || {});
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

  const toggleVisibility = (field: keyof typeof socialVisibility) => {
    setSocialVisibility((prev) => ({ ...prev, [field]: prev[field] === false ? true : false }));
  };

  const totalDonated = transactions.reduce((sum, tx) => sum + tx.amountUsdc, 0);
  const uniqueBusinesses = new Set(transactions.map((tx) => tx.businessId)).size;

  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || '?')}&background=C2652A&color=fff&size=200`;

  const myPostCount = posts.filter((p) => p.authorId === user?.uid).length;
  const donationCount = (profile as any)?.donationCount ?? transactions.length;

  const tabs = [
    { key: 'posts' as const, label: 'Mis Posts', icon: Newspaper, count: myPostCount },
    { key: 'connections' as const, label: 'Conexiones', icon: Users, count: friends.length },
    { key: 'badges' as const, label: 'Insignias', icon: Award, count: badges.length },
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
        {/* Banner — click camera to upload */}
        <div className="relative h-36 sm:h-44 group">
          <div
            className="h-full w-full"
            style={bannerUrl
              ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: 'linear-gradient(135deg, #7B2D1A 0%, #C2652A 38%, #D4845A 52%, #0D9488 78%, #064E3B 100%)' }
            }
          />
          <button
            onClick={() => bannerFileRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-60"
          >
            {uploadingBanner
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Camera className="h-3.5 w-3.5" />
            }
            {uploadingBanner ? 'Subiendo...' : 'Cambiar banner'}
          </button>
          <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
        </div>

        <div className="relative z-10 px-6 pb-6">
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

          {/* Stats bar */}
          <div className="mt-5 flex gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{myPostCount}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{friends.length}</p>
              <p className="text-xs text-gray-500">Conexiones</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-teal-600">{donationCount}</p>
              <p className="text-xs text-gray-500">Donaciones</p>
            </div>
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

                {/* Social links with visibility toggles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* LinkedIn */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={socialLinkedin}
                        onChange={(e) => setSocialLinkedin(e.target.value)}
                        className="input-field flex-1"
                        placeholder="linkedin.com/in/..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('linkedin')}
                        className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={socialVisibility.linkedin === false ? 'Oculto — clic para mostrar' : 'Visible — clic para ocultar'}
                      >
                        {socialVisibility.linkedin === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Instagram className="h-3.5 w-3.5" /> Instagram
                    </label>
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      className="input-field"
                      placeholder="@handle"
                    />
                  </div>

                  {/* X (Twitter) */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                      X (Twitter)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={socialX}
                        onChange={(e) => setSocialX(e.target.value)}
                        className="input-field flex-1"
                        placeholder="@handle"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('x')}
                        className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={socialVisibility.x === false ? 'Oculto — clic para mostrar' : 'Visible — clic para ocultar'}
                      >
                        {socialVisibility.x === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Phone className="h-3.5 w-3.5" /> Teléfono
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field flex-1"
                        placeholder="+1 555 000 0000"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('phone')}
                        className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={socialVisibility.phone === false ? 'Oculto — clic para mostrar' : 'Visible — clic para ocultar'}
                      >
                        {socialVisibility.phone === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Telegram */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                      <SendIcon className="h-3.5 w-3.5" /> Telegram
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        className="input-field flex-1"
                        placeholder="@handle"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('telegram')}
                        className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={socialVisibility.telegram === false ? 'Oculto — clic para mostrar' : 'Visible — clic para ocultar'}
                      >
                        {socialVisibility.telegram === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Display email */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Mail className="h-3.5 w-3.5" /> Email de contacto
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={displayEmail}
                        onChange={(e) => setDisplayEmail(e.target.value)}
                        className="input-field flex-1"
                        placeholder="email@ejemplo.com"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('email')}
                        className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={socialVisibility.email === false ? 'Oculto — clic para mostrar' : 'Visible — clic para ocultar'}
                      >
                        {socialVisibility.email === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Globe className="h-3.5 w-3.5" /> Sitio web
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="input-field flex-1"
                        placeholder="tusitio.com"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('website')}
                        className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={socialVisibility.website === false ? 'Oculto — clic para mostrar' : 'Visible — clic para ocultar'}
                      >
                        {socialVisibility.website === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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

                {/* Contact links — always visible to self, lock = hidden from others */}
                {(() => {
                  const sv = (profile as any)?.socialVisibility || {};
                  const profilePhone = (profile as any)?.phone;
                  const profileTelegram = (profile as any)?.telegram || profile?.socialLinks?.telegram;
                  const profileDisplayEmail = (profile as any)?.displayEmail;
                  const profileWebsite = (profile as any)?.website;
                  const linkedinRaw = profile?.socialLinks?.linkedin || '';
                  const xRaw = profile?.socialLinks?.x || '';
                  const igRaw = profile?.socialLinks?.instagram || '';

                  const items = [
                    profileDisplayEmail && sv.email !== false && {
                      href: `mailto:${profileDisplayEmail}`,
                      icon: <Mail className="h-3.5 w-3.5" />,
                      label: profileDisplayEmail,
                      external: false,
                    },
                    profilePhone && sv.phone !== false && {
                      href: `tel:${profilePhone}`,
                      icon: <Phone className="h-3.5 w-3.5" />,
                      label: profilePhone,
                      external: false,
                    },
                    linkedinRaw && sv.linkedin !== false && {
                      href: linkedinRaw.startsWith('http') ? linkedinRaw : `https://${linkedinRaw}`,
                      icon: <Linkedin className="h-3.5 w-3.5" />,
                      label: 'LinkedIn',
                      external: true,
                    },
                    xRaw && sv.x !== false && {
                      href: xRaw.startsWith('http') ? xRaw : `https://x.com/${xRaw.replace('@', '')}`,
                      icon: <span className="font-bold text-[11px]">𝕏</span>,
                      label: xRaw.startsWith('http') ? xRaw.split('/').pop() || 'X' : xRaw,
                      external: true,
                    },
                    profileTelegram && sv.telegram !== false && {
                      href: profileTelegram.startsWith('http') ? profileTelegram : `https://t.me/${profileTelegram.replace('@', '')}`,
                      icon: <SendIcon className="h-3.5 w-3.5" />,
                      label: profileTelegram,
                      external: true,
                    },
                    igRaw && sv.instagram !== false && {
                      href: `https://instagram.com/${igRaw.replace('@', '')}`,
                      icon: <Instagram className="h-3.5 w-3.5" />,
                      label: igRaw,
                      external: true,
                    },
                    profileWebsite && sv.website !== false && {
                      href: profileWebsite.startsWith('http') ? profileWebsite : `https://${profileWebsite}`,
                      icon: <Globe className="h-3.5 w-3.5" />,
                      label: profileWebsite.replace(/^https?:\/\//, ''),
                      external: true,
                    },
                  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string; external: boolean }[];

                  if (!items.length) return null;
                  return (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Contacto</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, i) => (
                          <a
                            key={i}
                            href={item.href}
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </>
            )}
          </div>

          {/* Impact stats row */}
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

        {activeTab === 'badges' && (
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

            {/* Badges */}
            <div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
                Insignias Ganadas
              </h3>
              <BadgeGrid badges={badges} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  Check,
  Users,
  DollarSign,
  X,
  MapPin,
  Mail,
  Phone,
  Globe,
  MessageCircle,
  Sparkles,
  Send,
  Loader2,
  Pencil,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import {
  getBusiness,
  createTransaction,
  createPost,
  getBusinessMembers,
  onBusinessTransactions,
  onBusinessPosts,
  getOrCreateBusinessConversation,
  hasFavoritedBusiness,
  toggleFavoriteBusiness,
  Business,
  UserProfile,
  Post,
  LRTransaction,
} from '../lib/firestore';
import FundingProgress from '../components/FundingProgress';

type Tab = 'feed' | 'about' | 'members';

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts) return '';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date();
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function avatarUrl(name: string, photo?: string | null, size = 40): string {
  if (photo) return photo;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=C2652A&color=fff&bold=true`;
}

// ── main component ────────────────────────────────────────────────────────────

export default function BusinessProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // core state
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  // real-time data
  const [transactions, setTransactions] = useState<LRTransaction[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);

  // compose box
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  // donate modal
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [donating, setDonating] = useState(false);

  // message button
  const [messagingLoading, setMessagingLoading] = useState(false);

  // liked posts local state
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // share / favorite state
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const composeRef = useRef<HTMLTextAreaElement>(null);

  // ── load business once ──
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const biz = await getBusiness(id);
      if (!cancelled) {
        setBusiness(biz);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // ── real-time transactions ──
  useEffect(() => {
    if (!id) return;
    const unsub = onBusinessTransactions(id, (txs) => setTransactions(txs));
    return unsub;
  }, [id]);

  // ── real-time posts ──
  useEffect(() => {
    if (!id) return;
    const unsub = onBusinessPosts(id, (p) => setPosts(p));
    return unsub;
  }, [id]);

  // ── load members when tab opens ──
  useEffect(() => {
    if (activeTab !== 'members' || !business) return;
    (async () => {
      const list = await getBusinessMembers(business.memberIds || []);
      setMembers(list);
    })();
  }, [activeTab, business]);

  // ── check favorite status on mount ──
  useEffect(() => {
    if (!id) return;
    hasFavoritedBusiness(id).then(setFavorited).catch(() => {});
  }, [id]);

  // ── handlers ──
  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0 || !user || !business) return;
    setDonating(true);
    try {
      await createTransaction({
        backerId: user.uid,
        backerName: user.displayName || 'Anónimo',
        recipientId: business.founderId,
        businessId: business.id,
        businessName: business.name,
        businessLogoUrl: business.logoUrl,
        amountUsdc: parseFloat(donateAmount),
        type: 'donation',
      });
      setDonateSuccess(true);
      const updated = await getBusiness(business.id);
      if (updated) setBusiness(updated);
      setTimeout(() => {
        setShowDonateModal(false);
        setDonateSuccess(false);
        setDonateAmount('');
      }, 3000);
    } catch (err) {
      console.error('Donation failed:', err);
    }
    setDonating(false);
  };

  const handlePost = async () => {
    if (!postContent.trim() || !business) return;
    setPosting(true);
    try {
      await createPost({ content: postContent.trim(), businessId: business.id });
      setPostContent('');
    } catch (err) {
      console.error('Post failed:', err);
    }
    setPosting(false);
  };

  const handleMessage = async () => {
    if (!user || !business) return;
    setMessagingLoading(true);
    try {
      await getOrCreateBusinessConversation(
        business.id,
        business.name,
        business.logoUrl,
        business.founderId,
        business.founderName,
        business.logoUrl,
      );
      navigate('/messages');
    } catch (err) {
      console.error('Messaging failed:', err);
    }
    setMessagingLoading(false);
  };

  const toggleLikePost = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleFavorite = async () => {
    if (!id) return;
    const next = !favorited;
    setFavorited(next);
    try {
      await toggleFavoriteBusiness(id);
    } catch (err) {
      setFavorited(!next); // revert on error
      console.error('Favorite toggle failed:', err);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250];

  // ── derived ──
  const coverUrl = business?.coverPhotoUrl
    || (business?.galleryUrls?.length ? business.galleryUrls[0] : null)
    || business?.logoUrl
    || '';

  const isOwner = !!(user && business && user.uid === business.founderId);
  const recentSupporters = transactions.slice(0, 5);

  // ── loading / not found ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-terracotta-500" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 gap-4">
        <p className="text-lg font-medium text-gray-900">Negocio no encontrado</p>
        <Link to="/marketplace" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Volver al Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* ── Back link ── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Marketplace
        </Link>
      </div>

      {/* ── Template banner ── */}
      {business.isTemplate && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-xl bg-gold-100 p-4 text-gold-700">
            <Sparkles className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Este es un negocio de ejemplo</p>
              <p className="text-xs">
                ¿Quieres ver tu negocio aquí?{' '}
                <Link to="/create-business" className="underline font-medium">
                  ¡Regístralo ahora!
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Cover photo ── */}
      <div className="relative mt-4 h-[400px] w-full overflow-hidden">
        <img
          src={coverUrl}
          alt={business.name}
          className="h-full w-full object-cover"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* ── Profile section (logo overlapping cover) ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-10 flex items-end gap-5">
          {/* Logo circle overlapping cover */}
          <div className="relative z-10 flex-shrink-0">
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
            />
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1 pb-2">
            <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl leading-tight">
              {business.name}
            </h1>
            {business.tagline && (
              <p className="mt-0.5 text-base text-gray-500">{business.tagline}</p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {business.category && (
                <span className="badge bg-terracotta-50 text-terracotta-600">
                  {business.category}
                </span>
              )}
              {business.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {business.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Fundado por {business.founderName}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex items-center gap-2 pb-2">
            <button
              onClick={() => setShowDonateModal(true)}
              className="btn-teal px-5 py-2.5 text-sm"
            >
              <Heart className="h-4 w-4" />
              Apoyar
            </button>

            {isOwner && (
              <Link
                to={`/edit-business/${business.id}`}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            )}

            {user && !isOwner && (
              <button
                onClick={handleMessage}
                disabled={messagingLoading}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                {messagingLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <MessageCircle className="h-4 w-4" />
                }
                Mensaje
              </button>
            )}

            <button
              onClick={handleFavorite}
              title={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                favorited
                  ? 'bg-terracotta-50 text-terracotta-500'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-terracotta-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${favorited ? 'fill-terracotta-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              title={copied ? '¡Copiado!' : 'Copiar enlace'}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                copied
                  ? 'bg-teal-50 text-teal-500'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-teal-500'
              }`}
            >
              {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-6 border-b border-gray-200">
          <div className="flex gap-8">
            {(['feed', 'about', 'members'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-terracotta-500 text-terracotta-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'feed' ? 'Feed' : tab === 'about' ? 'Sobre' : 'Miembros'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="mt-8 grid grid-cols-1 gap-8 pb-16 lg:grid-cols-3">
          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ─── TAB: FEED ─── */}
            {activeTab === 'feed' && (
              <>
                {/* Compose box (owner only) */}
                {isOwner && (
                  <div className="card p-5">
                    <div className="flex gap-3">
                      <img
                        src={avatarUrl(user?.displayName || 'U', user?.photoURL, 40)}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          ref={composeRef}
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="Comparte una actualización..."
                          rows={3}
                          className="input-field resize-none"
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={handlePost}
                            disabled={!postContent.trim() || posting}
                            className="btn-teal px-5 py-2 text-sm disabled:opacity-40"
                          >
                            {posting
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Send className="h-4 w-4" />
                            }
                            Publicar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts list */}
                {posts.length === 0 ? (
                  <div className="card p-12 text-center">
                    <p className="text-gray-400 text-sm">No hay actualizaciones aún</p>
                  </div>
                ) : (
                  posts.map((post) => {
                    const liked = likedPosts.has(post.id);
                    return (
                      <article key={post.id} className="card overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <img
                              src={avatarUrl(post.authorName, post.authorPhoto, 44)}
                              alt={post.authorName}
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-white flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {post.authorName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {timeAgo(post.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                            {post.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 border-t border-gray-50 px-5 py-3">
                          <button
                            onClick={() => toggleLikePost(post.id)}
                            className={`flex items-center gap-1.5 text-sm transition-colors ${
                              liked
                                ? 'text-terracotta-500'
                                : 'text-gray-400 hover:text-terracotta-500'
                            }`}
                          >
                            <Heart
                              className={`h-[18px] w-[18px] ${liked ? 'fill-terracotta-500' : ''}`}
                            />
                            <span className="font-medium">
                              {post.likeCount + (liked ? 1 : 0)}
                            </span>
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </>
            )}

            {/* ─── TAB: SOBRE ─── */}
            {activeTab === 'about' && (
              <div className="card p-6 space-y-5">
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                  {business.description}
                </p>

                {/* Contact / location details */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {business.location && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-terracotta-400 flex-shrink-0" />
                      <span>{business.location}</span>
                    </div>
                  )}
                  {business.contactEmail && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-terracotta-400 flex-shrink-0" />
                      <a
                        href={`mailto:${business.contactEmail}`}
                        className="hover:text-terracotta-600 transition-colors"
                      >
                        {business.contactEmail}
                      </a>
                    </div>
                  )}
                  {business.contactPhone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-terracotta-400 flex-shrink-0" />
                      <span>{business.contactPhone}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Globe className="h-4 w-4 text-terracotta-400 flex-shrink-0" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-terracotta-600 transition-colors truncate"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB: MIEMBROS ─── */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Founder card (always first) */}
                <div className="card p-5 flex gap-4">
                  <img
                    src={avatarUrl(business.founderName, null, 56)}
                    alt={business.founderName}
                    className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{business.founderName}</p>
                    <p className="text-xs font-medium text-terracotta-500 mb-1">Fundador/a</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Apasionado/a por construir {business.name} y hacer una diferencia en la comunidad Latina.
                    </p>
                  </div>
                </div>

                {/* Additional members */}
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.uid} className="card p-5 flex gap-4">
                      <img
                        src={avatarUrl(member.displayName, member.photoURL, 56)}
                        alt={member.displayName}
                        className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{member.displayName}</p>
                        {member.bio && (
                          <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {member.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Solo el fundador/a por ahora
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1">
            <div className="card sticky top-24 p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Apoyar la Comunidad
              </h2>

              {/* Funding progress */}
              <FundingProgress
                raised={business.amountRaisedUsdc}
                goal={business.fundingGoalUsdc}
                backers={business.backerCount}
              />

              {/* Donate button */}
              <button
                onClick={() => setShowDonateModal(true)}
                className="btn-teal w-full py-3.5"
              >
                <Heart className="h-4 w-4" />
                Apoyar / Donar
              </button>

              {/* Recent supporters */}
              {recentSupporters.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                    Apoyadores recientes
                  </p>
                  <ul className="space-y-2.5">
                    {recentSupporters.map((tx) => (
                      <li key={tx.id} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <img
                          src={avatarUrl(tx.backerName, (tx as any).backerPhoto, 32)}
                          alt={tx.backerName}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="flex-1 min-w-0 truncate">
                          <span className="font-medium text-teal-600">${tx.amountUsdc}</span>
                          {' · '}
                          <span>{tx.backerName}</span>
                          {' · '}
                          <span className="text-gray-400">{timeAgo(tx.createdAt)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Donate Modal ── */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6">
            {donateSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                  <Heart className="h-8 w-8 fill-teal-400 text-teal-500" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-gray-900">
                  ¡Gracias por tu apoyo!
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Tu donación de ${donateAmount} USDC ha sido registrada.
                </p>
                <p className="mt-2 text-sm font-medium text-teal-600">
                  Has ganado una insignia de {business.name}!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-gray-900">
                    Donar a {business.name}
                  </h3>
                  <button
                    onClick={() => { setShowDonateModal(false); setDonateAmount(''); }}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Tu donación va directamente al negocio para apoyar a la comunidad.
                </p>

                {/* Quick amounts */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setDonateAmount(amt.toString())}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                        donateAmount === amt.toString()
                          ? 'bg-teal-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Monto personalizado (USDC)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(e.target.value)}
                      placeholder="0.00"
                      className="input-field pl-10"
                      min="1"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDonate}
                  disabled={!donateAmount || parseFloat(donateAmount) <= 0 || donating}
                  className="btn-teal mt-5 w-full py-3.5 disabled:opacity-40"
                >
                  {donating
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
                    : <><Heart className="h-4 w-4" /> Confirmar Donación</>
                  }
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

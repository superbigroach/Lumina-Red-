import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, TrendingUp, Heart, MessageCircle, Share2, ChevronDown, ChevronUp, Video, Image as ImageIcon, X as XIcon, Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, startAfter, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useWallet } from '../lib/WalletContext';
import WalletButton from '../components/WalletButton';
import {
  createPost, toggleLike, hasLiked,
  onComments, addComment, uploadImage, getUserProfile,
  Post, Comment as FirestoreComment,
} from '../lib/firestore';

const PAGE_SIZE = 15;

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

function getMediaType(url: string): 'youtube' | 'video' | 'image' {
  if (/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/.test(url)) return 'youtube';
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return 'video';
  return 'image';
}

function getYouTubeId(url: string): string {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

function MediaItem({ url }: { url: string }) {
  const type = getMediaType(url);
  if (type === 'youtube') {
    const id = getYouTubeId(url);
    return id ? (
      <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    ) : null;
  }
  if (type === 'video') {
    return (
      <video controls className="w-full rounded-xl max-h-96 bg-black" preload="metadata">
        <source src={url} />
      </video>
    );
  }
  return <img src={url} alt="" className="w-full rounded-xl object-cover max-h-80" loading="lazy" />;
}

function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FirestoreComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    setLikeCount(post.likeCount);
  }, [post.likeCount]);

  useEffect(() => {
    let cancelled = false;
    hasLiked(post.id).then((result) => {
      if (!cancelled) setLiked(result);
    });
    return () => { cancelled = true; };
  }, [post.id]);

  useEffect(() => {
    if (!showComments) return;
    const unsub = onComments(post.id, setComments);
    return unsub;
  }, [post.id, showComments]);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => wasLiked ? prev - 1 : prev + 1);
    try {
      await toggleLike(post.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await addComment(post.id, commentText.trim());
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
    setSubmittingComment(false);
  };

  const createdAt = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
  const avatarUrl = post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=C2652A&color=fff&size=200`;

  return (
    <article className="card overflow-hidden">
      <div className="p-5">
        {/* Author header */}
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.authorId}`} className="flex-shrink-0">
            <img
              src={avatarUrl}
              alt={post.authorName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white hover:opacity-90 transition-opacity"
              referrerPolicy="no-referrer"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${post.authorId}`} className="text-sm font-semibold text-gray-900 hover:text-terracotta-600 transition-colors">
              {post.authorName}
            </Link>
            <p className="text-xs text-gray-400">{timeAgo(createdAt)}</p>
          </div>
        </div>

        {/* Content */}
        <p className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
          {post.content}
        </p>

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.mediaUrls.map((url, i) => (
              <MediaItem key={i} url={url} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 border-t border-gray-50 px-5 py-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-terracotta-500' : 'text-gray-400 hover:text-terracotta-500'
          }`}
        >
          <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-terracotta-500' : ''}`} />
          <span className="font-medium">{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-teal-500"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="font-medium">{post.commentCount}</span>
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-teal-500">
          <Share2 className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => {
            const cAvatar = c.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName)}&background=0D9488&color=fff&size=100`;
            const cTime = c.createdAt?.toDate ? c.createdAt.toDate() : new Date();
            return (
              <div key={c.id} className="flex gap-2">
                <img src={cAvatar} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{c.authorName}</span>
                    <span className="text-xs text-gray-400">{timeAgo(cTime)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{c.content}</p>
                </div>
              </div>
            );
          })}

          {/* Comment input */}
          {user && (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submittingComment}
                className="rounded-lg bg-teal-500 px-3 py-2 text-white transition-colors hover:bg-teal-600 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

const trendingTopics = [
  { tag: '#CommunityFunding', count: 234 },
  { tag: '#LatinoEntrepreneurs', count: 189 },
  { tag: '#SaborDeCasa', count: 156 },
  { tag: '#NexoTech', count: 112 },
  { tag: '#FuerzaFitness', count: 89 },
];


export default function Feed() {
  const { user } = useAuth();
  const { usdcBalance } = useWallet();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [posting, setPosting] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; file?: File; uploading?: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      if (cancelled) return;
      const initial = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      setPosts(initial);
      setLastVisible(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);

      // Real-time listener for NEW posts only (createdAt > now)
      const now = Timestamp.now();
      const newPostsQ = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        where('createdAt', '>', now)
      );
      const unsub = onSnapshot(newPostsQ, (newSnap) => {
        const newPosts = newSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
        if (newPosts.length > 0) {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const truly = newPosts.filter(p => !existingIds.has(p.id));
            if (truly.length > 0) {
              setNewPostCount(c => c + truly.length);
              return [...truly, ...prev];
            }
            return prev;
          });
        }
      });
      return unsub;
    }

    let cleanup: (() => void) | undefined;
    loadInitial().then(unsub => { cleanup = unsub; });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const loadMore = async () => {
    if (!lastVisible || loadingMore) return;
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
        startAfter(lastVisible)
      );
      const snap = await getDocs(q);
      const more = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...more.filter(p => !existingIds.has(p.id))];
      });
      setLastVisible(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';
    const newPreviews = files.map((file) => ({ url: URL.createObjectURL(file), file, uploading: true }));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
    for (const preview of newPreviews) {
      try {
        const path = `posts/${user!.uid}/${Date.now()}-${preview.file!.name}`;
        const downloadUrl = await uploadImage(preview.file!, path);
        setMediaPreviews((prev) =>
          prev.map((p) => p.url === preview.url ? { url: downloadUrl, uploading: false } : p)
        );
      } catch (err) {
        console.error('Upload failed:', err);
        setMediaPreviews((prev) => prev.filter((p) => p.url !== preview.url));
      }
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !mediaPreviews.length) return;
    const stillUploading = mediaPreviews.some((p) => p.uploading);
    if (stillUploading) return;
    setPosting(true);
    try {
      const uploadedUrls = mediaPreviews.map((p) => p.url);
      if (videoUrl.trim()) uploadedUrls.push(videoUrl.trim());
      await createPost({ content: newPost.trim(), mediaUrls: uploadedUrls });
      setNewPost('');
      setVideoUrl('');
      setShowVideoInput(false);
      setMediaPreviews([]);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
    setPosting(false);
  };

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => {
      if (p && (p as any).bannerUrl) setBannerUrl((p as any).bannerUrl);
    });
  }, [user]);

  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || '?')}&background=C2652A&color=fff&size=200`;
  const balanceNum = parseFloat(usdcBalance) || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left sidebar -- profile card */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="card overflow-hidden">
            <div
              className="h-20"
              style={bannerUrl
                ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: 'linear-gradient(135deg, #7B2D1A 0%, #C2652A 38%, #D4845A 60%, #0D9488 100%)' }
              }
            />
            <div className="px-5 pb-5">
              <img
                src={avatarUrl}
                alt={user?.displayName || 'User'}
                className="-mt-8 h-16 w-16 rounded-full border-4 border-white object-cover"
                referrerPolicy="no-referrer"
              />
              <h3 className="mt-2 font-semibold text-gray-900">{user?.displayName || 'Anonymous'}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-4">
            <WalletButton balance={balanceNum} />
          </div>
        </aside>

        {/* Main feed */}
        <main className="lg:col-span-6">
          {/* Compose */}
          <div className="card p-5">
            <div className="flex gap-3">
              <img
                src={avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share something with la comunidad..."
                  className="w-full resize-none rounded-xl border-0 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500/20"
                  rows={3}
                />
                {/* Media previews */}
                {mediaPreviews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mediaPreviews.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p.url} alt="" className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
                        {p.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          </div>
                        )}
                        {!p.uploading && (
                          <button
                            onClick={() => setMediaPreviews((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-red-500"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showVideoInput && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Pega URL de YouTube o .mp4..."
                      className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                    <button onClick={() => { setShowVideoInput(false); setVideoUrl(''); }} className="text-gray-400 hover:text-gray-600">
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-terracotta-500"
                      title="Añadir imagen o video"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowVideoInput(!showVideoInput)}
                      className={`rounded-lg p-2 transition-colors hover:bg-gray-50 ${showVideoInput ? 'text-teal-500' : 'text-gray-400 hover:text-teal-500'}`}
                      title="Añadir URL de video"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={(!newPost.trim() && !mediaPreviews.length) || posting || mediaPreviews.some((p) => p.uploading)}
                    className="btn-primary py-2 text-sm disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    {posting ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* New posts notification banner */}
          {newPostCount > 0 && (
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setNewPostCount(0); }}
              className="mt-4 w-full text-center bg-teal-500 text-white text-sm py-2 rounded-xl"
            >
              {newPostCount} nueva{newPostCount > 1 ? 's' : ''} publicaci{newPostCount > 1 ? 'ones' : 'on'}
            </button>
          )}

          {/* Posts */}
          <div className="mt-6 space-y-6">
            {posts.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-lg font-medium text-gray-900">Be the first to share something with la comunidad!</p>
                <p className="mt-2 text-sm text-gray-500">Write a post above to get the conversation started.</p>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}

            {/* Load More / End of feed */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-secondary px-8 py-2.5 disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más'
                  )}
                </button>
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-center text-sm text-gray-400 py-6">Has llegado al final del feed</p>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:col-span-3 lg:block">
          {/* Trending */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <TrendingUp className="h-4 w-4 text-terracotta-500" />
              Trending en la Red
            </div>
            <div className="mt-4 space-y-3">
              {trendingTopics.map((topic) => (
                <div key={topic.tag} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-teal-600 hover:text-teal-700 cursor-pointer">
                    {topic.tag}
                  </span>
                  <span className="text-xs text-gray-400">{topic.count} posts</span>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

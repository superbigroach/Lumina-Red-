import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Loader2, Video, X as XIcon } from 'lucide-react';

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
        <iframe src={`https://www.youtube.com/embed/${id}`} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube video" />
      </div>
    ) : null;
  }
  if (type === 'video') {
    return <video controls className="w-full rounded-xl max-h-96 bg-black" preload="metadata"><source src={url} /></video>;
  }
  return <img src={url} alt="" className="w-full rounded-xl object-cover max-h-80" loading="lazy" />;
}
import { useAuth } from '../lib/AuthContext';
import {
  onBusinessPosts,
  createPost,
  toggleLike,
  hasLiked,
  addComment,
  onComments,
  type Post,
  type Comment,
} from '../lib/firestore';

interface BusinessFeedProps {
  businessId: string;
  businessName: string;
  businessLogoUrl: string;
  isOwner: boolean;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'justo ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function BusinessFeed({
  businessId,
  businessName,
  businessLogoUrl,
  isOwner,
}: BusinessFeedProps) {
  const { user } = useAuth();

  const [composeText, setComposeText] = useState('');
  const [posting, setPosting] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);

  // Per-post liked map: postId -> boolean
  const [likedMap, setLikedMap] = useState<Map<string, boolean>>(new Map());

  // Per-post like count overrides (optimistic): postId -> count
  const [likeCountMap, setLikeCountMap] = useState<Map<string, number>>(new Map());

  // Expanded comments: set of postIds with comments open
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Per-post comments: postId -> Comment[]
  const [commentsMap, setCommentsMap] = useState<Map<string, Comment[]>>(new Map());

  // Per-post comment input: postId -> string
  const [commentInputMap, setCommentInputMap] = useState<Map<string, string>>(new Map());

  // Per-post comment submitting flag
  const [commentSubmittingMap, setCommentSubmittingMap] = useState<Map<string, boolean>>(new Map());

  // Subscribe to business posts
  useEffect(() => {
    const unsub = onBusinessPosts(businessId, (incoming) => {
      setPosts(incoming);
      // Initialize like counts for any new posts (only if not already tracked)
      setLikeCountMap((prev) => {
        const next = new Map(prev);
        for (const p of incoming) {
          if (!next.has(p.id)) {
            next.set(p.id, p.likeCount);
          }
        }
        return next;
      });
      // Lazily load liked state for each post
      if (user) {
        for (const p of incoming) {
          hasLiked(p.id).then((liked) => {
            setLikedMap((prev) => {
              if (prev.get(p.id) === liked) return prev;
              const next = new Map(prev);
              next.set(p.id, liked);
              return next;
            });
          });
        }
      }
    });
    return unsub;
  }, [businessId, user]);

  // Subscribe to comments for expanded posts
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    for (const postId of expandedComments) {
      const unsub = onComments(postId, (incoming) => {
        setCommentsMap((prev) => {
          const next = new Map(prev);
          next.set(postId, incoming);
          return next;
        });
      });
      unsubscribers.push(unsub);
    }
    return () => {
      for (const unsub of unsubscribers) unsub();
    };
  }, [expandedComments]);

  // Handle compose submit
  async function handlePost() {
    const content = composeText.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      await createPost({ content, businessId, mediaUrls: videoUrl.trim() ? [videoUrl.trim()] : [] });
      setComposeText('');
      setVideoUrl('');
      setShowVideoInput(false);
    } finally {
      setPosting(false);
    }
  }

  // Handle like toggle
  async function handleLike(postId: string) {
    if (!user) return;
    const currentLiked = likedMap.get(postId) ?? false;
    const currentCount = likeCountMap.get(postId) ?? 0;

    // Optimistic update
    setLikedMap((prev) => {
      const next = new Map(prev);
      next.set(postId, !currentLiked);
      return next;
    });
    setLikeCountMap((prev) => {
      const next = new Map(prev);
      next.set(postId, currentLiked ? currentCount - 1 : currentCount + 1);
      return next;
    });

    try {
      await toggleLike(postId);
    } catch {
      // Revert on error
      setLikedMap((prev) => {
        const next = new Map(prev);
        next.set(postId, currentLiked);
        return next;
      });
      setLikeCountMap((prev) => {
        const next = new Map(prev);
        next.set(postId, currentCount);
        return next;
      });
    }
  }

  // Toggle comment section open/closed
  function toggleComments(postId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }

  // Handle comment submit
  async function handleAddComment(postId: string) {
    const content = (commentInputMap.get(postId) ?? '').trim();
    if (!content) return;
    setCommentSubmittingMap((prev) => new Map(prev).set(postId, true));
    try {
      await addComment(postId, content);
      setCommentInputMap((prev) => {
        const next = new Map(prev);
        next.set(postId, '');
        return next;
      });
    } finally {
      setCommentSubmittingMap((prev) => new Map(prev).set(postId, false));
    }
  }

  return (
    <div className="space-y-5">
      {/* Compose box — owner only */}
      {isOwner && (
        <div className="rounded-2xl bg-white ring-1 ring-gray-900/5 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <img
              src={businessLogoUrl}
              alt={businessName}
              className="h-10 w-10 rounded-full object-cover flex-shrink-0"
            />
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder={`Comparte una actualización de ${businessName}...`}
              rows={3}
              className="input-field resize-none flex-1"
            />
          </div>
          {showVideoInput && (
            <div className="mt-2 flex items-center gap-2 pl-[52px]">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube or .mp4 URL..."
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              <button onClick={() => { setShowVideoInput(false); setVideoUrl(''); }} className="text-gray-400 hover:text-gray-600">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between pl-[52px]">
            <button
              onClick={() => setShowVideoInput(!showVideoInput)}
              className={`rounded-lg p-2 transition-colors hover:bg-gray-50 ${showVideoInput ? 'text-teal-500' : 'text-gray-400 hover:text-teal-500'}`}
              title="Agregar video"
            >
              <Video className="h-5 w-5" />
            </button>
            <button
              onClick={handlePost}
              disabled={!composeText.trim() || posting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publicar
            </button>
          </div>
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-gray-500">
            No hay publicaciones aún. ¡Sé el primero en compartir!
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const liked = likedMap.get(post.id) ?? false;
          const likeCount = likeCountMap.get(post.id) ?? post.likeCount;
          const commentsOpen = expandedComments.has(post.id);
          const comments = commentsMap.get(post.id) ?? [];
          const commentInput = commentInputMap.get(post.id) ?? '';
          const commentSubmitting = commentSubmittingMap.get(post.id) ?? false;
          const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

          return (
            <article key={post.id} className="card p-5 space-y-3">
              {/* Author header */}
              <div className="flex items-center gap-3">
                <img
                  src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=C2652A&color=fff&size=80`}
                  alt={post.authorName}
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {post.authorName}
                  </p>
                  <p className="text-xs text-gray-400">{timeAgo(postDate)}</p>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {post.content}
              </p>

              {/* Media */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="space-y-2">
                  {post.mediaUrls.map((url, i) => (
                    <MediaItem key={i} url={url} />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-5 pt-1 border-t border-gray-50">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    liked
                      ? 'text-terracotta-500'
                      : 'text-gray-400 hover:text-terracotta-500'
                  }`}
                >
                  <Heart
                    className={`h-[18px] w-[18px] ${liked ? 'fill-terracotta-500' : ''}`}
                  />
                  <span className="font-medium">{likeCount}</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    commentsOpen
                      ? 'text-teal-600'
                      : 'text-gray-400 hover:text-teal-500'
                  }`}
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  <span className="font-medium">{post.commentCount}</span>
                </button>
              </div>

              {/* Comments section */}
              {commentsOpen && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {/* Existing comments */}
                  {comments.length > 0 ? (
                    <ul className="space-y-3">
                      {comments.map((c) => {
                        const cDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date();
                        return (
                          <li key={c.id} className="flex items-start gap-2">
                            <img
                              src={c.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName)}&background=0D9488&color=fff&size=60`}
                              alt={c.authorName}
                              className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-semibold text-gray-900">
                                  {c.authorName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {timeAgo(cDate)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {c.content}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-1">
                      Sin comentarios aún.
                    </p>
                  )}

                  {/* Comment input */}
                  {user && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) =>
                          setCommentInputMap((prev) =>
                            new Map(prev).set(post.id, e.target.value)
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Escribe un comentario..."
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInput.trim() || commentSubmitting}
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {commentSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}

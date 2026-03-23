import { useState, useEffect, useRef } from 'react';
import { Send, Smile, TrendingUp, Users, Calendar, Heart, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useWallet } from '../lib/WalletContext';
import WalletButton from '../components/WalletButton';
import {
  onPosts, createPost, toggleLike, hasLiked,
  onComments, addComment,
  Post, Comment as FirestoreComment,
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
          <img
            src={avatarUrl}
            alt={post.authorName}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
            <p className="text-xs text-gray-400">{timeAgo(createdAt)}</p>
          </div>
        </div>

        {/* Content */}
        <p className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
          {post.content}
        </p>

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: post.mediaUrls.length === 1 ? '1fr' : '1fr 1fr' }}>
            {post.mediaUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full rounded-xl object-cover max-h-80" loading="lazy" />
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

const upcomingEvents = [
  { title: 'Pitch Night Miami', date: 'Mar 28', attendees: 45 },
  { title: 'Legal Workshop (Free)', date: 'Mar 30', attendees: 120 },
  { title: 'Cafecito Networking', date: 'Apr 2', attendees: 32 },
];

export default function Feed() {
  const { user } = useAuth();
  const { usdcBalance } = useWallet();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const unsub = onPosts(setPosts);
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await createPost({ content: newPost.trim() });
      setNewPost('');
    } catch (err) {
      console.error('Failed to create post:', err);
    }
    setPosting(false);
  };

  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || '?')}&background=C2652A&color=fff&size=200`;
  const balanceNum = parseFloat(usdcBalance) || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left sidebar -- profile card */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="card overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-terracotta-400 via-terracotta-500 to-teal-500" />
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
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-terracotta-500">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim() || posting}
                    className="btn-primary py-2 text-sm disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    {posting ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

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

          {/* Events */}
          <div className="card mt-4 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Calendar className="h-4 w-4 text-teal-500" />
              Proximos Eventos
            </div>
            <div className="mt-4 space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.title}>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span>{event.date}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.attendees}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

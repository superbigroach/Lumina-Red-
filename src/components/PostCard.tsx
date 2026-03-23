import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import type { Post } from '../data/posts';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const formatNumber = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <article className="card overflow-hidden">
      <div className="p-5">
        {/* Author header */}
        <div className="flex items-start gap-3">
          <Link to={`/profile`}>
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/profile`}
                className="text-sm font-semibold text-gray-900 hover:text-terracotta-500 transition-colors"
              >
                {post.authorName}
              </Link>
              <span className="text-xs text-gray-400">{post.authorHandle}</span>
            </div>
            <p className="text-xs text-gray-400">{post.timestamp}</p>
          </div>
        </div>

        {/* Content */}
        <p className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={post.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-50 px-5 py-3">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? 'text-terracotta-500' : 'text-gray-400 hover:text-terracotta-500'
            }`}
          >
            <Heart
              className={`h-[18px] w-[18px] ${liked ? 'fill-terracotta-500' : ''}`}
            />
            <span className="font-medium">{formatNumber(likeCount)}</span>
          </button>

          <button className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-teal-500">
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="font-medium">{formatNumber(post.comments)}</span>
          </button>

          <button className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-teal-500">
            <Share2 className="h-[18px] w-[18px]" />
            <span className="font-medium">{formatNumber(post.shares)}</span>
          </button>
        </div>

        <button
          onClick={() => setSaved(!saved)}
          className={`transition-colors ${
            saved ? 'text-gold-400' : 'text-gray-300 hover:text-gold-400'
          }`}
        >
          <Bookmark className={`h-[18px] w-[18px] ${saved ? 'fill-gold-400' : ''}`} />
        </button>
      </div>
    </article>
  );
}

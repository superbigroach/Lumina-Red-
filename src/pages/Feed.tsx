import { useState } from 'react';
import { Image, Send, Smile, TrendingUp, Users, Calendar } from 'lucide-react';
import PostCard from '../components/PostCard';
import WalletButton from '../components/WalletButton';
import { posts } from '../data/posts';
import { users, currentUser } from '../data/users';

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
  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    if (newPost.trim()) {
      setNewPost('');
      // Mock — in production this would submit to backend
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left sidebar — profile card */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="card overflow-hidden">
            {/* Banner */}
            <div className="h-20 bg-gradient-to-r from-terracotta-400 via-terracotta-500 to-teal-500" />
            <div className="px-5 pb-5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="-mt-8 h-16 w-16 rounded-full border-4 border-white object-cover"
              />
              <h3 className="mt-2 font-semibold text-gray-900">{currentUser.name}</h3>
              <p className="text-xs text-gray-500">{currentUser.handle}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {currentUser.bio}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{currentUser.posts}</p>
                  <p className="text-xs text-gray-400">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{currentUser.connections}</p>
                  <p className="text-xs text-gray-400">Conexiones</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-teal-600">{currentUser.impactScore}</p>
                  <p className="text-xs text-gray-400">Impact</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet preview */}
          <div className="mt-4">
            <WalletButton balance={1247.50} />
          </div>
        </aside>

        {/* Main feed */}
        <main className="lg:col-span-6">
          {/* Compose */}
          <div className="card p-5">
            <div className="flex gap-3">
              <img
                src={currentUser.avatar}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
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
                      <Image className="h-5 w-5" />
                    </button>
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-terracotta-500">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="btn-primary py-2 text-sm disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="mt-6 space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
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
                <div
                  key={topic.tag}
                  className="flex items-center justify-between"
                >
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

          {/* Suggested connections */}
          <div className="card mt-4 p-5">
            <p className="text-sm font-semibold text-gray-900">Personas que conocer</p>
            <div className="mt-4 space-y-4">
              {users.slice(1, 4).map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">{user.skills[0]}</p>
                  </div>
                  <button className="rounded-lg bg-terracotta-50 px-3 py-1 text-xs font-medium text-terracotta-600 transition-colors hover:bg-terracotta-100">
                    Conectar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

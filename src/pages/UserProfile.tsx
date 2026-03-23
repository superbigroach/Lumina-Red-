import { useState } from 'react';
import {
  MapPin,
  Calendar,
  Edit3,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Save,
  X,
  TrendingUp,
  Users,
  Heart,
  Newspaper,
} from 'lucide-react';
import { currentUser } from '../data/users';
import { posts } from '../data/posts';
import { businesses } from '../data/businesses';
import PostCard from '../components/PostCard';

type Tab = 'posts' | 'connections' | 'portfolio';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(currentUser.bio);
  const [tempBio, setTempBio] = useState(currentUser.bio);

  const userPosts = posts.filter((p) => p.authorId === currentUser.id);
  const investedBusinesses = businesses.slice(0, 3); // Mock invested businesses

  const handleSave = () => {
    setBio(tempBio);
    setEditing(false);
  };

  const handleCancel = () => {
    setTempBio(bio);
    setEditing(false);
  };

  const tabs = [
    { key: 'posts' as const, label: 'Mis Posts', icon: Newspaper, count: userPosts.length },
    { key: 'connections' as const, label: 'Conexiones', icon: Users, count: currentUser.connections },
    { key: 'portfolio' as const, label: 'Impact & Portfolio', icon: TrendingUp, count: investedBusinesses.length },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-terracotta-400 via-terracotta-500 to-teal-500 sm:h-40" />

        <div className="px-6 pb-6">
          {/* Avatar + name row */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="-mt-12 h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg sm:-mt-14 sm:h-28 sm:w-28"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-gray-900">
                  {currentUser.name}
                </h1>
                <span className="badge bg-teal-50 text-teal-700">
                  Impact: {currentUser.impactScore.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500">{currentUser.handle}</p>
            </div>
            <button
              onClick={() => {
                setTempBio(bio);
                setEditing(true);
              }}
              className="btn-secondary py-2 text-sm"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="input-field"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-primary py-2 text-sm">
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn-secondary py-2 text-sm">
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-gray-600">{bio}</p>
            )}
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {currentUser.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {currentUser.joinedDate}
            </span>
            {currentUser.socials.website && (
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <a href="#" className="text-teal-600 hover:text-teal-700">
                  {currentUser.socials.website}
                </a>
              </span>
            )}
          </div>

          {/* Social links */}
          <div className="mt-3 flex gap-3">
            {currentUser.socials.instagram && (
              <a
                href="#"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-pink-500"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {currentUser.socials.twitter && (
              <a
                href="#"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-blue-500"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {currentUser.socials.linkedin && (
              <a
                href="#"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-blue-700"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
          </div>

          {/* Skills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {currentUser.skills.map((skill) => (
              <span
                key={skill}
                className="badge bg-terracotta-50 text-terracotta-600"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{currentUser.posts}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{currentUser.connections}</p>
              <p className="text-xs text-gray-500">Conexiones</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-teal-600">
                {currentUser.impactScore.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Impact Score</p>
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
          <div className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <p className="py-12 text-center text-gray-500">No posts yet. Share something with the community!</p>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { name: 'Carlos Mendoza', handle: '@carlosmendoza', bg: '0D9488', skill: 'Tech Founder' },
              { name: 'Maria Fernanda Lopez', handle: '@maferlop', bg: 'F59E0B', skill: 'Legal & Strategy' },
              { name: 'Diego Ramirez', handle: '@diegoram', bg: '7C3AED', skill: 'Design & Brand' },
              { name: 'Ana Castillo', handle: '@anacastillo', bg: 'EC4899', skill: 'Fitness & Wellness' },
              { name: 'Isabella Herrera', handle: '@isabellaherrera', bg: 'C2652A', skill: 'Coffee & Hospitality' },
              { name: 'Mateo Cruz', handle: '@mateocruz', bg: '0D9488', skill: 'Operations & Logistics' },
            ].map((conn) => (
              <div key={conn.handle} className="card flex items-center gap-4 p-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(conn.name)}&background=${conn.bg}&color=fff&size=200&bold=true`}
                  alt={conn.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{conn.name}</p>
                  <p className="text-xs text-gray-400">{conn.handle}</p>
                  <p className="text-xs text-gray-500">{conn.skill}</p>
                </div>
                <button className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100">
                  Message
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Impact summary */}
            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Tu Impacto
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-teal-50 p-4 text-center">
                  <p className="text-2xl font-bold text-teal-600">$475</p>
                  <p className="text-xs text-teal-600/70">Total Donated</p>
                </div>
                <div className="rounded-xl bg-terracotta-50 p-4 text-center">
                  <p className="text-2xl font-bold text-terracotta-600">3</p>
                  <p className="text-xs text-terracotta-600/70">Businesses Backed</p>
                </div>
                <div className="rounded-xl bg-gold-100 p-4 text-center">
                  <p className="text-2xl font-bold text-gold-600">12</p>
                  <p className="text-xs text-gold-600/70">Referrals Made</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">4.2k</p>
                  <p className="text-xs text-purple-600/70">Impact Score</p>
                </div>
              </div>
            </div>

            {/* Invested businesses */}
            <div>
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Negocios que apoyas
              </h3>
              <div className="mt-4 space-y-3">
                {investedBusinesses.map((biz) => (
                  <div key={biz.id} className="card flex items-center gap-4 p-4">
                    <img
                      src={biz.image}
                      alt={biz.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{biz.name}</p>
                      <p className="text-xs text-gray-500">{biz.category} - {biz.location}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{
                            width: `${(biz.fundingRaised / biz.fundingGoal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-teal-600">$150</p>
                      <p className="text-xs text-gray-400">contributed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Globe,
  ArrowLeft,
  Heart,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { businesses } from '../data/businesses';
import FundingProgress from '../components/FundingProgress';

type Tab = 'about' | 'founders' | 'updates';

export default function BusinessProfile() {
  const { id } = useParams();
  const business = businesses.find((b) => b.id === id);

  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [currentImage, setCurrentImage] = useState(0);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);

  if (!business) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-lg font-medium text-gray-900">Business not found</p>
        <Link to="/marketplace" className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const handleDonate = () => {
    if (donateAmount && parseFloat(donateAmount) > 0) {
      setDonateSuccess(true);
      setTimeout(() => {
        setShowDonateModal(false);
        setDonateSuccess(false);
        setDonateAmount('');
      }, 2000);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        to="/marketplace"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={business.gallery[currentImage]}
              alt={business.name}
              className="aspect-video w-full object-cover"
            />
            {business.gallery.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === 0 ? business.gallery.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === business.gallery.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {business.gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentImage
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & meta */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-3xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  {business.featured && (
                    <span className="badge bg-gold-100 text-gold-700">Destacado</span>
                  )}
                </div>
                <p className="mt-1 text-lg text-gray-500">{business.tagline}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-50 hover:text-terracotta-500">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-50 hover:text-teal-500">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {business.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Founded {business.foundedYear}
              </span>
              {business.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <a
                    href={`https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700"
                  >
                    {business.website}
                  </a>
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {business.tags.map((tag) => (
                <span
                  key={tag}
                  className="badge bg-gray-50 text-gray-600 ring-1 ring-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <div className="flex gap-8">
              {(['about', 'founders', 'updates'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 pb-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-terracotta-500 text-terracotta-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'about' ? 'Sobre el negocio' : tab === 'founders' ? 'Fundadores' : 'Actualizaciones'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-6">
            {activeTab === 'about' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                  {business.description}
                </p>
              </div>
            )}

            {activeTab === 'founders' && (
              <div className="space-y-6">
                {business.founders.map((founder) => (
                  <div key={founder.name} className="card flex gap-5 p-5">
                    <img
                      src={founder.avatar}
                      alt={founder.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{founder.name}</h3>
                      <p className="text-sm text-terracotta-500">{founder.role}</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {founder.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="space-y-4">
                <div className="card p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    2 days ago
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    Exciting news! We just reached a major milestone. Thank you to everyone
                    who has supported us through Lumina Red. More updates coming soon.
                  </p>
                </div>
                <div className="card p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    1 week ago
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    We are thrilled to announce that we have been featured on Lumina Red's
                    homepage! This means so much to our team. La comunidad is growing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — funding */}
        <aside className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="font-display text-lg font-semibold text-gray-900">
              Community Funding
            </h2>

            <div className="mt-4">
              <FundingProgress
                raised={business.fundingRaised}
                goal={business.fundingGoal}
                backers={business.backers}
              />
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowDonateModal(true)}
                className="btn-teal w-full py-3.5"
              >
                <DollarSign className="h-4 w-4" />
                Donate
              </button>
              <button className="btn-secondary w-full py-3.5">
                <TrendingUp className="h-4 w-4" />
                Invest
              </button>
            </div>

            {/* Backers preview */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Users className="h-4 w-4 text-gray-400" />
                Recent backers
              </div>
              <div className="mt-3 flex -space-x-2">
                {['Ana+C', 'Luis+M', 'Diego+R', 'Maria+L', 'Sofia+R'].map(
                  (name, i) => (
                    <img
                      key={i}
                      src={`https://ui-avatars.com/api/?name=${name}&size=36&background=${
                        ['C2652A', '0D9488', 'F59E0B', '7C3AED', 'EC4899'][i]
                      }&color=fff&bold=true`}
                      alt=""
                      className="h-9 w-9 rounded-full border-2 border-white"
                    />
                  )
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-500">
                  +{business.backers - 5}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6">
            {donateSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                  <Heart className="h-8 w-8 text-teal-500" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-gray-900">
                  Gracias!
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your contribution of ${donateAmount} has been received.
                  You're helping build something amazing.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-gray-900">
                    Donate to {business.name}
                  </h3>
                  <button
                    onClick={() => setShowDonateModal(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Your Community Funds will be transferred directly to the business.
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
                    Custom Amount
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
                  disabled={!donateAmount || parseFloat(donateAmount) <= 0}
                  className="btn-teal mt-5 w-full py-3.5 disabled:opacity-40"
                >
                  Confirm Donation
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

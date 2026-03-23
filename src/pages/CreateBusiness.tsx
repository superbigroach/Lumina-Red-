import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  FileText,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { createBusiness } from '../lib/firestore';

const categoryOptions = [
  'Food & Restaurant',
  'Technology',
  'Health & Fitness',
  'Fashion',
  'Education',
  'Arts & Culture',
  'Services',
  'Other',
];

export default function CreateBusiness() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('');

  // Step 2
  const [description, setDescription] = useState('');
  const [galleryUrl1, setGalleryUrl1] = useState('');
  const [galleryUrl2, setGalleryUrl2] = useState('');
  const [galleryUrl3, setGalleryUrl3] = useState('');

  // Step 3
  const [fundingGoal, setFundingGoal] = useState('');
  const [equityPool, setEquityPool] = useState('');

  const canProceedStep1 = name.trim() && tagline.trim() && category;
  const canProceedStep2 = description.trim();
  const canSubmit = fundingGoal && parseFloat(fundingGoal) > 0 && equityPool && parseFloat(equityPool) >= 0;

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');

    const galleryUrls = [galleryUrl1, galleryUrl2, galleryUrl3].filter((u) => u.trim());
    const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C2652A&color=fff&size=200`;

    try {
      const id = await createBusiness({
        founderId: user.uid,
        founderName: user.displayName || 'Anonymous',
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        logoUrl,
        galleryUrls: galleryUrls.length > 0 ? galleryUrls : [logoUrl],
        fundingGoalUsdc: parseFloat(fundingGoal),
        equityPoolPercent: parseFloat(equityPool),
        status: 'active',
        isTemplate: false,
      });
      navigate(`/business/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create business. Please try again.');
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Basics', icon: Store },
    { num: 2, label: 'Details', icon: FileText },
    { num: 3, label: 'Funding', icon: DollarSign },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Registrar Mi Negocio
        </h1>
        <p className="mt-2 text-gray-500">
          Share your business with la comunidad and start receiving community funding.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {steps.map(({ num, label, icon: Icon }) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                step === num
                  ? 'bg-terracotta-500 text-white'
                  : step > num
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step > num ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <span
              className={`hidden text-sm font-medium sm:block ${
                step === num ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
            {num < 3 && (
              <div
                className={`hidden h-px w-12 sm:block ${
                  step > num ? 'bg-teal-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="card mt-8 p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Business Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sabor de Casa"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tagline *
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A short catchy description of your business"
                className="input-field"
              />
              <p className="mt-1 text-xs text-gray-400">Keep it under 80 characters</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Select a category...</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="btn-primary disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the community about your business, mission, and what makes it special..."
                className="input-field"
                rows={6}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Gallery Image URLs (optional)
              </label>
              <p className="mb-2 text-xs text-gray-400">
                Add up to 3 image URLs to showcase your business
              </p>
              <div className="space-y-2">
                <input
                  type="url"
                  value={galleryUrl1}
                  onChange={(e) => setGalleryUrl1(e.target.value)}
                  placeholder="https://example.com/image1.jpg"
                  className="input-field"
                />
                <input
                  type="url"
                  value={galleryUrl2}
                  onChange={(e) => setGalleryUrl2(e.target.value)}
                  placeholder="https://example.com/image2.jpg"
                  className="input-field"
                />
                <input
                  type="url"
                  value={galleryUrl3}
                  onChange={(e) => setGalleryUrl3(e.target.value)}
                  placeholder="https://example.com/image3.jpg"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="btn-primary disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Funding */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Funding Goal (USDC) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  placeholder="e.g. 25000"
                  className="input-field pl-10"
                  min="100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                How much does your business need to reach its next milestone?
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Community Equity Pool (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={equityPool}
                  onChange={(e) => setEquityPool(e.target.value)}
                  placeholder="e.g. 15"
                  className="input-field"
                  min="0"
                  max="50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                The percentage of equity shared with community backers (0-50%)
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">Preview</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Business</span>
                  <span className="font-medium text-gray-900">{name || '...'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900">{category || '...'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Funding Goal</span>
                  <span className="font-medium text-teal-600">
                    {fundingGoal ? `$${parseFloat(fundingGoal).toLocaleString()} USDC` : '...'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Equity Pool</span>
                  <span className="font-medium text-terracotta-600">
                    {equityPool ? `${equityPool}%` : '...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="btn-teal disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Registrar Negocio
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

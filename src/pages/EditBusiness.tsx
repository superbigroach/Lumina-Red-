import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Upload,
  Loader2,
  Check,
  MapPin,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getBusiness, updateBusiness, uploadImage, Business } from '../lib/firestore';

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

export default function EditBusiness() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');

  // Section 1 — Identidad
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  // Section 2 — Historia
  const [description, setDescription] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<[string, string, string]>(['', '', '']);

  // Section 3 — Contacto
  const [fundingGoal, setFundingGoal] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!id) return;

    getBusiness(id).then((biz) => {
      if (!biz) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Ownership check — redirect if not the founder
      if (user && user.uid !== biz.founderId) {
        navigate(`/business/${id}`, { replace: true });
        return;
      }

      setBusiness(biz);

      // Populate form fields
      setName(biz.name || '');
      setTagline(biz.tagline || '');
      setCategory(biz.category || '');
      setLocation(biz.location || '');
      setDescription(biz.description || '');
      setCoverPhotoUrl(biz.coverPhotoUrl || '');
      const urls = biz.galleryUrls || [];
      setGalleryUrls([urls[0] || '', urls[1] || '', urls[2] || '']);
      setFundingGoal(biz.fundingGoalUsdc ? String(biz.fundingGoalUsdc) : '');
      setContactEmail(biz.contactEmail || '');
      setContactPhone(biz.contactPhone || '');
      setWebsite(biz.website || '');

      setLoading(false);
    });
  }, [id, user, navigate]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploadingCover(true);
    try {
      const url = await uploadImage(file, `businesses/${id}/cover_${Date.now()}`);
      setCoverPhotoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover photo.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryChange = (index: 0 | 1 | 2, value: string) => {
    setGalleryUrls((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!id || !business) return;
    setSaving(true);
    setError('');

    try {
      await updateBusiness(id, {
        name,
        tagline,
        category,
        location,
        description,
        coverPhotoUrl,
        galleryUrls: galleryUrls.filter((u) => u.trim()),
        fundingGoalUsdc: parseFloat(fundingGoal) || business.fundingGoalUsdc,
        contactEmail,
        contactPhone,
        website,
      });

      // Show success toast for 2 seconds, then navigate
      setShowToast(true);
      setTimeout(() => {
        navigate(`/business/${id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes. Please try again.');
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-medium text-gray-900">Negocio no encontrado</p>
        <p className="mt-2 text-gray-500">
          This business does not exist or may have been removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-28">
      {/* Success toast */}
      {showToast && (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
          <div className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-medium text-white shadow-lg">
            <Check className="h-4 w-4" />
            ¡Cambios guardados!
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <Link
            to={`/business/${id}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listing
          </Link>
          <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
            Editar Negocio
          </h1>
          <p className="mt-1 text-gray-500">Update your business listing details.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-6">
          {/* ── Section 1: Identidad ── */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Identidad
            </h2>

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
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Tagline *</label>
                <span
                  className={`text-xs ${
                    tagline.length > 80 ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  {tagline.length}/80
                </span>
              </div>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A short catchy description of your business"
                className="input-field"
                maxLength={80}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Select a category...</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  Location
                </span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Toronto, Canada"
                className="input-field"
              />
            </div>
          </div>

          {/* ── Section 2: Historia ── */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Historia
            </h2>

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

            {/* Cover photo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Cover Photo
              </label>

              {coverPhotoUrl && (
                <div className="mb-3 overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={coverPhotoUrl}
                    alt="Cover preview"
                    className="h-44 w-full object-cover"
                  />
                </div>
              )}

              <label className="btn-secondary inline-flex cursor-pointer items-center gap-2">
                {uploadingCover ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {coverPhotoUrl ? 'Replace Cover Photo' : 'Upload Cover Photo'}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                />
              </label>
            </div>

            {/* Gallery URLs */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Gallery Image URLs (optional)
              </label>
              <p className="mb-2 text-xs text-gray-400">Add up to 3 image URLs to showcase your business</p>
              <div className="space-y-2">
                {([0, 1, 2] as const).map((i) => (
                  <input
                    key={i}
                    type="url"
                    value={galleryUrls[i]}
                    onChange={(e) => handleGalleryChange(i, e.target.value)}
                    placeholder={`https://example.com/image${i + 1}.jpg`}
                    className="input-field"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 3: Contacto ── */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Contacto
            </h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Funding Goal (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  placeholder="e.g. 25000"
                  className="input-field pl-8"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  Contact Email
                </span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hello@yourbusiness.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  Contact Phone
                </span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (416) 555-0100"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  Website
                </span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            to={`/business/${id}`}
            className="btn-secondary"
          >
            Cancelar
          </Link>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !tagline.trim() || !description.trim()}
            className="btn-teal disabled:opacity-40"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

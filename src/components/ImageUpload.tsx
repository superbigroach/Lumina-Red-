import { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { uploadImage } from '../lib/firestore';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  uploadPath: string;
  label?: string;
  aspectRatio?: 'video' | 'square';
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  uploadPath,
  label,
  aspectRatio = 'video',
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pendingFile, setPendingFile] = useState<{ name: string; size: string } | null>(null);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (file.size > 5 * 1024 * 1024) {
      setError('Imagen demasiado grande (máx 5MB)');
      e.target.value = '';
      return;
    }

    setPendingFile({ name: file.name, size: formatSize(file.size) });
    setUploading(true);

    try {
      const url = await uploadImage(file, `${uploadPath}_${Date.now()}`);
      onChange(url);
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
      setPendingFile(null);
      e.target.value = '';
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setError('');
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div
        className={`relative ${aspectClass} rounded-xl border-2 border-dashed transition-colors ${
          value
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-200 bg-gray-100'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        {/* Image preview */}
        {value && !uploading && (
          <img
            src={value}
            alt="Preview"
            className="absolute inset-0 h-full w-full rounded-xl object-cover"
          />
        )}

        {/* Hover overlay on existing image */}
        {value && hovering && !uploading && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/40">
            <Upload className="h-6 w-6 text-white" />
            <span className="text-sm font-medium text-white">Cambiar</span>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/30">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <span className="text-sm font-medium text-white">Subiendo...</span>
          </div>
        )}

        {/* Empty state */}
        {!value && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">Haz clic para subir</span>
          </div>
        )}

        {/* Clear button */}
        {value && !uploading && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
          onChange={handleFileChange}
        />
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        disabled={disabled || uploading}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {value ? 'Cambiar imagen' : 'Subir imagen'}
      </button>

      {/* File info while uploading */}
      {pendingFile && (
        <p className="text-xs text-gray-500">
          {pendingFile.name} — {pendingFile.size}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

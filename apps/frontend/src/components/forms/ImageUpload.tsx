'use client';

import { useState, useRef, useCallback } from 'react';
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  TrashIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  caption?: string;
  category?: 'before' | 'progress' | 'after' | 'reference' | 'damage' | 'other';
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  categories?: boolean;
  className?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 20,
  maxFileSize = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  categories = true,
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: Only JPG, PNG, and WebP files are allowed`);
        return false;
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`${file.name}: File size must be less than ${maxFileSize}MB`);
        return false;
      }
      return true;
    });

    const newImages: ImageFile[] = validFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      preview: URL.createObjectURL(file),
      category: 'other',
    }));

    onImagesChange([...images, ...newImages]);
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter(img => img.id !== id));
  };

  const updateImageCaption = (id: string, caption: string) => {
    onImagesChange(images.map(img => (img.id === id ? { ...img, caption } : img)));
  };

  const updateImageCategory = (id: string, category: ImageFile['category']) => {
    onImagesChange(images.map(img => (img.id === id ? { ...img, category } : img)));
  };

  const categoryColors = {
    before: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    after: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    reference: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    damage: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload Images
            </button>
            <p className="mt-2 text-xs text-gray-500">
              or drag and drop up to {maxImages} images (max {maxFileSize}MB each)
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={e => handleFiles(Array.from(e.target.files || []))}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(image => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={image.preview}
                  alt={image.caption || 'Project image'}
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              {categories && image.category && (
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                    categoryColors[image.category]
                  }`}
                >
                  {image.category}
                </div>
              )}

              {/* Caption */}
              <input
                type="text"
                placeholder="Add caption..."
                value={image.caption || ''}
                onChange={e => updateImageCaption(image.id, e.target.value)}
                className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              {/* Category Selector */}
              {categories && (
                <select
                  value={image.category}
                  onChange={e =>
                    updateImageCategory(image.id, e.target.value as ImageFile['category'])
                  }
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="before">Before</option>
                  <option value="progress">Progress</option>
                  <option value="after">After</option>
                  <option value="reference">Reference</option>
                  <option value="damage">Damage</option>
                  <option value="other">Other</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={selectedImage.preview}
              alt={selectedImage.caption || 'Project image'}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

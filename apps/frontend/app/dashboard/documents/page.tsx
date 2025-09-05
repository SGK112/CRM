'use client';

import { Button, Card, Heading, Pill } from '@/components/ui/DesignSystem';
import {
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    DocumentArrowUpIcon,
    DocumentIcon,
    DocumentTextIcon,
    EyeIcon,
    FolderIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PhotoIcon,
    TrashIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Document {
  _id: string;
  name: string;
  description?: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  category:
    | 'contract'
    | 'invoice'
    | 'blueprint'
    | 'image'
    | 'video'
    | 'proposal'
    | 'permit'
    | 'other';
  status: 'draft' | 'review' | 'approved' | 'signed' | 'archived';
  version: number;
  clientId?: string;
  projectId?: string;
  tags: string[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

// Mapping to unified pill tint variants defined in globals.css
const categoryTint: Record<
  Document['category'],
  'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'neutral'
> = {
  contract: 'blue',
  invoice: 'green',
  blueprint: 'purple',
  image: 'yellow',
  video: 'red',
  proposal: 'indigo',
  permit: 'yellow',
  other: 'neutral',
};

const statusTint: Record<
  Document['status'],
  'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'neutral'
> = {
  draft: 'neutral',
  review: 'yellow',
  approved: 'green',
  signed: 'blue',
  archived: 'red',
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return PhotoIcon;
  if (mimeType.startsWith('video/')) return VideoCameraIcon;
  if (mimeType.includes('pdf')) return DocumentTextIcon;
  return DocumentIcon;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      _id: '1',
      name: 'Kitchen Renovation Contract - Smith.pdf',
      description: 'Main contract for Smith kitchen renovation project',
      fileType: 'pdf',
      fileSize: 2450000,
      mimeType: 'application/pdf',
      category: 'contract',
      status: 'signed',
      version: 2,
      tags: ['contract', 'kitchen', 'smith'],
      uploadedBy: 'John Doe',
      createdAt: '2025-08-10T10:00:00Z',
      updatedAt: '2025-08-12T14:30:00Z',
    },
    {
      _id: '2',
      name: 'Bathroom Blueprint - Johnson.dwg',
      description: 'Architectural drawings for Johnson bathroom remodel',
      fileType: 'dwg',
      fileSize: 5670000,
      mimeType: 'application/dwg',
      category: 'blueprint',
      status: 'approved',
      version: 1,
      tags: ['blueprint', 'bathroom', 'johnson'],
      uploadedBy: 'Jane Smith',
      createdAt: '2025-08-11T09:15:00Z',
      updatedAt: '2025-08-11T09:15:00Z',
    },
    {
      _id: '3',
      name: 'Before Photo - Kitchen.jpg',
      description: 'Before photo of Smith kitchen renovation',
      fileType: 'jpg',
      fileSize: 1200000,
      mimeType: 'image/jpeg',
      category: 'image',
      status: 'approved',
      version: 1,
      tags: ['photo', 'before', 'kitchen'],
      uploadedBy: 'Mike Wilson',
      createdAt: '2025-08-09T16:45:00Z',
      updatedAt: '2025-08-09T16:45:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const router = useRouter();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length > 0) {
      setDocuments(prev => prev.filter(doc => !selectedFiles.includes(doc._id)));
      setSelectedFiles([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <Heading level={1} className="mb-2 text-brand-700 dark:text-brand-400">
            Document Management
          </Heading>
          <p className="text-sm text-[var(--text-dim)]">
            Organize and manage your project documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="segment-group">
            <button data-active={viewMode === 'list'} onClick={() => setViewMode('list')}>
              List
            </button>
            <button data-active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
              Grid
            </button>
          </div>
          <Button
            tone="accent"
            leftIcon={<CloudArrowUpIcon className="h-5 w-5" />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Files
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-2 rounded-full border pill-tint-blue">
            <DocumentTextIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
              Total Documents
            </p>
            <p className="text-2xl font-semibold text-[var(--text)]">{documents.length}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-2 rounded-full border pill-tint-green">
            <FolderIcon className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
              Categories
            </p>
            <p className="text-2xl font-semibold text-[var(--text)]">
              {new Set(documents.map(d => d.category)).size}
            </p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-2 rounded-full border pill-tint-yellow">
            <DocumentArrowUpIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
              Pending Review
            </p>
            <p className="text-2xl font-semibold text-[var(--text)]">
              {documents.filter(d => d.status === 'review').length}
            </p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-2 rounded-full border pill-tint-purple">
            <CloudArrowUpIcon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
              Storage Used
            </p>
            <p className="text-2xl font-semibold text-[var(--text)]">
              {formatFileSize(documents.reduce((total, doc) => total + doc.fileSize, 0))}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-2" padding="md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Categories</option>
            <option value="contract">Contracts</option>
            <option value="invoice">Invoices</option>
            <option value="blueprint">Blueprints</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="proposal">Proposals</option>
            <option value="permit">Permits</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="signed">Signed</option>
            <option value="archived">Archived</option>
          </select>

          {selectedFiles.length > 0 && (
            <Button
              tone="danger"
              onClick={handleBulkDelete}
              leftIcon={<TrashIcon className="h-5 w-5" />}
            >
              Delete ({selectedFiles.length})
            </Button>
          )}
        </div>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-800 mb-4">Upload your first document to get started.</p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Upload Files
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredDocuments.map(document => {
              const FileIcon = getFileIcon(document.mimeType);

              return (
                <Card
                  key={document._id}
                  padding={viewMode === 'grid' ? 'md' : 'sm'}
                  className="transition-shadow hover:shadow-md"
                >
                  <div
                    className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center justify-between'}`}
                  >
                    <div
                      className={`flex ${viewMode === 'grid' ? 'flex-col items-center text-center' : 'items-center'} flex-1`}
                    >
                      <div className={`flex items-center ${viewMode === 'grid' ? 'mb-4' : 'mr-4'}`}>
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(document._id)}
                          onChange={() => handleFileSelect(document._id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-[var(--border)] rounded bg-[var(--surface-1)]"
                        />
                        <div className="p-2 rounded-lg border pill-tint-neutral">
                          <FileIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>

                      <div className={`${viewMode === 'grid' ? '' : 'ml-0'} flex-1`}>
                        <h3
                          className={`font-semibold text-[var(--text)] ${viewMode === 'grid' ? 'mb-2' : 'mb-1'}`}
                        >
                          {document.name}
                        </h3>
                        {document.description && (
                          <p className="text-sm text-[var(--text-dim)] mb-2">
                            {document.description}
                          </p>
                        )}

                        <div
                          className={`flex ${viewMode === 'grid' ? 'flex-col space-y-2' : 'space-x-4'} text-xs text-[var(--text-dim)]`}
                        >
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>v{document.version}</span>
                          <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                        </div>

                        <div
                          className={`flex ${viewMode === 'grid' ? 'justify-center' : ''} space-x-2 mt-2`}
                        >
                          <Pill tint={categoryTint[document.category]} size="sm">
                            {document.category}
                          </Pill>
                          <Pill tint={statusTint[document.status]} size="sm">
                            {document.status}
                          </Pill>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex ${viewMode === 'grid' ? 'justify-center mt-4' : ''} space-x-2`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="View"
                        leftIcon={<EyeIcon className="h-4 w-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Download"
                        leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Edit"
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                      />
                      <Button
                        variant="ghost"
                        tone="danger"
                        size="sm"
                        aria-label="Delete"
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal Placeholder */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="md">
            <Heading level={3} className="mb-4">
              Upload Documents
            </Heading>
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center surface-2">
              <CloudArrowUpIcon className="h-12 w-12 text-[var(--text-dim)] mx-auto mb-4" />
              <p className="text-[var(--text-dim)] mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-xs text-[var(--text-dim)]">
                Supports PDF, DOC, DOCX, JPG, PNG, DWG
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button
                tone="accent"
                onClick={() => {
                  setUploadModalOpen(false); /* TODO: Implement file upload */
                }}
              >
                Upload
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

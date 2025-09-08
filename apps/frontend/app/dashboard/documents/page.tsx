'use client';

import {
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
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
    <div className="min-h-screen bg-black">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Documents</h1>
                <p className="text-sm text-slate-400">File management & sharing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? (
                  <FolderIcon className="h-4 w-4 text-slate-400" />
                ) : (
                  <DocumentIcon className="h-4 w-4 text-slate-400" />
                )}
              </button>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 text-black" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-lg font-bold text-white">{documents.length}</div>
              <div className="text-xs text-slate-400">Files</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-lg font-bold text-white">
                {new Set(documents.map(d => d.category)).size}
              </div>
              <div className="text-xs text-slate-400">Categories</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-lg font-bold text-white">
                {documents.filter(d => d.status === 'review').length}
              </div>
              <div className="text-xs text-slate-400">Review</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-lg font-bold text-white">
                {formatFileSize(documents.reduce((total, doc) => total + doc.fileSize, 0))}
              </div>
              <div className="text-xs text-slate-400">Storage</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Search and Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="signed">Signed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Delete ({selectedFiles.length})
            </button>
          )}
        </div>

        {/* Documents Grid/List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload your first document to get started.'
              }
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors"
            >
              Upload Files
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {filteredDocuments.map(document => {
              const FileIcon = getFileIcon(document.mimeType);
              
              return (
                <div
                  key={document._id}
                  className="bg-slate-900 rounded-lg border border-slate-700 p-4"
                >
                  <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center justify-between'}`}>
                    <div className={`flex ${viewMode === 'grid' ? 'items-center mb-3' : 'items-center flex-1'}`}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(document._id)}
                        onChange={() => handleFileSelect(document._id)}
                        className="mr-3 h-4 w-4 text-amber-500 focus:ring-amber-500 border-slate-600 rounded bg-slate-800"
                      />
                      <div className="p-2 bg-slate-800 rounded-lg mr-3">
                        <FileIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate mb-1">
                          {document.name}
                        </h3>
                        {document.description && (
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {document.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>v{document.version}</span>
                          <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex ${viewMode === 'grid' ? 'justify-between items-center' : 'flex-col items-end'} gap-2`}>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${categoryTint[document.category] || 'bg-slate-700 text-slate-300'}`}>
                          {document.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusTint[document.status] || 'bg-slate-700 text-slate-300'}`}>
                          {document.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors">
                          <EyeIcon className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors">
                          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors">
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors">
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">Upload Documents</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center bg-slate-800/50">
                <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-xs text-slate-400">
                  Supports PDF, DOC, DOCX, JPG, PNG, DWG
                </p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setUploadModalOpen(false);
                    // TODO: Implement file upload
                  }}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

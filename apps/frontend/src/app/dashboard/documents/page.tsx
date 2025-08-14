'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import {
  DocumentTextIcon,
  FolderIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

interface Document {
  _id: string;
  name: string;
  description?: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  category: 'contract' | 'invoice' | 'blueprint' | 'image' | 'video' | 'proposal' | 'permit' | 'other';
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

const categoryColors = {
  contract: 'bg-blue-100 text-blue-800',
  invoice: 'bg-green-100 text-green-800',
  blueprint: 'bg-purple-100 text-purple-800',
  image: 'bg-yellow-100 text-yellow-800',
  video: 'bg-red-100 text-red-800',
  proposal: 'bg-indigo-100 text-indigo-800',
  permit: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  signed: 'bg-blue-100 text-blue-800',
  archived: 'bg-red-100 text-red-800'
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
      updatedAt: '2025-08-12T14:30:00Z'
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
      updatedAt: '2025-08-11T09:15:00Z'
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
      updatedAt: '2025-08-09T16:45:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const router = useRouter();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length > 0) {
      setDocuments(prev => prev.filter(doc => !selectedFiles.includes(doc._id)));
      setSelectedFiles([]);
    }
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
            <p className="text-gray-600">Organize and manage your project documents</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } rounded-l-lg`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } rounded-r-lg`}
              >
                Grid
              </button>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Upload Files
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(documents.map(d => d.category)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DocumentArrowUpIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'review').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CloudArrowUpIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(documents.reduce((total, doc) => total + doc.fileSize, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="signed">Signed</option>
              <option value="archived">Archived</option>
            </select>

            {selectedFiles.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete ({selectedFiles.length})
              </button>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">Upload your first document to get started.</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload Files
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDocuments.map((document) => {
                const FileIcon = getFileIcon(document.mimeType);
                
                return (
                  <div
                    key={document._id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                      viewMode === 'grid' ? 'p-6' : 'p-4'
                    }`}
                  >
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center justify-between'}`}>
                      <div className={`flex ${viewMode === 'grid' ? 'flex-col items-center text-center' : 'items-center'} flex-1`}>
                        <div className={`flex items-center ${viewMode === 'grid' ? 'mb-4' : 'mr-4'}`}>
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(document._id)}
                            onChange={() => handleFileSelect(document._id)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FileIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>

                        <div className={`${viewMode === 'grid' ? '' : 'ml-0'} flex-1`}>
                          <h3 className={`font-semibold text-gray-900 ${viewMode === 'grid' ? 'mb-2' : 'mb-1'}`}>
                            {document.name}
                          </h3>
                          {document.description && (
                            <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                          )}
                          
                          <div className={`flex ${viewMode === 'grid' ? 'flex-col space-y-2' : 'space-x-4'} text-sm text-gray-500`}>
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span>v{document.version}</span>
                            <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                          </div>

                          <div className={`flex ${viewMode === 'grid' ? 'justify-center' : ''} space-x-2 mt-2`}>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[document.category]}`}>
                              {document.category}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[document.status]}`}>
                              {document.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`flex ${viewMode === 'grid' ? 'justify-center mt-4' : ''} space-x-2`}>
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Modal Placeholder */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or click to select</p>
                <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, JPG, PNG, DWG</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement file upload
                    setUploadModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

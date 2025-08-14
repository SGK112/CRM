'use client';

import { useState } from 'react';
import Layout from '../../../components/Layout';
import {
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArchiveBoxIcon,
  ShareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  DocumentIcon,
  CubeIcon,
  PaintBrushIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'document' | 'image' | 'video' | 'cad' | 'pdf' | 'other';
  size?: number;
  lastModified: string;
  owner: string;
  shared: boolean;
  starred: boolean;
  project?: string;
  client?: string;
  path: string[];
}

export default function StoragePage() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const files: FileItem[] = [
    // Root folders
    {
      id: '1',
      name: 'Project Files',
      type: 'folder',
      lastModified: '2 days ago',
      owner: 'You',
      shared: false,
      starred: true,
      path: []
    },
    {
      id: '2',
      name: 'Client Documents',
      type: 'folder',
      lastModified: '1 week ago',
      owner: 'You',
      shared: true,
      starred: false,
      path: []
    },
    {
      id: '3',
      name: 'Blueprints & CAD',
      type: 'folder',
      lastModified: '3 days ago',
      owner: 'You',
      shared: false,
      starred: true,
      path: []
    },
    {
      id: '4',
      name: 'Progress Photos',
      type: 'folder',
      lastModified: '1 day ago',
      owner: 'You',
      shared: true,
      starred: false,
      path: []
    },
    {
      id: '5',
      name: 'Contracts & Legal',
      type: 'folder',
      lastModified: '5 days ago',
      owner: 'You',
      shared: false,
      starred: false,
      path: []
    },
    {
      id: '6',
      name: 'Templates',
      type: 'folder',
      lastModified: '2 weeks ago',
      owner: 'You',
      shared: true,
      starred: true,
      path: []
    },
    // Sample files
    {
      id: '7',
      name: 'Smith Kitchen Plan.dwg',
      type: 'file',
      fileType: 'cad',
      size: 15678000,
      lastModified: '2 hours ago',
      owner: 'You',
      shared: true,
      starred: false,
      project: 'Smith Kitchen Renovation',
      client: 'John & Mary Smith',
      path: []
    },
    {
      id: '8',
      name: 'Project Proposal - Johnson Bathroom.pdf',
      type: 'file',
      fileType: 'pdf',
      size: 2458000,
      lastModified: '1 day ago',
      owner: 'You',
      shared: true,
      starred: true,
      project: 'Johnson Bathroom Remodel',
      client: 'Sarah Johnson',
      path: []
    },
    {
      id: '9',
      name: 'Before - Kitchen Demo.jpg',
      type: 'file',
      fileType: 'image',
      size: 8945000,
      lastModified: '3 days ago',
      owner: 'You',
      shared: false,
      starred: false,
      project: 'Smith Kitchen Renovation',
      path: []
    },
    {
      id: '10',
      name: 'Material Specifications.xlsx',
      type: 'file',
      fileType: 'document',
      size: 156000,
      lastModified: '1 week ago',
      owner: 'Sarah Connor',
      shared: true,
      starred: false,
      project: 'Wilson Kitchen Extension',
      path: []
    }
  ];

  const storageStats = {
    used: 47.8, // GB
    total: 100, // GB
    files: 1247,
    folders: 89,
    shared: 23
  };

  const quickActions = [
    {
      name: 'Upload Files',
      icon: CloudArrowUpIcon,
      color: 'bg-blue-500',
      action: () => setShowUploadModal(true)
    },
    {
      name: 'New Folder',
      icon: FolderIcon,
      color: 'bg-green-500',
      action: () => console.log('New folder')
    },
    {
      name: 'Sync Dropbox',
      icon: CloudArrowDownIcon,
      color: 'bg-purple-500',
      action: () => console.log('Sync Dropbox')
    },
    {
      name: 'Share Link',
      icon: ShareIcon,
      color: 'bg-orange-500',
      action: () => console.log('Share link')
    }
  ];

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return currentPath.includes(file.name) ? FolderOpenIcon : FolderIcon;
    }
    
    switch (file.fileType) {
      case 'image':
        return PhotoIcon;
      case 'video':
        return VideoCameraIcon;
      case 'cad':
        return CubeIcon;
      case 'pdf':
        return DocumentTextIcon;
      case 'document':
        return DocumentIcon;
      default:
        return DocumentIcon;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (fileType?: string) => {
    switch (fileType) {
      case 'image':
        return 'text-green-600';
      case 'video':
        return 'text-purple-600';
      case 'cad':
        return 'text-blue-600';
      case 'pdf':
        return 'text-red-600';
      case 'document':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredFiles = files.filter(file => {
    // Filter by current path
    const pathMatch = JSON.stringify(file.path) === JSON.stringify(currentPath);
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.project && file.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (file.client && file.client.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return pathMatch && searchMatch;
  });

  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const navigateBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const renderFileCard = (file: FileItem) => {
    const IconComponent = getFileIcon(file);
    const isSelected = selectedFiles.includes(file.id);

    return (
      <div
        key={file.id}
        className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => file.type === 'folder' ? navigateToFolder(file.name) : toggleFileSelection(file.id)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <IconComponent className={`h-8 w-8 ${file.type === 'folder' ? 'text-blue-500' : getFileTypeColor(file.fileType)}`} />
            <div className="flex items-center space-x-1">
              {file.starred && <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />}
              {file.shared && <ShareIcon className="h-4 w-4 text-green-500" />}
              <button className="p-1 hover:bg-gray-100 rounded">
                <EllipsisVerticalIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 text-sm mb-2 truncate" title={file.name}>
            {file.name}
          </h3>
          
          <div className="space-y-1 text-xs text-gray-500">
            {file.size && <p>{formatFileSize(file.size)}</p>}
            <p>{file.lastModified}</p>
            <p>By {file.owner}</p>
            {file.project && (
              <div className="flex items-center space-x-1">
                <ClipboardDocumentListIcon className="h-3 w-3" />
                <span className="truncate">{file.project}</span>
              </div>
            )}
            {file.client && (
              <div className="flex items-center space-x-1">
                <UserGroupIcon className="h-3 w-3" />
                <span className="truncate">{file.client}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderListItem = (file: FileItem) => {
    const IconComponent = getFileIcon(file);
    const isSelected = selectedFiles.includes(file.id);

    return (
      <tr
        key={file.id}
        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={() => file.type === 'folder' ? navigateToFolder(file.name) : toggleFileSelection(file.id)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleFileSelection(file.id)}
              className="h-4 w-4 text-blue-600 rounded mr-3"
              onClick={(e) => e.stopPropagation()}
            />
            <IconComponent className={`h-6 w-6 mr-3 ${file.type === 'folder' ? 'text-blue-500' : getFileTypeColor(file.fileType)}`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                {file.starred && <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />}
                {file.shared && <ShareIcon className="h-4 w-4 text-green-500" />}
              </div>
              {file.project && (
                <div className="flex items-center space-x-1 mt-1">
                  <ClipboardDocumentListIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{file.project}</span>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {file.size ? formatFileSize(file.size) : '—'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {file.lastModified}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {file.owner}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button className="text-gray-400 hover:text-gray-600">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </td>
      </tr>
    );
  };

  const renderUploadModal = () => {
    if (!showUploadModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select Files
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload to
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Current Folder</option>
                <option>Project Files</option>
                <option>Client Documents</option>
                <option>Blueprints & CAD</option>
                <option>Progress Photos</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">File Storage</h1>
            <p className="text-gray-600 mt-1">
              Manage your project files, blueprints, and documents
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'grid' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2 inline" />
              Upload
            </button>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArchiveBoxIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Storage Used</p>
                <p className="text-lg font-semibold text-gray-900">
                  {storageStats.used} GB / {storageStats.total} GB
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DocumentIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Files</p>
                <p className="text-lg font-semibold text-gray-900">{storageStats.files.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FolderIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Folders</p>
                <p className="text-lg font-semibold text-gray-900">{storageStats.folders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShareIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Shared</p>
                <p className="text-lg font-semibold text-gray-900">{storageStats.shared}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-3 rounded-full ${action.color} text-white mb-2`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={navigateBack}
              disabled={currentPath.length === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Home</span>
              {currentPath.map((folder, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <span>/</span>
                  <span>{folder}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Files Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedFiles.length > 0 && (
            <div className="border-b border-gray-200 p-4 bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Download
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Share
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map(renderFileCard)}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map(renderListItem)}
                </tbody>
              </table>
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by uploading files.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Upload Files
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {renderUploadModal()}
      </div>
    </Layout>
  );
}

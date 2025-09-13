'use client';

import {
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    DocumentTextIcon,
    EyeIcon,
    FolderIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useRef, useState } from 'react';

interface PriceSheet {
  id: string;
  name: string;
  vendor: string;
  uploadDate: Date;
  fileSize: number;
  itemCount: number;
  status: 'processing' | 'ready' | 'error';
  categories: string[];
  fileType?: 'excel' | 'csv' | 'pdf'; // Add file type tracking
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description?: string;
  vendor: string;
  priceSheetId: string;
}

export default function CatalogPage() {
  const [priceSheets, setPriceSheets] = useState<PriceSheet[]>([
    {
      id: '1',
      name: 'ABC Construction Materials',
      vendor: 'ABC Corp',
      uploadDate: new Date('2025-01-15'),
      fileSize: 245760,
      itemCount: 1250,
      status: 'ready',
      categories: ['Lumber', 'Hardware', 'Paint', 'Electrical'],
    },
    {
      id: '2',
      name: 'XYZ Plumbing Supplies',
      vendor: 'XYZ Supplies',
      uploadDate: new Date('2025-01-10'),
      fileSize: 189432,
      itemCount: 890,
      status: 'ready',
      categories: ['Plumbing', 'Fixtures', 'Pipes', 'Valves'],
    },
  ]);

  const [products] = useState<Product[]>([
    {
      id: '1',
      name: '2x4x8 Pressure Treated Pine',
      category: 'Lumber',
      price: 8.99,
      unit: 'piece',
      description: 'Pressure treated pine board',
      vendor: 'ABC Corp',
      priceSheetId: '1',
    },
    {
      id: '2',
      name: '1/2" Copper Pipe',
      category: 'Plumbing',
      price: 12.5,
      unit: 'foot',
      description: 'Type L copper pipe',
      vendor: 'XYZ Supplies',
      priceSheetId: '2',
    },
  ]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [viewMode, setViewMode] = useState<'sheets' | 'products'>('sheets');
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [viewingFile, setViewingFile] = useState<PriceSheet | null>(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'text/csv' ||
        file.type === 'application/pdf';

      if (!isValidType) {
        setUploadStatus({
          type: 'error',
          message: `${file.name} is not a supported file type. Please upload Excel (.xlsx, .xls), CSV, or PDF files.`,
        });
        setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      const isPDF = file.type === 'application/pdf';
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
      const isCSV = file.type === 'text/csv';

      let fileType: 'excel' | 'csv' | 'pdf' = 'pdf';
      if (isExcel) fileType = 'excel';
      else if (isCSV) fileType = 'csv';

      // Create a new price sheet entry
      const newPriceSheet: PriceSheet = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        vendor: 'Unknown Vendor', // Would be extracted from file
        uploadDate: new Date(),
        fileSize: file.size,
        itemCount: 0,
        status: 'processing',
        categories: [],
        fileType: fileType,
      };

      setPriceSheets(prev => [newPriceSheet, ...prev]);

      if (isPDF) {
        // Upload PDF to backend for processing
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('vendorId', 'default-vendor'); // TODO: Get from user selection
          formData.append('defaultMarginPct', '0');
          formData.append('defaultUnit', 'ea');
          formData.append('skipDuplicates', 'true');

          const response = await fetch('/api/catalog/upload-pdf', {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();

          // Update the price sheet with processing results
          setPriceSheets(prev =>
            prev.map(sheet =>
              sheet.id === newPriceSheet.id
                ? {
                    ...sheet,
                    status: result.success ? 'ready' : 'error',
                    itemCount: result.products?.length || 0,
                    vendor: result.products?.length > 0 ? 'Processed Vendor' : sheet.vendor,
                  }
                : sheet
            )
          );

          if (result.success) {
            setUploadStatus({
              type: 'success',
              message: `Successfully processed PDF "${file.name}" with ${result.products?.length || 0} products extracted!`,
            });
          } else {
            setUploadStatus({
              type: 'error',
              message: `Failed to process PDF "${file.name}": ${result.errors?.join(', ') || 'Unknown error'}`,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setPriceSheets(prev =>
            prev.map(sheet =>
              sheet.id === newPriceSheet.id ? { ...sheet, status: 'error' } : sheet
            )
          );
          setUploadStatus({
            type: 'error',
            message: `Failed to upload PDF "${file.name}": ${errorMessage}`,
          });
        }
      } else {
        // Simulate processing for Excel/CSV files (existing logic)
        setTimeout(() => {
          setPriceSheets(prev =>
            prev.map(sheet =>
              sheet.id === newPriceSheet.id
                ? {
                    ...sheet,
                    status: 'ready' as const,
                    itemCount: Math.floor(Math.random() * 1000) + 100,
                  }
                : sheet
            )
          );
        }, 2000);
      }
    }

    setTimeout(() => setUploadStatus({ type: null, message: '' }), 4000);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewFile = (sheet: PriceSheet) => {
    setViewingFile(sheet);
    setShowFileViewer(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesVendor = selectedVendor === 'all' || product.vendor === selectedVendor;

    return matchesSearch && matchesCategory && matchesVendor;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));
  const vendors = Array.from(new Set(products.map(p => p.vendor)));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-black border-b border-slate-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <FolderIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Price Sheets</h1>
                <p className="text-sm text-slate-400">Upload & manage catalogs</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'sheets' ? 'products' : 'sheets')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 text-slate-400" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 text-black" />
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('sheets')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded transition-colors ${
                viewMode === 'sheets'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Price Sheets
            </button>
            <button
              onClick={() => setViewMode('products')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded transition-colors ${
                viewMode === 'products'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Products
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Upload Status Message */}
        {uploadStatus.type && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              uploadStatus.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-5 h-5 ${uploadStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {uploadStatus.type === 'success' ? '✓' : '✕'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{uploadStatus.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`mb-4 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
            isDragOver
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center py-8 px-6">
            <CloudArrowUpIcon
              className={`mx-auto h-10 w-10 mb-4 transition-all ${
                isDragOver ? 'text-amber-400 animate-bounce' : 'text-slate-400'
              }`}
            />
            <h3 className="text-lg font-medium text-white mb-2">
              {isDragOver ? 'Drop files here' : 'Upload Price Sheets'}
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              Drag and drop Excel, CSV, or PDF files
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span>📊 Excel</span>
              <span>•</span>
              <span>📄 CSV</span>
              <span>•</span>
              <span>📕 PDF</span>
            </div>
            <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded">
              <strong>Note:</strong> PDF files stored for reference
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-4">
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={viewMode === 'sheets' ? 'Search price sheets...' : 'Search products...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {viewMode === 'products' && (
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === 'sheets' ? (
          <div className="space-y-3">
            {priceSheets.map(sheet => (
              <div key={sheet.id} className="bg-slate-900 rounded-lg border border-slate-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {sheet.fileType === 'pdf' ? (
                      <div className="h-8 w-8 bg-red-500/20 rounded flex items-center justify-center">
                        <span className="text-red-400 font-bold text-xs">PDF</span>
                      </div>
                    ) : (
                      <DocumentTextIcon className="h-8 w-8 text-blue-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-white">{sheet.name}</h3>
                      <p className="text-sm text-slate-400">
                        {sheet.vendor}
                        {sheet.fileType === 'pdf' && (
                          <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                            PDF Reference
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sheet.status === 'ready'
                        ? 'bg-green-500/20 text-green-400'
                        : sheet.status === 'processing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {sheet.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="text-center">
                    <span className="text-slate-400">Items</span>
                    <div className="font-medium text-white">{sheet.itemCount.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400">Size</span>
                    <div className="font-medium text-white">{formatFileSize(sheet.fileSize)}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400">Uploaded</span>
                    <div className="font-medium text-white">{sheet.uploadDate.toLocaleDateString()}</div>
                  </div>
                </div>

                {sheet.categories.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {sheet.categories.slice(0, 3).map(category => (
                        <span
                          key={category}
                          className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                        >
                          {category}
                        </span>
                      ))}
                      {sheet.categories.length > 3 && (
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                          +{sheet.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors text-sm"
                    onClick={() => handleViewFile(sheet)}
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </button>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-slate-900 rounded-lg border border-slate-700 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-white line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <span className="text-lg font-bold text-amber-400 ml-2">
                    ${product.price}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-2">
                  {product.category} • {product.vendor}
                </p>

                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    per {product.unit}
                  </span>
                  <button className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black rounded text-xs font-medium transition-colors">
                    Add to Estimate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {viewMode === 'sheets' && priceSheets.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No price sheets yet</h3>
            <p className="text-slate-400 mb-4">
              Upload your first price sheet to get started with managing your vendor catalogs.
            </p>
          </div>
        )}

        {viewMode === 'products' && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
            <p className="text-slate-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* File Viewer Modal */}
        {showFileViewer && viewingFile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  {viewingFile.fileType === 'pdf' ? (
                    <div className="h-8 w-8 bg-red-500/20 rounded flex items-center justify-center">
                      <span className="text-red-400 font-bold text-sm">PDF</span>
                    </div>
                  ) : (
                    <DocumentTextIcon className="h-8 w-8 text-blue-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-white">{viewingFile.name}</h3>
                    <p className="text-sm text-slate-400">
                      {viewingFile.vendor} • {viewingFile.fileType?.toUpperCase()} File
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFileViewer(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {viewingFile.fileType === 'pdf' ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-red-400 font-bold text-xl">PDF</span>
                    </div>
                    <h4 className="text-lg font-medium text-white mb-2">PDF Document Viewer</h4>
                    <p className="text-slate-400 mb-6">
                      This PDF file has been uploaded successfully. In a production environment, this
                      would display the actual PDF content using a PDF viewer component.
                    </p>
                    <div className="bg-slate-800 rounded-lg p-4 text-left">
                      <h5 className="font-medium text-white mb-2">File Details:</h5>
                      <div className="space-y-1 text-sm text-slate-300">
                        <p><strong>Name:</strong> {viewingFile.name}</p>
                        <p><strong>Vendor:</strong> {viewingFile.vendor}</p>
                        <p><strong>Size:</strong> {formatFileSize(viewingFile.fileSize)}</p>
                        <p><strong>Uploaded:</strong> {viewingFile.uploadDate.toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {viewingFile.status}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">Data File Viewer</h4>
                    <p className="text-slate-400 mb-6">
                      This {viewingFile.fileType?.toUpperCase()} file contains product data. In a
                      production environment, this would display the parsed product catalog.
                    </p>
                    <div className="bg-slate-800 rounded-lg p-4 text-left">
                      <h5 className="font-medium text-white mb-2">Processing Status:</h5>
                      <div className="space-y-1 text-sm text-slate-300">
                        <p><strong>Name:</strong> {viewingFile.name}</p>
                        <p><strong>Vendor:</strong> {viewingFile.vendor}</p>
                        <p><strong>Items Processed:</strong> {viewingFile.itemCount.toLocaleString()}</p>
                        <p><strong>Size:</strong> {formatFileSize(viewingFile.fileSize)}</p>
                        <p><strong>Status:</strong> {viewingFile.status}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
                <button
                  onClick={() => setShowFileViewer(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  Close
                </button>
                {viewingFile.fileType === 'pdf' && (
                  <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded transition-colors">
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

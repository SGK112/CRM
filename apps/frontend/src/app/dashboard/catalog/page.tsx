'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench,
  Building,
  Home,
  Palette,
  Lightbulb,
  Droplets,
  Zap,
  Shield,
  Package,
  Search,
  Filter,
  Star,
  Plus,
  Eye,
  ShoppingCart,
  Tag,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Award,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface CatalogItem {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  vendorName?: string;
  vendorId?: string;
  baseCost: number;
  defaultMarginPct: number;
  sellPrice: number;
  inventoryQty?: number;
  tags?: string[];
  images?: string[];
  specifications?: {
    material?: string;
    dimensions?: string;
    weight?: string;
    color?: string;
    finish?: string;
    warranty?: string;
  };
  availability?: {
    inStock: boolean;
    leadTime?: number; // days
    minimumOrder?: number;
  };
  rating?: number;
  reviews?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
}

interface VendorInfo {
  id: string;
  name: string;
  rating: number;
  phone?: string;
  location?: string;
  certifications?: string[];
}

const categoryIcons = {
  appliances: Home,
  fixtures: Lightbulb,
  plumbing: Droplets,
  electrical: Zap,
  flooring: Building,
  cabinets: Package,
  countertops: Building,
  hardware: Wrench,
  paint: Palette,
  tiles: Building,
  insulation: Shield,
  tools: Wrench,
  safety: Shield,
  other: Package
};

const categoryColors = {
  appliances: 'bg-blue-500',
  fixtures: 'bg-yellow-500', 
  plumbing: 'bg-cyan-500',
  electrical: 'bg-orange-500',
  flooring: 'bg-green-500',
  cabinets: 'bg-purple-500',
  countertops: 'bg-gray-500',
  hardware: 'bg-red-500',
  paint: 'bg-pink-500',
  tiles: 'bg-indigo-500',
  insulation: 'bg-teal-500',
  tools: 'bg-amber-500',
  safety: 'bg-emerald-500',
  other: 'bg-slate-500'
};

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'popular'>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchTerm, selectedCategory, sortBy, priceRange]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data with realistic construction materials
      const mockItems: CatalogItem[] = [
        {
          _id: '1',
          sku: 'KIT-CAB-001',
          name: 'Premium Shaker Kitchen Cabinets',
          description: 'Solid wood construction with soft-close hinges and premium hardware. Perfect for modern kitchen renovations.',
          category: 'cabinets',
          subcategory: 'kitchen',
          vendorName: 'Premier Cabinet Co.',
          baseCost: 180,
          defaultMarginPct: 40,
          sellPrice: 252,
          inventoryQty: 24,
          tags: ['premium', 'kitchen', 'soft-close', 'wood'],
          images: ['/api/placeholder/400/300'],
          specifications: {
            material: 'Solid maple wood',
            dimensions: '30" W x 24" D x 34.5" H',
            finish: 'Natural stain',
            warranty: '10 years'
          },
          availability: {
            inStock: true,
            leadTime: 14,
            minimumOrder: 5
          },
          rating: 4.8,
          reviews: 156,
          isPopular: true,
          isFeatured: true
        },
        {
          _id: '2',
          sku: 'COUN-QTZ-001',
          name: 'Quartz Countertop - Calacatta White',
          description: 'Premium engineered quartz with natural stone appearance. Stain and scratch resistant.',
          category: 'countertops',
          subcategory: 'kitchen',
          vendorName: 'Stone Masters Inc.',
          baseCost: 85,
          defaultMarginPct: 45,
          sellPrice: 123.25,
          inventoryQty: 156,
          tags: ['quartz', 'premium', 'stain-resistant', 'white'],
          images: ['/api/placeholder/400/300'],
          specifications: {
            material: 'Engineered quartz',
            dimensions: '12" x 12" tiles',
            finish: 'Polished',
            warranty: '15 years'
          },
          availability: {
            inStock: true,
            leadTime: 7,
            minimumOrder: 10
          },
          rating: 4.9,
          reviews: 203,
          isPopular: true
        },
        {
          _id: '3',
          sku: 'FIX-LED-001',
          name: 'LED Recessed Lighting Kit',
          description: 'Energy-efficient LED recessed lights. Dimmable with warm white color temperature.',
          category: 'fixtures',
          subcategory: 'lighting',
          vendorName: 'Bright Solutions LLC',
          baseCost: 45,
          defaultMarginPct: 60,
          sellPrice: 72,
          inventoryQty: 89,
          tags: ['LED', 'energy-efficient', 'dimmable', 'recessed'],
          images: ['/api/placeholder/400/300'],
          specifications: {
            material: 'Aluminum housing',
            dimensions: '6" diameter',
            color: 'Warm white (3000K)',
            warranty: '5 years'
          },
          availability: {
            inStock: true,
            leadTime: 3,
            minimumOrder: 1
          },
          rating: 4.6,
          reviews: 89,
          isPopular: false
        },
        {
          _id: '4',
          sku: 'PLUMB-FAU-001',
          name: 'Brushed Nickel Kitchen Faucet',
          description: 'Pull-down spray faucet with ceramic disc valves. Commercial-grade construction.',
          category: 'plumbing',
          subcategory: 'kitchen',
          vendorName: 'AquaFlow Systems',
          baseCost: 120,
          defaultMarginPct: 50,
          sellPrice: 180,
          inventoryQty: 34,
          tags: ['brushed-nickel', 'pull-down', 'commercial-grade', 'ceramic'],
          images: ['/api/placeholder/400/300'],
          specifications: {
            material: 'Solid brass',
            finish: 'Brushed nickel',
            warranty: 'Lifetime limited'
          },
          availability: {
            inStock: true,
            leadTime: 5,
            minimumOrder: 1
          },
          rating: 4.7,
          reviews: 124,
          isPopular: true
        },
        {
          _id: '5',
          sku: 'TILE-POR-001',
          name: 'Large Format Porcelain Tiles',
          description: 'Durable porcelain tiles with wood-look finish. Perfect for high-traffic areas.',
          category: 'tiles',
          subcategory: 'flooring',
          vendorName: 'Tile & Stone Depot',
          baseCost: 8.50,
          defaultMarginPct: 55,
          sellPrice: 13.18,
          inventoryQty: 2400,
          tags: ['porcelain', 'wood-look', 'large-format', 'durable'],
          images: ['/api/placeholder/400/300'],
          specifications: {
            material: 'Porcelain',
            dimensions: '12" x 48"',
            finish: 'Matte wood texture',
            warranty: '20 years'
          },
          availability: {
            inStock: true,
            leadTime: 10,
            minimumOrder: 50
          },
          rating: 4.5,
          reviews: 67,
          isPopular: false
        }
      ];

      setItems(mockItems);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      setError('Failed to load catalog items');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesPrice = item.sellPrice >= priceRange[0] && item.sellPrice <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.sellPrice - b.sellPrice;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  };

  const categories = useMemo(() => {
    const allCategories = Array.from(new Set(items.map(item => item.category))).sort();
    return [
      { id: 'all', name: 'All Categories', count: items.length },
      ...allCategories.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: items.filter(item => item.category === cat).length
      }))
    ];
  }, [items]);

  const stats = useMemo(() => {
    const totalItems = filteredItems.length;
    const avgPrice = filteredItems.length > 0 
      ? filteredItems.reduce((sum, item) => sum + item.sellPrice, 0) / filteredItems.length 
      : 0;
    const inStockItems = filteredItems.filter(item => item.availability?.inStock).length;
    const featuredItems = filteredItems.filter(item => item.isFeatured).length;
    
    return { totalItems, avgPrice, inStockItems, featuredItems };
  }, [filteredItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">
            Material Catalog
          </h1>
          <p className="text-gray-800 dark:text-gray-200 mt-1">
            Browse premium construction materials from trusted vendors
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Request Material
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Avg Price</p>
              <p className="text-2xl font-bold text-green-600">${stats.avgPrice.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">In Stock</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inStockItems}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-300">Featured</p>
              <p className="text-2xl font-bold text-purple-600">{stats.featuredItems}</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const IconComponent = categoryIcons[category.id as keyof typeof categoryIcons] || Package;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.name} ({category.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Materials
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="popular">Most Popular</option>
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (Low to High)</option>
              <option value="rating">Rating (High to Low)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              View Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Grid/List */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }`}>
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer ${
              viewMode === 'list' ? 'p-4' : 'overflow-hidden'
            }`}
            onClick={() => {
              setSelectedItem(item);
              setShowItemModal(true);
            }}
          >
            {viewMode === 'grid' ? (
              <>
                {/* Product Image */}
                <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-800 dark:text-gray-300">
                        {item.vendorName}
                      </p>
                    </div>
                    
                    {item.isFeatured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-800 dark:text-gray-300 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {item.rating && (
                        <>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{item.rating}</span>
                          <span className="text-sm text-gray-700">({item.reviews})</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {item.availability?.inStock ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-700">
                        {item.availability?.inStock ? 'In Stock' : `${item.availability?.leadTime} days`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        ${item.sellPrice}
                      </span>
                      <span className="text-sm text-gray-700 ml-2">
                        per unit
                      </span>
                    </div>
                    
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      Add to Quote
                    </button>
                  </div>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-800 dark:text-gray-300">
                        {item.vendorName} • SKU: {item.sku}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-300 mt-1">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${item.sellPrice}
                      </div>
                      <div className="text-sm text-gray-700">per unit</div>
                      {item.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{item.rating} ({item.reviews})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No materials found
          </h3>
          <p className="text-gray-800 dark:text-gray-300 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

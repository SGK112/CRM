'use client';

import { useState } from 'react';
import Layout from '../../../components/Layout';
import {
  PencilSquareIcon,
  PhotoIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  CubeIcon,
  AdjustmentsHorizontalIcon,
  ShareIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  PlusIcon,
  EyeIcon,
  PaintBrushIcon,
  HomeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface DesignTemplate {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'renovation';
  category: 'kitchen' | 'bathroom' | 'living' | 'bedroom' | 'office' | 'full-house' | 'addition';
  thumbnail: string;
  description: string;
  features: string[];
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export default function DesignerPage() {
  const [activeView, setActiveView] = useState<'templates' | 'new' | 'projects'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const designTemplates: DesignTemplate[] = [
    {
      id: '1',
      name: 'Modern Kitchen Remodel',
      type: 'renovation',
      category: 'kitchen',
      thumbnail: '/api/placeholder/400/300',
      description: 'Contemporary kitchen design with island and modern appliances',
      features: ['Large Island', 'Quartz Countertops', 'Custom Cabinets', 'Pendant Lighting'],
      sqft: 250
    },
    {
      id: '2',
      name: 'Luxury Master Bathroom',
      type: 'renovation',
      category: 'bathroom',
      thumbnail: '/api/placeholder/400/300',
      description: 'Spa-like master bathroom with walk-in shower and soaking tub',
      features: ['Walk-in Shower', 'Soaking Tub', 'Double Vanity', 'Heated Floors'],
      sqft: 180
    },
    {
      id: '3',
      name: 'Open Concept Living',
      type: 'renovation',
      category: 'living',
      thumbnail: '/api/placeholder/400/300',
      description: 'Open floor plan combining living, dining, and kitchen spaces',
      features: ['Vaulted Ceilings', 'Hardwood Floors', 'Built-in Storage', 'Large Windows'],
      sqft: 850
    },
    {
      id: '4',
      name: 'Home Office Addition',
      type: 'renovation',
      category: 'office',
      thumbnail: '/api/placeholder/400/300',
      description: 'Dedicated home office space with built-in storage',
      features: ['Built-in Desk', 'Custom Shelving', 'Natural Light', 'Sound Insulation'],
      sqft: 120
    },
    {
      id: '5',
      name: 'Craftsman Style House',
      type: 'residential',
      category: 'full-house',
      thumbnail: '/api/placeholder/400/300',
      description: 'Traditional craftsman home with modern amenities',
      features: ['Covered Porch', 'Hardwood Floors', 'Crown Molding', 'Built-ins'],
      sqft: 2400,
      bedrooms: 3,
      bathrooms: 2
    },
    {
      id: '6',
      name: 'Modern Farmhouse',
      type: 'residential',
      category: 'full-house',
      thumbnail: '/api/placeholder/400/300',
      description: 'Contemporary farmhouse design with rustic elements',
      features: ['Shiplap Walls', 'Barn Doors', 'Farmhouse Sink', 'Exposed Beams'],
      sqft: 2800,
      bedrooms: 4,
      bathrooms: 3
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Squares2X2Icon },
    { id: 'kitchen', name: 'Kitchen', icon: HomeIcon },
    { id: 'bathroom', name: 'Bathroom', icon: WrenchScrewdriverIcon },
    { id: 'living', name: 'Living Space', icon: HomeIcon },
    { id: 'bedroom', name: 'Bedroom', icon: HomeIcon },
    { id: 'office', name: 'Office', icon: BuildingOfficeIcon },
    { id: 'full-house', name: 'Full House', icon: HomeIcon },
    { id: 'addition', name: 'Addition', icon: PlusIcon }
  ];

  const designTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'residential', name: 'Residential' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'renovation', name: 'Renovation' }
  ];

  const filteredTemplates = designTemplates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const typeMatch = selectedType === 'all' || template.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const renderTemplateCard = (template: DesignTemplate) => (
    <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-w-16 aspect-h-12 bg-gray-200">
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <PencilSquareIcon className="h-12 w-12 text-blue-500" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            template.type === 'residential' ? 'bg-green-100 text-green-800' :
            template.type === 'commercial' ? 'bg-blue-100 text-blue-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {template.type}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
        
        {template.sqft && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>{template.sqft} sq ft</span>
            {template.bedrooms && (
              <>
                <span className="mx-2">•</span>
                <span>{template.bedrooms} bed</span>
              </>
            )}
            {template.bathrooms && (
              <>
                <span className="mx-2">•</span>
                <span>{template.bathrooms} bath</span>
              </>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                {feature}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                +{template.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            Use Template
          </button>
          <button className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTemplatesView = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Project Type</label>
            <div className="space-y-2">
              {designTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(renderTemplateCard)}
      </div>
    </div>
  );

  const renderNewDesignView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <PencilSquareIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Design</h3>
        <p className="text-gray-600 mb-6">Start with a blank canvas or choose from our professional templates</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button className="p-6 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
            <PlusIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Blank Canvas</h4>
            <p className="text-sm text-gray-600">Start from scratch with our design tools</p>
          </button>
          
          <button className="p-6 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
            <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Import CAD File</h4>
            <p className="text-sm text-gray-600">Upload existing blueprints or CAD files</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Designer Pro Integration</h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <HomeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Professional Design Tools</h4>
              <p className="text-sm text-gray-600 mt-1">
                Access advanced features like 3D visualization, material libraries, and professional rendering
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Launch Designer
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <CubeIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-600">3D Modeling</p>
            </div>
            <div className="text-center">
              <PaintBrushIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-600">Material Library</p>
            </div>
            <div className="text-center">
              <AdjustmentsHorizontalIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-600">Precise Tools</p>
            </div>
            <div className="text-center">
              <PhotoIcon className="mx-auto h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs text-gray-600">Photo Rendering</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Design Projects</h3>
        <p className="text-gray-600 mb-6">You haven't created any design projects yet</p>
        <button 
          onClick={() => setActiveView('new')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First Design
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Design Studio</h1>
            <p className="text-gray-600 mt-1">
              Create professional blueprints and 3D designs for your construction projects
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Import Design
            </button>
            <button 
              onClick={() => setActiveView('new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Design
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'templates', name: 'Templates', icon: Squares2X2Icon },
              { id: 'new', name: 'New Design', icon: PlusIcon },
              { id: 'projects', name: 'My Projects', icon: DocumentTextIcon }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeView === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeView === 'templates' && renderTemplatesView()}
        {activeView === 'new' && renderNewDesignView()}
        {activeView === 'projects' && renderProjectsView()}

        {/* Quick Tools */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Measure Tool</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ShareIcon className="h-8 w-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Share Design</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <PrinterIcon className="h-8 w-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Print Plans</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CloudArrowDownIcon className="h-8 w-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Export CAD</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

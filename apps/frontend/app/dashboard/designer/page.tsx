'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PencilSquareIcon,
  CubeIcon,
  PaintBrushIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  Cog6ToothIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  SwatchIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  EyeIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { getUserPlan, hasCapability } from '@/lib/plans';

interface DesignTool {
  id: string;
  name: string;
  icon: any;
  category: 'draw' | 'shape' | 'text' | 'ai';
  color: string;
}

interface DesignElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'wall' | 'door' | 'window';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
}

export default function DesignerPage() {
  const [userPlan] = useState(getUserPlan());
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [projectName, setProjectName] = useState('Kitchen Remodel - Johnson Family');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const designTools: DesignTool[] = [
    { id: 'select', name: 'Select', icon: Squares2X2Icon, category: 'draw', color: '#6B7280' },
    {
      id: 'rectangle',
      name: 'Room',
      icon: RectangleStackIcon,
      category: 'shape',
      color: '#3B82F6',
    },
    { id: 'wall', name: 'Wall', icon: HomeIcon, category: 'shape', color: '#8B5CF6' },
    { id: 'door', name: 'Door', icon: WrenchScrewdriverIcon, category: 'shape', color: '#10B981' },
    { id: 'window', name: 'Window', icon: EyeIcon, category: 'shape', color: '#F59E0B' },
    { id: 'text', name: 'Label', icon: DocumentTextIcon, category: 'text', color: '#EF4444' },
  ];

  const aiTools = [
    {
      id: 'ai-suggest',
      name: 'AI Suggestions',
      icon: SparklesIcon,
      category: 'ai',
      color: '#8B5CF6',
    },
    {
      id: 'ai-optimize',
      name: 'Optimize Layout',
      icon: LightBulbIcon,
      category: 'ai',
      color: '#F59E0B',
    },
    { id: 'ai-render', name: 'AI Render', icon: PhotoIcon, category: 'ai', color: '#EF4444' },
  ];

  const colorPalette = [
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#6B7280',
    '#1F2937',
    '#FFFFFF',
    '#FEE2E2',
    '#DBEAFE',
  ];

  useEffect(() => {
    if (hasCapability('ai.descriptions', userPlan)) {
      setAiSuggestions([
        'Consider adding an island for better workflow',
        'L-shaped layout maximizes corner space',
        'Add task lighting under cabinets',
        'Include a pantry for storage optimization',
      ]);
    }
  }, [userPlan]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTool === 'select') return;

    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: selectedTool as any,
      x: x - 25,
      y: y - 25,
      width: 50,
      height: 50,
      color: selectedColor,
      text: selectedTool === 'text' ? 'Label' : undefined,
    };

    setElements(prev => [...prev, newElement]);
    drawCanvas();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw elements
    elements.forEach(element => {
      ctx.fillStyle = element.color;
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;

      switch (element.type) {
        case 'rectangle':
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          break;
        case 'wall':
          ctx.fillRect(element.x, element.y, element.width, 10);
          ctx.strokeRect(element.x, element.y, element.width, 10);
          break;
        case 'door':
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(element.x, element.y, 30, 8);
          ctx.strokeRect(element.x, element.y, 30, 8);
          break;
        case 'window':
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(element.x, element.y, 40, 8);
          ctx.strokeRect(element.x, element.y, 40, 8);
          break;
        case 'text':
          ctx.fillStyle = element.color;
          ctx.font = '14px sans-serif';
          ctx.fillText(element.text || 'Label', element.x, element.y);
          break;
      }
    });
  };

  const handleAiGenerate = async (type: string) => {
    if (!hasCapability('ai.descriptions', userPlan)) return;

    setIsGenerating(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (type === 'ai-suggest') {
      const newSuggestions = [
        '🔥 Add a kitchen island for $3,200 (increases home value by $8,000)',
        '💡 Consider quartz countertops for durability and style',
        '🌟 Open shelving can make the space feel 30% larger',
        '⚡ Under-cabinet lighting improves functionality by 40%',
      ];
      setAiSuggestions(newSuggestions);
      setShowAiPanel(true);
    } else if (type === 'ai-optimize') {
      // Add some optimized elements
      const optimizedElements: DesignElement[] = [
        {
          id: 'island',
          type: 'rectangle',
          x: 300,
          y: 250,
          width: 120,
          height: 80,
          color: '#8B5CF6',
        },
        {
          id: 'counter1',
          type: 'rectangle',
          x: 150,
          y: 180,
          width: 200,
          height: 40,
          color: '#6B7280',
        },
        {
          id: 'counter2',
          type: 'rectangle',
          x: 450,
          y: 180,
          width: 150,
          height: 40,
          color: '#6B7280',
        },
      ];
      setElements(prev => [...prev, ...optimizedElements]);
    } else if (type === 'ai-render') {
      alert('🎨 AI Render complete! Photorealistic image saved to project gallery.');
    }

    setIsGenerating(false);
    drawCanvas();
  };

  useEffect(() => {
    drawCanvas();
  }, [elements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <PencilSquareIcon className="h-8 w-8 text-blue-600" />
            <span>AI Design Studio</span>
            {hasCapability('design.studio', userPlan) && (
              <SparklesIcon className="h-6 w-6 text-yellow-500 animate-pulse" />
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Professional design tools with AI assistance
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <ShareIcon className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Toolbar */}
        <div className="col-span-2 space-y-4">
          {/* Basic Tools */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Basic Tools
            </h3>
            <div className="space-y-2">
              {designTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedTool === tool.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tool.icon className="h-4 w-4" />
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Tools */}
          {hasCapability('ai.descriptions', userPlan) && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 text-purple-600" />
                AI Tools
              </h3>
              <div className="space-y-2">
                {aiTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleAiGenerate(tool.id)}
                    disabled={isGenerating}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <tool.icon className="h-4 w-4" />
                    )}
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Palette */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Colors</h3>
            <div className="grid grid-cols-5 gap-2">
              {colorPalette.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 ${
                    selectedColor === color
                      ? 'border-gray-900 dark:border-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="col-span-7">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Design Canvas</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setElements([])}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  Clear
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                  Export
                </button>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleCanvasClick}
                className="cursor-crosshair bg-white"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Selected tool: <span className="font-semibold">{selectedTool}</span> | Click on canvas
              to add elements | Elements: {elements.length}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="col-span-3 space-y-4">
          {/* Project Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Project Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Room Type</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Kitchen</option>
                  <option>Bathroom</option>
                  <option>Living Room</option>
                  <option>Bedroom</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Dimensions</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="12 ft"
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="15 ft"
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {hasCapability('ai.descriptions', userPlan) &&
            (showAiPanel || aiSuggestions.length > 0) && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-600" />
                  AI Suggestions
                </h3>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAiGenerate('ai-suggest')}
                  className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center space-x-2"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>Get More Suggestions</span>
                </button>
              </div>
            )}

          {/* Layer Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Elements</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {elements.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No elements added yet
                </p>
              ) : (
                elements.map((element, index) => (
                  <div
                    key={element.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: element.color }}
                      ></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {element.type}
                      </span>
                    </div>
                    <button
                      onClick={() => setElements(prev => prev.filter(el => el.id !== element.id))}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

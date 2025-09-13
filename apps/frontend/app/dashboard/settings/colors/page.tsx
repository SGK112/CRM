'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { ArrowPathIcon, CheckIcon, EyeIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { ColorTheme, useColors } from '../../../../src/components/ColorProvider';
import './preview.css';

const defaultThemes: ColorTheme[] = [
  {
    name: 'Remodely Orange (Current)',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      accent: '#fb923c',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  {
    name: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  {
    name: 'Forest Green',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#6b7280',
      border: '#d1fae5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  {
    name: 'Royal Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#ffffff',
      surface: '#faf5ff',
      text: '#581c87',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  {
    name: 'Sunset Red',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f87171',
      background: '#ffffff',
      surface: '#fef2f2',
      text: '#7f1d1d',
      textSecondary: '#6b7280',
      border: '#fecaca',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
];

export default function ColorsPage() {
  const { currentTheme, setTheme, saveTheme, isLoading } = useColors();
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(currentTheme);
  const [customColors, setCustomColors] = useState(currentTheme.colors);
  const [previewMode, setPreviewMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedTheme(currentTheme);
    setCustomColors(currentTheme.colors);
  }, [currentTheme]);

  useEffect(() => {
    setCustomColors(selectedTheme.colors);
  }, [selectedTheme]);

  const applyPreview = () => {
    const root = document.documentElement;
    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--preview-${key}`, value);
    });
    document.body.classList.add('color-preview-active');
    setPreviewMode(true);
  };

  const removePreview = () => {
    const root = document.documentElement;
    Object.keys(customColors).forEach(key => {
      root.style.removeProperty(`--preview-${key}`);
    });
    document.body.classList.remove('color-preview-active');
    setPreviewMode(false);
  };

  const saveColors = async () => {
    setSaving(true);
    try {
      const newTheme: ColorTheme = {
        name: selectedTheme.name === 'Custom' ? 'Custom' : `${selectedTheme.name} (Customized)`,
        colors: customColors,
      };

      await saveTheme(newTheme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      // Handle error - maybe show a toast
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setSelectedTheme(defaultThemes[0]);
    setCustomColors(defaultThemes[0].colors);
    removePreview();
    localStorage.removeItem('customColors');
    localStorage.removeItem('selectedTheme');
  };

  const ColorInput = ({
    label,
    colorKey,
  }: {
    label: string;
    colorKey: keyof typeof customColors;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex items-center space-x-3">
        <div
          className="w-12 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
          style={{ backgroundColor: customColors[colorKey] }}
        />
        <input
          type="color"
          value={customColors[colorKey]}
          onChange={e => setCustomColors(prev => ({ ...prev, [colorKey]: e.target.value }))}
          className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={customColors[colorKey]}
          onChange={e => setCustomColors(prev => ({ ...prev, [colorKey]: e.target.value }))}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Color Customization"
        subtitle="Customize your CRM's color scheme and branding"
        titleClassName="text-brand-700 dark:text-brand-400"
      />

      {/* Preview Banner */}
      {previewMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <EyeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Preview Mode Active - Changes are temporary
              </span>
            </div>
            <button
              onClick={removePreview}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Theme Presets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Theme Presets
            </h3>
            <div className="space-y-3">
              {defaultThemes.map(theme => (
                <button
                  key={theme.name}
                  onClick={() => setSelectedTheme(theme)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedTheme.name === theme.name
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {theme.name}
                    </span>
                    {selectedTheme.name === theme.name && (
                      <CheckIcon className="h-5 w-5 text-brand-600" />
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.success }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={applyPreview}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                <span>Preview Changes</span>
              </button>
              <button
                onClick={saveColors}
                disabled={saving}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  saved ? 'bg-green-600 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50'
                }`}
              >
                {saved ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Saved!</span>
                  </>
                ) : saving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <SwatchIcon className="h-4 w-4" />
                    <span>Save Theme</span>
                  </>
                )}
              </button>
              <button
                onClick={resetToDefault}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Customize Colors
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                  Brand Colors
                </h4>
                <ColorInput label="Primary" colorKey="primary" />
                <ColorInput label="Secondary" colorKey="secondary" />
                <ColorInput label="Accent" colorKey="accent" />
              </div>

              {/* Surface Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                  Surface Colors
                </h4>
                <ColorInput label="Background" colorKey="background" />
                <ColorInput label="Surface" colorKey="surface" />
                <ColorInput label="Border" colorKey="border" />
              </div>

              {/* Text Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                  Text Colors
                </h4>
                <ColorInput label="Primary Text" colorKey="text" />
                <ColorInput label="Secondary Text" colorKey="textSecondary" />
              </div>

              {/* Status Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                  Status Colors
                </h4>
                <ColorInput label="Success" colorKey="success" />
                <ColorInput label="Warning" colorKey="warning" />
                <ColorInput label="Error" colorKey="error" />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Preview</h3>
            <div className="space-y-4">
              {/* Header Preview */}
              <div
                className="p-4 rounded-lg border-2"
                style={{
                  backgroundColor: customColors.surface,
                  borderColor: customColors.border,
                }}
              >
                <h4 className="text-lg font-semibold mb-2" style={{ color: customColors.primary }}>
                  Dashboard Page Title
                </h4>
                <p style={{ color: customColors.textSecondary }}>
                  This is how your page headers will look with the selected colors.
                </p>
              </div>

              {/* Button Preview */}
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: customColors.secondary }}
                >
                  Secondary Button
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: customColors.success }}
                >
                  Success Button
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: customColors.error }}
                >
                  Error Button
                </button>
              </div>

              {/* Card Preview */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: customColors.background,
                  borderColor: customColors.border,
                }}
              >
                <h5 className="font-semibold mb-2" style={{ color: customColors.text }}>
                  Sample Card
                </h5>
                <p style={{ color: customColors.textSecondary }}>
                  This shows how cards and content areas will appear with your color choices.
                </p>
                <div className="mt-3 flex space-x-2">
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: customColors.accent + '20',
                      color: customColors.accent,
                    }}
                  >
                    Tag
                  </span>
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: customColors.success + '20',
                      color: customColors.success,
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

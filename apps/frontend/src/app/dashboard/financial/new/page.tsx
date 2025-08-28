'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Receipt, 
  Save, 
  Send, 
  Bot,
  Zap,
  ArrowLeft 
} from 'lucide-react';
import EstimateInvoiceToggle from '../../../../components/EstimateInvoiceToggle';
// import AIWritingAssistant from '../../../components/AIWritingAssistant';
// import { quickBooksAPI, QuickBooksService } from '../../../lib/quickbooks';

interface LineItem {
  id: string;
  category: 'labor' | 'materials' | 'permits' | 'equipment' | 'overhead' | 'other';
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

type DocumentMode = 'estimate' | 'invoice';

export default function NewFinancialDocumentPage() {
  const [mode, setMode] = useState<DocumentMode>('estimate');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qbEnabled, setQbEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    clientName: '',
    projectType: 'kitchen' as 'kitchen' | 'bathroom' | 'full-house' | 'addition' | 'exterior' | 'commercial',
    projectScope: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    markup: 20,
    notes: '',
    terms: '',
    // Estimate specific
    validUntil: '',
    // Invoice specific
    invoiceNumber: '',
    dueDate: '',
    tax: 0,
  });

  const [items, setItems] = useState<LineItem[]>([
    {
      id: '1',
      category: 'labor',
      description: '',
      quantity: 1,
      unit: 'hours',
      unitCost: 0,
      totalCost: 0
    }
  ]);

  useEffect(() => {
    checkQuickBooksStatus();
    generateDefaults();
  }, [mode]);

  useEffect(() => {
    calculateTotals();
  }, [items, formData.markup, formData.tax]);

  const checkQuickBooksStatus = async () => {
    try {
      const settings = localStorage.getItem('integrationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setQbEnabled(parsed.quickbooks?.enabled || false);
      }
    } catch (error) {
      console.error('Failed to check QuickBooks status:', error);
    }
  };

  const generateDefaults = () => {
    const today = new Date();
    const validUntil = new Date();
    validUntil.setDate(today.getDate() + 30);
    
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);

    setFormData(prev => ({
      ...prev,
      validUntil: validUntil.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      invoiceNumber: mode === 'invoice' ? `INV-${Date.now()}` : '',
      title: mode === 'estimate' ? 'New Estimate' : 'New Invoice',
      terms: mode === 'estimate' 
        ? 'Payment: 50% deposit, 25% at rough-in, 25% on completion. All materials guaranteed.'
        : 'Net 30 payment terms. Late fees apply after 30 days.'
    }));
  };

  const calculateTotals = () => {
    // Recalculate line totals to ensure accuracy
    const recalculatedSubtotal = items.reduce((sum, item) => {
      const lineTotal = Number((item.quantity * item.unitCost).toFixed(2));
      return sum + lineTotal;
    }, 0);
    
    const subtotal = Number(recalculatedSubtotal.toFixed(2));
    const markupAmount = Number(((subtotal * formData.markup) / 100).toFixed(2));
    const taxAmount = mode === 'invoice' ? Number(((subtotal + markupAmount) * (formData.tax / 100)).toFixed(2)) : 0;
    const total = Number((subtotal + markupAmount + taxAmount).toFixed(2));
    
    return {
      subtotal,
      markupAmount,
      taxAmount,
      total
    };
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      category: 'materials',
      description: '',
      quantity: 1,
      unit: 'each',
      unitCost: 0,
      totalCost: 0
    };
    setItems([...items, newItem]);
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Always recalculate totalCost when quantity or unitCost changes
          if (field === 'quantity' || field === 'unitCost') {
            const quantity = field === 'quantity' ? value : updatedItem.quantity;
            const unitCost = field === 'unitCost' ? value : updatedItem.unitCost;
            updatedItem.totalCost = Number((quantity * unitCost).toFixed(2));
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSave = async (sendAfterSave = false) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const totals = calculateTotals();
      
      const documentData = {
        ...formData,
        type: mode,
        items,
        totalAmount: totals.total,
        subtotal: totals.subtotal,
        markupAmount: totals.markupAmount,
        taxAmount: totals.taxAmount,
        status: sendAfterSave ? 'sent' : 'draft'
      };

      // Validate for QuickBooks if enabled
      if (qbEnabled) {
        // const validation = mode === 'estimate' 
        //   ? QuickBooksService.validateEstimateForSync(documentData)
        //   : QuickBooksService.validateInvoiceForSync(documentData);
        
        // if (!validation.valid) {
        //   setError(`QuickBooks validation failed: ${validation.errors.join(', ')}`);
        //   return;
        // }
      }

      const response = await fetch(`/api/${mode}s`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(documentData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`${mode === 'estimate' ? 'Estimate' : 'Invoice'} ${sendAfterSave ? 'saved and sent' : 'saved'} successfully!`);
        
        // Auto-sync to QuickBooks if enabled
        if (qbEnabled && result.id) {
          try {
            // if (mode === 'estimate') {
            //   await quickBooksAPI.syncEstimate(result.id);
            // } else {
            //   await quickBooksAPI.syncInvoice(result.id);
            // }
          } catch (qbError) {
            console.warn('QuickBooks sync failed:', qbError);
          }
        }

        // Redirect after success
        setTimeout(() => {
          window.location.href = `/dashboard/${mode}s/${result.id}`;
        }, 2000);
      } else {
        setError(result.message || `Failed to save ${mode}`);
      }
    } catch (error) {
      setError(`Failed to save ${mode}`);
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/dashboard/financial'}
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Financial Hub
          </button>
          <EstimateInvoiceToggle 
            currentMode={mode} 
            onModeChange={setMode}
            className="ml-4"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {qbEnabled && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">QB Auto-Sync</span>
            </div>
          )}
          
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            Save & Send
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {mode === 'estimate' ? 'Estimate' : 'Invoice'} Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter ${mode} title`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Type
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="full-house">Full House</option>
                  <option value="addition">Addition</option>
                  <option value="exterior">Exterior</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              {mode === 'estimate' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Scope
              </label>
              <textarea
                value={formData.projectScope}
                onChange={(e) => setFormData(prev => ({ ...prev, projectScope: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the project scope and requirements"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h2>
              <button
                onClick={addLineItem}
                className="inline-flex items-center gap-2 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Enter item description..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="labor">Labor</option>
                      <option value="materials">Materials</option>
                      <option value="permits">Permits</option>
                      <option value="equipment">Equipment</option>
                      <option value="overhead">Overhead</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      placeholder="Unit"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit Cost
                    </label>
                    <input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => updateLineItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total
                    </label>
                    <div className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white">
                      ${(item.quantity * item.unitCost).toFixed(2)}
                    </div>
                  </div>
                  
                  {items.length > 1 && (
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Internal notes and comments"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Payment terms, warranties, and conditions"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
              </div>
              
              {formData.markup > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Markup ({formData.markup}%):</span>
                  <span className="font-medium">${totals.markupAmount.toFixed(2)}</span>
                </div>
              )}
              
              {mode === 'invoice' && formData.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax ({formData.tax}%):</span>
                  <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              <hr className="border-gray-200 dark:border-gray-600" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-brand-600">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Markup %
                </label>
                <input
                  type="number"
                  value={formData.markup}
                  onChange={(e) => setFormData(prev => ({ ...prev, markup: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              {mode === 'invoice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax %
                  </label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
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

      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>{success}</span>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-2 text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface ElevenLabsWidgetComponentProps {
  client: Client;
  workspaceId: string;
  onCallInitiated?: (callInfo: any) => void;
}

interface WidgetConfig {
  success: boolean;
  callType: string;
  voiceProvider: string;
  agentId: string;
  widget: {
    embedCode: string;
    scriptSrc: string;
    instructions: string[];
    clientInfo: {
      name: string;
      phone: string;
      purpose: string;
      context: string;
    };
  };
  advantages: string[];
}

const ElevenLabsWidgetComponent: React.FC<ElevenLabsWidgetComponentProps> = ({
  client,
  workspaceId,
  onCallInitiated
}) => {
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [purpose, setPurpose] = useState('appointment_scheduling');
  const [context, setContext] = useState('');

  // Load the ElevenLabs widget script dynamically
  useEffect(() => {
    if (showWidget && widgetConfig) {
      const script = document.createElement('script');
      script.src = widgetConfig.widget.scriptSrc;
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('✅ ElevenLabs widget script loaded successfully');
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load ElevenLabs widget script');
      };

      document.head.appendChild(script);

      // Cleanup function
      return () => {
        try {
          document.head.removeChild(script);
        } catch (e) {
          // Script may already be removed
        }
      };
    }
  }, [showWidget, widgetConfig]);

  const initiateWidgetCall = async () => {
    setIsLoading(true);
    
    try {
      const payload = {
        phoneNumber: client.phone,
        clientName: client.name,
        clientId: client.id,
        workspaceId,
        purpose: purpose,
        context: context || `CRM interaction with ${client.name}. ${client.notes || ''}`
      };

      console.log('🎯 Initiating widget call with payload:', payload);

      const response = await fetch('/api/voice-agent/elevenlabs-widget-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const config = await response.json();
      console.log('🎉 Widget configuration received:', config);
      
      setWidgetConfig(config);
      setShowWidget(true);
      
      // Only call onCallInitiated if it exists
      onCallInitiated?.(config);

    } catch (error) {
      console.error('❌ Widget call setup failed:', error);
      alert('Failed to set up widget call. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const purposeOptions = [
    { value: 'appointment_scheduling', label: 'Schedule Appointment' },
    { value: 'quote_follow_up', label: 'Quote Follow-up' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'sales_inquiry', label: 'Sales Inquiry' },
    { value: 'project_update', label: 'Project Update' }
  ];

  return (
    <div className="space-y-6">
      {/* Client Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
            <p className="text-gray-600">{client.phone}</p>
            {client.email && <p className="text-gray-600">{client.email}</p>}
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Widget Call</span>
          </div>
        </div>
        
        {client.notes && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-700">{client.notes}</p>
          </div>
        )}

        {!showWidget && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Purpose
              </label>
              <select 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {purposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Any specific information Sarah should know for this conversation..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              onClick={initiateWidgetCall}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting up widget...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <MessageSquare className="h-4 w-4" />
                  Start Widget Conversation
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Widget Configuration Display */}
      {widgetConfig && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">ElevenLabs Widget Ready</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Advantages of Widget Approach:</h4>
              <ul className="space-y-1">
                {widgetConfig.advantages.map((advantage, index) => (
                  <li key={index} className="text-sm text-green-700">{advantage}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
              <ol className="space-y-1">
                {widgetConfig.widget.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-blue-700">{index + 1}. {instruction}</li>
                ))}
              </ol>
            </div>

            {/* ElevenLabs Widget Embed */}
            {showWidget && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: widgetConfig.widget.embedCode 
                  }}
                />
                <p className="text-sm text-gray-500 mt-4">
                  ElevenLabs ConvAI Widget will appear above when script loads
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Client Information Passed to Agent:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {widgetConfig.widget.clientInfo.name}</p>
                <p><strong>Phone:</strong> {widgetConfig.widget.clientInfo.phone}</p>
                <p><strong>Purpose:</strong> {widgetConfig.widget.clientInfo.purpose}</p>
                <p><strong>Context:</strong> {widgetConfig.widget.clientInfo.context}</p>
              </div>
            </div>

            <button 
              onClick={() => setShowWidget(false)}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reset Widget
            </button>
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-gray-600" />
          <h4 className="font-medium text-gray-800">How Widget Approach Works</h4>
        </div>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Widget loads directly in browser - no phone call setup needed</p>
          <p>• Customer can speak directly to Sarah agent through their computer/phone browser</p>
          <p>• Eliminates Twilio complexity and API management overhead</p>
          <p>• Provides immediate, natural conversation experience</p>
          <p>• Perfect for in-person consultations or remote customer interactions</p>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsWidgetComponent;

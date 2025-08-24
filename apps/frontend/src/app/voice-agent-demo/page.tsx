import React from 'react';
import ElevenLabsCallComponent from '@/components/voice/ElevenLabsCallComponent-Fixed';
import ElevenLabsWidgetComponent from '@/components/voice/ElevenLabsWidgetComponent';

// Sample client data for demonstration
const sampleClient = {
  id: 'client_sg_001',
  name: 'Maria Rodriguez',
  phone: '4802555887',
  email: 'maria.rodriguez@email.com',
  address: '1234 Desert View Dr, Phoenix, AZ 85028',
  notes: 'Interested in granite countertops for kitchen remodel. Budget range $3000-5000. Prefers darker colors.'
};

const workspaceId = 'surprise_granite_workspace';

export default function VoiceAgentDemo() {
  const handleCallInitiated = (callInfo: any) => {
    console.log('Call setup completed:', callInfo);
    // In a real CRM, you would log this to the client's activity feed
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Remodely CRM - AI Voice Agent
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Surprise Granite can now use AI voice agent Sarah to automatically call customers, 
            schedule appointments, follow up on quotes, and close sales with high-quality ElevenLabs voices.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why ElevenLabs AI Voice Agent?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-100 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium text-gray-900 mb-1">Higher Conversion</h3>
              <p className="text-sm text-gray-600">Natural, human-like conversations that build trust and close more sales</p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900 mb-1">Cost Effective</h3>
              <p className="text-sm text-gray-600">24/7 availability without staffing costs or human limitations</p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-medium text-gray-900 mb-1">Instant Response</h3>
              <p className="text-sm text-gray-600">Immediate follow-up on leads while interest is highest</p>
            </div>
          </div>
        </div>

        {/* Sarah Agent Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Meet Sarah - Your AI Sales Specialist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Expertise:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Granite countertop specialist</li>
                <li>• Surprise Granite product knowledge</li>
                <li>• Installation process expert</li>
                <li>• Pricing and quote assistance</li>
                <li>• Appointment scheduling</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Capabilities:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Natural conversation flow</li>
                <li>• Objection handling</li>
                <li>• Lead qualification</li>
                <li>• Follow-up scheduling</li>
                <li>• CRM integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo: AI Voice Call Options</h2>
          <p className="text-gray-600 mb-6">
            Choose between traditional phone calls or the new widget-based approach for direct browser conversations.
          </p>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
                Widget Conversation
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Phone Call
              </button>
            </nav>
          </div>

          {/* Widget Demo */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-800 mb-2">🎯 NEW: Widget Approach (Recommended)</h3>
              <p className="text-sm text-blue-700">
                Direct browser-to-agent conversation. No phone calls needed. Instant connection with natural ElevenLabs voice.
              </p>
            </div>
            <ElevenLabsWidgetComponent 
              client={sampleClient}
              workspaceId={workspaceId}
              onCallInitiated={handleCallInitiated}
            />
          </div>

          {/* Traditional Call Demo */}
          <div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-yellow-800 mb-2">📞 Traditional Phone Call</h3>
              <p className="text-sm text-yellow-700">
                Calls the customer's phone number. Requires phone system setup and may have connectivity issues.
              </p>
            </div>
            <ElevenLabsCallComponent 
              client={sampleClient}
              workspaceId={workspaceId}
              onCallInitiated={handleCallInitiated}
            />
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Steps for Your Business</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h3 className="font-medium text-gray-900">Set Up ElevenLabs Agent</h3>
                <p className="text-gray-600 text-sm">Configure Sarah agent with your business knowledge and phone calling capabilities</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h3 className="font-medium text-gray-900">Integrate with CRM</h3>
                <p className="text-gray-600 text-sm">Add voice call buttons to your client management interface</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h3 className="font-medium text-gray-900">Train Your Team</h3>
                <p className="text-gray-600 text-sm">Show staff how to use the system for maximum effectiveness</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <h3 className="font-medium text-gray-900">Monitor and Optimize</h3>
                <p className="text-gray-600 text-sm">Track call outcomes and refine agent responses for better results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Phone, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Simple toast function for now
const toast = (options: { title: string; description: string; variant?: string }) => {
  console.log(`Toast: ${options.title} - ${options.description}`);
};

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface ElevenLabsCallProps {
  client: Client;
  workspaceId: string;
  onCallInitiated?: (callInfo: any) => void;
}

export function ElevenLabsCallComponent({
  client,
  workspaceId,
  onCallInitiated,
}: ElevenLabsCallProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);

  const defaultPurposes = [
    'Schedule granite countertop consultation',
    'Follow up on quote request',
    'Discuss installation timeline',
    'Address customer concerns',
    'Book site measurement appointment',
    'Confirm installation date',
  ];

  const handleInitiateCall = async () => {
    if (!purpose.trim()) {
      toast({
        title: 'Purpose Required',
        description: 'Please specify the purpose of this call',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/voice-agent/elevenlabs-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.name,
          phoneNumber: client.phone,
          workspaceId,
          purpose,
          context:
            context ||
            `Client: ${client.name}, Phone: ${client.phone}${client.email ? `, Email: ${client.email}` : ''}${client.address ? `, Address: ${client.address}` : ''}${client.notes ? `, Notes: ${client.notes}` : ''}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCallResult(result);
        onCallInitiated?.(result);
        toast({
          title: 'Call Setup Ready',
          description: 'ElevenLabs call instructions generated successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to setup call');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to setup ElevenLabs call';
      toast({
        title: 'Call Setup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Instructions copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            ElevenLabs AI Voice Call Setup
          </CardTitle>
          <CardDescription>
            Initiate a high-quality AI voice call with Sarah (Surprise Granite specialist) to:{' '}
            {client.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Client Name</Label>
              <Input value={client.name} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label className="text-sm font-medium">Phone Number</Label>
              <Input value={client.phone} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div>
            <Label htmlFor="purpose" className="text-sm font-medium">
              Call Purpose *
            </Label>
            <select
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select call purpose...</option>
              {defaultPurposes.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="custom">Custom (specify below)</option>
            </select>
            {purpose === 'custom' && (
              <Input
                className="mt-2"
                placeholder="Enter custom call purpose..."
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
              />
            )}
          </div>

          <div>
            <Label htmlFor="context" className="text-sm font-medium">
              Additional Context (Optional)
            </Label>
            <Textarea
              id="context"
              placeholder="Any specific details Sarah should know about this client or call..."
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleInitiateCall}
            disabled={isLoading || !purpose.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Setting up call...' : 'Setup ElevenLabs Call'}
          </Button>
        </CardContent>
      </Card>

      {/* Call Instructions Result */}
      {callResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              ElevenLabs Call Setup Complete
            </CardTitle>
            <CardDescription className="text-green-700">
              Follow these steps to initiate the AI voice call
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(callResult.batchUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Batch Calling
              </Button>
              <Button
                onClick={() => window.open(callResult.agentUrl, '_blank')}
                className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Open Agent Direct
              </Button>
              <Button
                onClick={() => copyToClipboard(callResult.instructions)}
                className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy Instructions
              </Button>
            </div>

            {/* Instructions Display */}
            <div className="bg-white p-4 rounded border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {callResult.instructions}
              </pre>
            </div>

            {/* Client Summary */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Call Summary:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  <strong>Client:</strong> {callResult.clientInfo.name}
                </li>
                <li>
                  <strong>Phone:</strong> {callResult.clientInfo.phone}
                </li>
                <li>
                  <strong>Purpose:</strong> {callResult.clientInfo.purpose}
                </li>
                {callResult.clientInfo.context && (
                  <li>
                    <strong>Context:</strong> {callResult.clientInfo.context}
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ElevenLabsCallComponent;

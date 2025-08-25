'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnvelopeIcon, DevicePhoneMobileIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export default function CommunicationModal({ isOpen, onClose, client }: CommunicationModalProps) {
  const [activeTab, setActiveTab] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  
  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('custom');
  
  // SMS form state
  const [smsMessage, setSmsMessage] = useState('');
  
  // Template data
  const [templateData, setTemplateData] = useState({
    appointmentDate: '',
    appointmentType: '',
    estimateNumber: '',
    estimateAmount: '',
    subject: '',
    message: ''
  });

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client._id,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Email sent successfully!');
        setEmailSubject('');
        setEmailMessage('');
        onClose();
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!client.phone) {
      toast.error('Client does not have a phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/communications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client._id,
          message: smsMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('SMS sent successfully!');
        setSmsMessage('');
        onClose();
      } else {
        toast.error(result.message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS error:', error);
      toast.error('Failed to send SMS. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTemplatedEmail = async () => {
    if (emailTemplate === 'custom') {
      return handleSendEmail();
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/communications/email/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client._id,
          type: emailTemplate,
          ...templateData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send templated email');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Email sent successfully!');
        onClose();
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Templated email error:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCharacterCount = () => {
    return smsMessage.length;
  };

  const getSMSCount = () => {
    return Math.ceil(smsMessage.length / 160);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5" />
            Contact {client.firstName} {client.lastName}
          </DialogTitle>
          <DialogDescription>
            Send an email or SMS message to your client
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2" disabled={!client.phone}>
              <DevicePhoneMobileIcon className="h-4 w-4" />
              SMS {!client.phone && '(No phone)'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-template">Email Type</Label>
              <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Message</SelectItem>
                  <SelectItem value="appointment">Appointment Confirmation</SelectItem>
                  <SelectItem value="estimate">Estimate Follow-up</SelectItem>
                  <SelectItem value="followup">General Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {emailTemplate === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-message">Message</Label>
                  <Textarea
                    id="email-message"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={6}
                  />
                </div>
              </>
            )}

            {emailTemplate === 'appointment' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Appointment Date</Label>
                  <Input
                    id="appointment-date"
                    type="datetime-local"
                    value={templateData.appointmentDate}
                    onChange={(e) => setTemplateData({ ...templateData, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-type">Appointment Type</Label>
                  <Input
                    id="appointment-type"
                    value={templateData.appointmentType}
                    onChange={(e) => setTemplateData({ ...templateData, appointmentType: e.target.value })}
                    placeholder="e.g., Kitchen Consultation"
                  />
                </div>
              </div>
            )}

            {emailTemplate === 'estimate' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="estimate-number">Estimate Number</Label>
                  <Input
                    id="estimate-number"
                    value={templateData.estimateNumber}
                    onChange={(e) => setTemplateData({ ...templateData, estimateNumber: e.target.value })}
                    placeholder="EST-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimate-amount">Estimate Amount ($)</Label>
                  <Input
                    id="estimate-amount"
                    type="number"
                    value={templateData.estimateAmount}
                    onChange={(e) => setTemplateData({ ...templateData, estimateAmount: e.target.value })}
                    placeholder="15000"
                  />
                </div>
              </div>
            )}

            {emailTemplate === 'followup' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="followup-subject">Subject</Label>
                  <Input
                    id="followup-subject"
                    value={templateData.subject}
                    onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                    placeholder="Following up on our conversation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followup-message">Message</Label>
                  <Textarea
                    id="followup-message"
                    value={templateData.message}
                    onChange={(e) => setTemplateData({ ...templateData, message: e.target.value })}
                    placeholder="Your follow-up message..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type your SMS message here..."
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{getCharacterCount()}/1000 characters</span>
                <span>{getSMSCount()} SMS {getSMSCount() > 1 ? 'messages' : 'message'}</span>
              </div>
            </div>
            
            {!client.phone && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  This client doesn't have a phone number on file.
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {activeTab === 'email' && (
            <Button onClick={emailTemplate === 'custom' ? handleSendEmail : handleSendTemplatedEmail} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          )}
          {activeTab === 'sms' && (
            <Button onClick={handleSendSMS} disabled={isLoading || !client.phone}>
              {isLoading ? 'Sending...' : 'Send SMS'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

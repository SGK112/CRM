'use client';

import { useCommunicationsStore, type Communication, type CommunicationType } from '@/lib/communications-store';
import {
    BellIcon,
    ChatBubbleLeftRightIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    FlagIcon,
    PaperAirplaneIcon,
    PaperClipIcon,
    TagIcon,
    UserIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (communication: any) => void;
  draft?: Communication | null; // Add draft prop for editing existing drafts
}

export default function ComposeModal({ isOpen, onClose, onSend, draft }: ComposeModalProps) {
  const [formData, setFormData] = useState({
    type: 'email' as CommunicationType,
    title: '',
    content: '',
    recipient: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    tags: [] as string[],
    attachments: [] as File[],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing a draft
  useEffect(() => {
    if (draft) {
      setFormData({
        type: draft.type,
        title: draft.title,
        content: draft.content,
        recipient: draft.recipient?.email || '',
        priority: draft.priority,
        tags: draft.tags,
        attachments: [], // Can't restore file attachments from draft
      });
    } else {
      // Reset form for new composition
      setFormData({
        type: 'email',
        title: '',
        content: '',
        recipient: '',
        priority: 'normal',
        tags: [],
        attachments: [],
      });
    }
    setTagInput('');
    setError(null);
  }, [draft, isOpen]);

  const handleInputChange = (field: string, value: string | CommunicationType | 'low' | 'normal' | 'high' | 'urgent') => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      setError('Please add a title or content before saving draft');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // For now, save draft directly to the store instead of making API call
      const { saveDraft } = useCommunicationsStore.getState();

      const draftData = {
        type: formData.type,
        title: formData.title || 'Untitled Draft',
        content: formData.content,
        recipient: formData.recipient,
        priority: formData.priority,
        tags: formData.tags,
        sender: {
          name: 'You',
          avatar: 'YOU',
        },
      };

      // If editing existing draft, update it
      if (draft) {
        const { updateDraft } = useCommunicationsStore.getState();
        updateDraft(draft.id, {
          type: formData.type,
          title: formData.title || 'Untitled Draft',
          content: formData.content,
          recipient: formData.recipient ? { name: '', email: formData.recipient } : undefined,
          priority: formData.priority,
          tags: formData.tags,
        });
        onSend({ ...draft, ...draftData });
      } else {
        // Create new draft
        const draftToSave = {
          type: formData.type,
          title: formData.title || 'Untitled Draft',
          content: formData.content,
          sender: {
            name: 'You',
            avatar: 'YOU',
          },
          recipient: formData.recipient ? { name: '', email: formData.recipient } : undefined,
          status: 'read' as const,
          priority: formData.priority,
          folderId: 'drafts' as const,
          tags: formData.tags,
        };

        saveDraft(draftToSave);

        // Get the newly created draft from the store
        const { communications } = useCommunicationsStore.getState();
        const newDraft = communications.find(c =>
          c.folderId === 'drafts' &&
          c.title === draftToSave.title &&
          c.content === draftToSave.content
        );
        if (newDraft) {
          onSend(newDraft);
        }
      }

      // Close modal after saving
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (formData.type === 'email' && !formData.recipient.trim()) {
      setError('Recipient email is required for emails');
      return;
    }

    if (formData.type === 'message' && !formData.recipient.trim()) {
      setError('Recipient phone number is required for SMS');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData for file uploads
      const submitData = new FormData();

      // Add basic fields
      submitData.append('type', formData.type);
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('priority', formData.priority);
      submitData.append('tags', JSON.stringify(formData.tags));

      if (formData.recipient) {
        submitData.append('recipient', formData.recipient);
      }

      // Add attachments
      formData.attachments.forEach((file, index) => {
        submitData.append(`attachment_${index}`, file);
      });

      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Failed to send communication');
      }

      const result = await response.json();

      // Call the onSend callback with the result
      onSend(result);

      // Close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send communication');
    } finally {
      setIsSending(false);
    }
  };

  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'notification':
        return <BellIcon className="h-5 w-5" />;
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'task':
        return <FlagIcon className="h-5 w-5" />;
      default:
        return <EnvelopeIcon className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 border-red-400';
      case 'high':
        return 'text-orange-400 border-orange-400';
      case 'normal':
        return 'text-blue-400 border-blue-400';
      case 'low':
        return 'text-gray-400 border-gray-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] min-h-[600px] flex flex-col overflow-hidden">
        {/* Header - Fixed height */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            {draft ? 'Edit Draft' : 'Compose New Communication'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
          <div className="space-y-4 md:space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Communication Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {(['email', 'message', 'notification', 'task'] as CommunicationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('type', type)}
                    className={`flex items-center gap-2 p-2 md:p-3 rounded-lg border transition-colors ${
                      formData.type === type
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {getTypeIcon(type)}
                    <span className="capitalize text-xs md:text-sm">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient (for emails and SMS) */}
            {(formData.type === 'email' || formData.type === 'message') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {formData.type === 'email' ? 'To (Email)' : 'To (Phone)'}
                </label>
                <div className="relative">
                  {formData.type === 'email' ? (
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  ) : (
                    <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  )}
                  <input
                    type={formData.type === 'email' ? 'email' : 'tel'}
                    value={formData.recipient}
                    onChange={(e) => handleInputChange('recipient', e.target.value)}
                    placeholder={formData.type === 'email' ? 'recipient@example.com' : '+1234567890'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter subject..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm md:text-base"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Type your message..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm md:text-base"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {(['low', 'normal', 'high', 'urgent'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handleInputChange('priority', priority)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors capitalize text-xs md:text-sm ${
                      formData.priority === priority
                        ? `${getPriorityColor(priority)} bg-opacity-20`
                        : 'border-slate-600 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <FlagIcon className="h-3 w-3 md:h-4 md:w-4" />
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tags..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-amber-600 text-white text-xs md:text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-amber-700 rounded-full p-0.5"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Attachments
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                >
                  <PaperClipIcon className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-300 text-sm md:text-base">Add attachments</span>
                </label>

                {formData.attachments.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-700 rounded"
                      >
                        <span className="text-sm text-slate-300 truncate flex-1 mr-2">{file.name}</span>
                        <button
                          onClick={() => handleRemoveAttachment(index)}
                          className="p-1 hover:bg-slate-600 rounded ml-2 flex-shrink-0"
                        >
                          <XMarkIcon className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-4 md:p-6 border-t border-slate-700 flex-shrink-0 bg-slate-800">
          <div className="text-xs text-slate-400">
            {formData.attachments.length > 0 && (
              <span>{formData.attachments.length} attachment{formData.attachments.length > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSending}
              className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors text-sm md:text-base"
            >
              Save Draft
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center gap-2 px-4 md:px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm md:text-base"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

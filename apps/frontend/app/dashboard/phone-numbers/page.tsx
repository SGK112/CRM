'use client';

import { useState, useEffect } from 'react';
import {
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import {
  StandardPageWrapper,
  StandardCard,
  StandardSection,
  StandardButton,
} from '@/components/ui/StandardPageWrapper';

// Mock data for phone numbers
const mockPhoneNumbers = [
  {
    id: '1',
    phoneNumber: '+1 (555) 123-4567',
    friendlyName: 'Main Business Line',
    isDefault: true,
    status: 'active',
    dateAdded: '2024-01-15',
    usage: {
      calls: 156,
      sms: 89,
      cost: 45.67,
    },
  },
  {
    id: '2',
    phoneNumber: '+1 (555) 987-6543',
    friendlyName: 'Customer Support',
    isDefault: false,
    status: 'active',
    dateAdded: '2024-02-10',
    usage: {
      calls: 234,
      sms: 167,
      cost: 67.23,
    },
  },
  {
    id: '3',
    phoneNumber: '+1 (555) 456-7890',
    friendlyName: 'Sales Team',
    isDefault: false,
    status: 'inactive',
    dateAdded: '2024-03-05',
    usage: {
      calls: 89,
      sms: 45,
      cost: 23.45,
    },
  },
];

const availableNumbers = [
  { phoneNumber: '+1 (555) 111-2222', type: 'local', cost: 1.0 },
  { phoneNumber: '+1 (555) 333-4444', type: 'local', cost: 1.0 },
  { phoneNumber: '+1 (555) 555-6666', type: 'local', cost: 1.0 },
  { phoneNumber: '+1 (800) 777-8888', type: 'toll-free', cost: 2.0 },
  { phoneNumber: '+1 (800) 999-0000', type: 'toll-free', cost: 2.0 },
];

export default function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState(mockPhoneNumbers);
  const [availablePhoneNumbers, setAvailablePhoneNumbers] = useState(availableNumbers);
  const [loading, setLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);

  const handleSetDefault = async (id: string) => {
    setPhoneNumbers(numbers =>
      numbers.map(num => ({
        ...num,
        isDefault: num.id === id,
      }))
    );
  };

  const handleDeleteNumber = async (id: string) => {
    if (confirm('Are you sure you want to delete this phone number?')) {
      setPhoneNumbers(numbers => numbers.filter(num => num.id !== id));
    }
  };

  const handlePurchaseNumber = async (number: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newNumber = {
        id: Date.now().toString(),
        phoneNumber: number.phoneNumber,
        friendlyName: `New ${number.type} Number`,
        isDefault: false,
        status: 'active',
        dateAdded: new Date().toISOString().split('T')[0],
        usage: {
          calls: 0,
          sms: 0,
          cost: 0,
        },
      };
      setPhoneNumbers(prev => [...prev, newNumber]);
      setAvailablePhoneNumbers(prev => prev.filter(n => n.phoneNumber !== number.phoneNumber));
      setShowPurchaseModal(false);
      setSelectedNumber(null);
      setLoading(false);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  return (
    <StandardPageWrapper title="Phone Numbers">
      {/* Header Actions */}
      <StandardSection>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Manage Your Twilio Phone Numbers</h2>
            <p className="text-sm text-gray-600 mt-1">
              Purchase and manage phone numbers for voice calls and SMS messaging
            </p>
          </div>
          <StandardButton onClick={() => setShowPurchaseModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Purchase Number
          </StandardButton>
        </div>
      </StandardSection>

      {/* Phone Numbers List */}
      <StandardSection title="Your Phone Numbers">
        <div className="space-y-4">
          {phoneNumbers.map(number => (
            <StandardCard key={number.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{number.phoneNumber}</h3>
                      {number.isDefault && <StarIconSolid className="h-5 w-5 text-yellow-500" />}
                      {getStatusBadge(number.status)}
                    </div>
                    <p className="text-sm text-gray-600">{number.friendlyName}</p>
                    <p className="text-xs text-gray-500">
                      Added: {new Date(number.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Usage Stats */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{number.usage.calls}</div>
                    <div className="text-xs text-gray-500">Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{number.usage.sms}</div>
                    <div className="text-xs text-gray-500">SMS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">${number.usage.cost}</div>
                    <div className="text-xs text-gray-500">Cost</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {!number.isDefault && (
                      <StandardButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(number.id)}
                      >
                        <StarIcon className="h-4 w-4 mr-1" />
                        Set Default
                      </StandardButton>
                    )}
                    <StandardButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNumber(number.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </StandardButton>
                  </div>
                </div>
              </div>
            </StandardCard>
          ))}
        </div>

        {phoneNumbers.length === 0 && (
          <StandardCard className="p-12 text-center">
            <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No phone numbers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by purchasing your first phone number.
            </p>
            <div className="mt-6">
              <StandardButton onClick={() => setShowPurchaseModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Purchase Number
              </StandardButton>
            </div>
          </StandardCard>
        )}
      </StandardSection>

      {/* Usage Overview */}
      <StandardSection title="Usage Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StandardCard className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <PhoneIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {phoneNumbers.reduce((sum, num) => sum + num.usage.calls, 0)}
                </h3>
                <p className="text-sm text-gray-600">Total Calls</p>
              </div>
            </div>
          </StandardCard>

          <StandardCard className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {phoneNumbers.reduce((sum, num) => sum + num.usage.sms, 0)}
                </h3>
                <p className="text-sm text-gray-600">Total SMS</p>
              </div>
            </div>
          </StandardCard>

          <StandardCard className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  ${phoneNumbers.reduce((sum, num) => sum + num.usage.cost, 0).toFixed(2)}
                </h3>
                <p className="text-sm text-gray-600">Total Cost</p>
              </div>
            </div>
          </StandardCard>
        </div>
      </StandardSection>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                <PhoneIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-5">
                Purchase Phone Number
              </h3>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Available Numbers</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availablePhoneNumbers.map((number, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedNumber?.phoneNumber === number.phoneNumber
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedNumber(number)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{number.phoneNumber}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {number.type} Number
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          ${number.cost}/month
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <StandardButton
                  variant="secondary"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedNumber(null);
                  }}
                >
                  Cancel
                </StandardButton>
                <StandardButton
                  onClick={() => selectedNumber && handlePurchaseNumber(selectedNumber)}
                  disabled={!selectedNumber || loading}
                >
                  {loading ? 'Purchasing...' : 'Purchase Number'}
                </StandardButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </StandardPageWrapper>
  );
}

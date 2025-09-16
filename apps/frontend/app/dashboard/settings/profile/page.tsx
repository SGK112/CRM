'use client';

import { BellIcon, CameraIcon, CheckIcon, EyeIcon, EyeSlashIcon, IdentificationIcon, KeyIcon, PencilIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  avatar?: string;
  emailSignatureHtml?: string;
  emailSignatureText?: string;
  timezone?: string;
  language?: string;
  customTheme?: string;
  notificationPreferences?: NotificationPreferences;
}

interface NotificationPreferences {
  emailNotifications: {
    newLeads: boolean;
    appointmentUpdates: boolean;
    estimateUpdates: boolean;
    paymentNotifications: boolean;
  };
  pushNotifications: {
    newLeads: boolean;
    messages: boolean;
    appointmentReminders: boolean;
  };
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: {
      newLeads: true,
      appointmentUpdates: true,
      estimateUpdates: true,
      paymentNotifications: true,
    },
    pushNotifications: {
      newLeads: true,
      messages: true,
      appointmentReminders: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Edit states for different sections
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [editingPassword, setEditingPassword] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<'setup' | 'verify' | 'disable'>('setup');
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [twoFASecret, setTwoFASecret] = useState<string>('');
  const [twoFAToken, setTwoFAToken] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState<string>('');

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
    loadNotificationPreferences();
  }, []);

  // Auto-retry if profile load fails due to backend being slow
  useEffect(() => {
    if (!loading && !profile && !message.includes('Authentication') && !message.includes('Session')) {
      const retryTimer = setTimeout(() => {
        // Retry profile load
        setLoading(true);
        loadUserProfile();
      }, 2000);

      return () => clearTimeout(retryTimer);
    }
  }, [loading, profile, message]);

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');

    // Don't format if empty
    if (phoneNumber.length === 0) return '';

    // Apply formatting based on length
    if (phoneNumber.length <= 3) {
      return `+1 ${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `+1 ${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    } else {
      return `+1 ${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string, isEdit: boolean = false) => {
    const formatted = formatPhoneNumber(value);
    if (isEdit) {
      setEditForm({ ...editForm, phone: formatted });
    } else if (profile) {
      setProfile({ ...profile, phone: formatted });
    }
  };

  // Edit helper functions
  const startEditing = (section: string) => {
    setEditingSection(section);
    setEditForm({ ...profile });
    setMessage('');
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditForm({});
    setMessage('');
  };

  const saveEdit = async (section: string) => {
    if (!profile || !editForm) return;

    // Validation based on section
    if (section === 'basic') {
      if (!editForm.firstName?.trim() || !editForm.lastName?.trim()) {
        setMessage('First name and last name are required');
        return;
      }
      if (!editForm.email?.trim()) {
        setMessage('Email address is required');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        setMessage('Please enter a valid email address');
        return;
      }
    }

    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken') ||
                   localStorage.getItem('token') ||
                   document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      if (!token) {
        setMessage('Authentication required. Please log in again.');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired. Please log in again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          setSaving(false);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update profile`);
      }

      const data = await response.json();
      // Profile updated successfully

      if (data.success && data.user) {
        setProfile(data.user);
        // Update notification preferences if they exist in the response
        if (data.user.notificationPreferences) {
          setNotifications(data.user.notificationPreferences);
        }
      } else {
        // Handle direct user object response
        setProfile({ ...profile, ...editForm });
      }

      setEditingSection(null);
      setEditForm({});
      setMessage(`${section === 'basic' ? 'Profile' : section === 'work' ? 'Work information' : section === 'preferences' ? 'Preferences' : 'Information'} updated successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      // Profile update error handled silently
      setMessage(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setMessage('');

    try {
      // Convert to base64 for storage (in production, you'd upload to cloud storage)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;

        // Update the avatar in the backend
        const token = localStorage.getItem('accessToken') ||
                     localStorage.getItem('token') ||
                     document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        if (!token) {
          setMessage('Authentication required. Please log in again.');
          setUploadingAvatar(false);
          return;
        }

        try {
          const response = await fetch('/api/users/profile', {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ avatar: result }),
          });

          if (!response.ok) {
            if (response.status === 401) {
              setMessage('Session expired. Please log in again.');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('token');
              setUploadingAvatar(false);
              return;
            }
            throw new Error('Failed to upload avatar');
          }

          const data = await response.json();
          // Avatar uploaded successfully

          if (data.success && data.user) {
            setProfile(data.user);
          } else if (profile) {
            setProfile({ ...profile, avatar: result });
          }

          setMessage('Avatar updated successfully!');
          setTimeout(() => setMessage(''), 3000);
        } catch (error) {
          // Avatar upload error handled silently
          setMessage('Failed to upload avatar. Please try again.');
        } finally {
          setUploadingAvatar(false);
        }
      };

      reader.onerror = () => {
        setMessage('Failed to read file');
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setMessage('Failed to upload avatar');
      setUploadingAvatar(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Try multiple token sources for better compatibility
      const token = localStorage.getItem('accessToken') ||
                   localStorage.getItem('token') ||
                   document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      if (!token) {
        setMessage('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired. Please log in again.');
          // Clear invalid tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to load profile`);
      }

      const data = await response.json();
      // Profile data loaded

      if (data.success && data.user) {
        setProfile(data.user);
        // Load notification preferences from user data
        if (data.user.notificationPreferences) {
          setNotifications(data.user.notificationPreferences);
        }
      } else if (data && !data.success) {
        setMessage(data.message || 'Failed to load profile data');
      } else {
        // Handle direct user object response
        setProfile(data);
        if (data.notificationPreferences) {
          setNotifications(data.notificationPreferences);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationPreferences = async () => {
    // Notification preferences are now loaded as part of the user profile
    // This function is kept for compatibility but the actual loading happens in loadUserProfile
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken') ||
                   localStorage.getItem('token') ||
                   document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      if (!token) {
        setMessage('Authentication required. Please log in again.');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired. Please log in again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          setSaving(false);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update password`);
      }

      const data = await response.json();
      // Password updated successfully

      setMessage('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setEditingPassword(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to update password. Please try again.';
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken') ||
                   localStorage.getItem('token') ||
                   document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      if (!token) {
        setMessage('Authentication required. Please log in again.');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/users/notifications', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired. Please log in again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          setSaving(false);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update notification preferences`);
      }

      const data = await response.json();
      // Notifications updated successfully

      if (data.success && data.user && data.user.notificationPreferences) {
        setNotifications(data.user.notificationPreferences);
        // Also update the profile if user data is returned
        if (profile) {
          setProfile({ ...profile, notificationPreferences: data.user.notificationPreferences });
        }
      }

      setMessage('Notification preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to update notification preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // 2FA Functions
  const handle2FASetup = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken') ||
                   localStorage.getItem('token') ||
                   document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      if (!token) {
        setMessage('Authentication required. Please log in again.');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/users/2fa/setup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to setup 2FA');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setQRCodeData(data.data.qrCodeDataURL);
        setTwoFASecret(data.data.secret);
        setTwoFAStep('verify');
        setShow2FAModal(true);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to setup 2FA');
    } finally {
      setSaving(false);
    }
  };

  const handle2FAVerify = async () => {
    if (!twoFAToken.trim()) {
      setMessage('Please enter the verification code');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken') ||
                   localStorage.getItem('token') ||
                   document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      const response = await fetch('/api/users/2fa/verify-setup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: twoFAToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid verification code');
      }

      const data = await response.json();

      if (data.success) {
        setBackupCodes(data.data.backupCodes || []);
        setMessage('Two-factor authentication enabled successfully!');
        setShow2FAModal(false);
        // Reload profile to update 2FA status
        loadUserProfile();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to verify 2FA');
    } finally {
      setSaving(false);
    }
  };

  const handle2FADisable = async () => {
    if (!disablePassword.trim()) {
      setMessage('Please enter your current password');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken') ||
                   localStorage.getItem('token') ||
                   document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

      const response = await fetch('/api/users/2fa/disable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: disablePassword,
          token: twoFAToken || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disable 2FA');
      }

      const data = await response.json();

      if (data.success) {
        setMessage('Two-factor authentication disabled successfully!');
        setShow2FAModal(false);
        setDisablePassword('');
        setTwoFAToken('');
        // Reload profile to update 2FA status
        loadUserProfile();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to disable 2FA');
    } finally {
      setSaving(false);
    }
  };

  const close2FAModal = () => {
    setShow2FAModal(false);
    setTwoFAStep('setup');
    setQRCodeData('');
    setTwoFASecret('');
    setTwoFAToken('');
    setBackupCodes([]);
    setDisablePassword('');
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <p className="text-slate-400">Unable to load profile data</p>
            <button
              onClick={loadUserProfile}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Profile Settings</h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Manage your account information, preferences, and security settings.
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes('successfully') || message.includes('saved')
                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                : 'bg-red-600/20 text-red-400 border border-red-600/30'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <a
                href="#profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-amber-600/10 text-amber-400 border border-amber-500/30"
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Profile</span>
              </a>
              <a
                href="#account"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <IdentificationIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Account</span>
              </a>
              <a
                href="#security"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <KeyIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Security</span>
              </a>
              <a
                href="#notifications"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <BellIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Notifications</span>
              </a>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Profile Information */}
              <div id="profile" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-2xl overflow-hidden">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          {profile.firstName?.[0]}
                          {profile.lastName?.[0]}
                        </>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-6 h-6 bg-slate-800 rounded-full border-2 border-slate-900 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="sr-only"
                      />
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                      ) : (
                        <CameraIcon className="w-3 h-3 text-slate-300" />
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-slate-400">{profile.jobTitle || 'User'}</p>
                    {profile.company && (
                      <p className="text-slate-500 text-sm">{profile.company}</p>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="border-b border-slate-700 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      {editingSection !== 'basic' && (
                        <button
                          onClick={() => startEditing('basic')}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-600/10 rounded-md transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editingSection === 'basic' ? (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              First Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editForm.firstName || ''}
                              onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Last Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editForm.lastName || ''}
                              onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={editForm.email || ''}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editForm.phone || ''}
                            onChange={e => handlePhoneChange(e.target.value, true)}
                            placeholder="+1 555-123-4567"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => saveEdit('basic')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <CheckIcon className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
                          <p className="text-slate-200">{profile.firstName} {profile.lastName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                          <p className="text-slate-200">{profile.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Phone</label>
                          <p className="text-slate-200">{profile.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Work Information */}
                  <div className="border-b border-slate-700 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Work Information</h3>
                      {editingSection !== 'work' && (
                        <button
                          onClick={() => startEditing('work')}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-600/10 rounded-md transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editingSection === 'work' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                          <input
                            type="text"
                            value={editForm.company || ''}
                            onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Job Title</label>
                          <input
                            type="text"
                            value={editForm.jobTitle || ''}
                            onChange={e => setEditForm({ ...editForm, jobTitle: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                          <textarea
                            rows={3}
                            value={editForm.bio || ''}
                            onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => saveEdit('work')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <CheckIcon className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Company</label>
                          <p className="text-slate-200">{profile.company || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Job Title</label>
                          <p className="text-slate-200">{profile.jobTitle || 'Not provided'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-slate-500 mb-1">Bio</label>
                          <p className="text-slate-200">{profile.bio || 'No bio provided'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preferences */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Preferences</h3>
                      {editingSection !== 'preferences' && (
                        <button
                          onClick={() => startEditing('preferences')}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-600/10 rounded-md transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editingSection === 'preferences' ? (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
                            <select
                              value={editForm.timezone || 'America/New_York'}
                              onChange={e => setEditForm({ ...editForm, timezone: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                            >
                              <option value="America/New_York">Eastern Time (ET)</option>
                              <option value="America/Chicago">Central Time (CT)</option>
                              <option value="America/Denver">Mountain Time (MT)</option>
                              <option value="America/Los_Angeles">Pacific Time (PT)</option>
                              <option value="America/Phoenix">Arizona (MST)</option>
                              <option value="UTC">UTC</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                            <select
                              value={editForm.language || 'en'}
                              onChange={e => setEditForm({ ...editForm, language: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                            >
                              <option value="en">English</option>
                              <option value="es">Español (Spanish)</option>
                              <option value="fr">Français (French)</option>
                              <option value="de">Deutsch (German)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Theme Preference</label>
                          <select
                            value={editForm.customTheme || 'dark'}
                            onChange={e => setEditForm({ ...editForm, customTheme: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          >
                            <option value="dark">Dark Theme</option>
                            <option value="light">Light Theme</option>
                            <option value="auto">Auto (System)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => saveEdit('preferences')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <CheckIcon className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Timezone</label>
                          <p className="text-slate-200">{profile.timezone || 'America/New_York'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Language</label>
                          <p className="text-slate-200">{profile.language || 'English'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Theme</label>
                          <p className="text-slate-200 capitalize">{profile.customTheme || 'Dark'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div id="account" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold mb-6">Account Information</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">User ID</label>
                    <p className="text-slate-200 font-mono text-xs bg-slate-800 px-2 py-1 rounded">
                      {profile.id || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Account Status</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-200 text-sm">Active</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
                    <p className="text-slate-200 capitalize">{(profile as any).role || 'team_member'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Email Verified</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${(profile as any).isEmailVerified ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-slate-200 text-sm">
                        {(profile as any).isEmailVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Member Since</label>
                    <p className="text-slate-200">
                      {(profile as any).createdAt
                        ? new Date((profile as any).createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not available'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Password & Security */}
              <div id="security" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Password & Security</h3>
                  {!editingPassword && (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-600/10 rounded-md transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Change Password
                    </button>
                  )}
                </div>

                {editingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={passwordForm.currentPassword}
                          onChange={e =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                          className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={passwordForm.newPassword}
                          onChange={e =>
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                          }
                          className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={passwordForm.confirmPassword}
                          onChange={e =>
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                          }
                          className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setMessage('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Password</label>
                      <p className="text-slate-200">••••••••••••</p>
                      <p className="text-slate-500 text-xs mt-1">Last updated: Recently</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Two-Factor Authentication</label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${(profile as any).twoFactorEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className="text-slate-300 text-sm">
                            {(profile as any).twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                          </span>
                          {!(profile as any).twoFactorEnabled && (
                            <span className="text-slate-500 text-xs">(Recommended)</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if ((profile as any).twoFactorEnabled) {
                              setTwoFAStep('disable');
                              setShow2FAModal(true);
                            } else {
                              handle2FASetup();
                            }
                          }}
                          className="text-sm text-amber-400 hover:text-amber-300 px-2 py-1 rounded transition-colors"
                        >
                          {(profile as any).twoFactorEnabled ? 'Disable' : 'Setup'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div
                id="notifications"
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-slate-200 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(notifications.emailNotifications).map(([key, enabled]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0"
                        >
                          <div>
                            <div className="font-medium text-slate-200 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={e =>
                                setNotifications({
                                  ...notifications,
                                  emailNotifications: {
                                    ...notifications.emailNotifications,
                                    [key]: e.target.checked,
                                  },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-4">Push Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(notifications.pushNotifications).map(([key, enabled]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0"
                        >
                          <div>
                            <div className="font-medium text-slate-200 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={e =>
                                setNotifications({
                                  ...notifications,
                                  pushNotifications: {
                                    ...notifications.pushNotifications,
                                    [key]: e.target.checked,
                                  },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleNotificationSave}
                    disabled={saving}
                    className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {twoFAStep === 'verify' ? 'Verify 2FA Setup' :
                   twoFAStep === 'disable' ? 'Disable 2FA' : 'Setup 2FA'}
                </h3>
                <button
                  onClick={close2FAModal}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {twoFAStep === 'verify' && (
                <div className="space-y-4">
                  {qrCodeData && (
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-3">
                        Scan this QR code with your authenticator app:
                      </p>
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img src={qrCodeData} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Enter verification code from your app:
                    </label>
                    <input
                      type="text"
                      value={twoFAToken}
                      onChange={(e) => setTwoFAToken(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Popular authenticator apps:</p>
                    <p>• Google Authenticator</p>
                    <p>• Microsoft Authenticator</p>
                    <p>• Authy</p>
                    <p>• 1Password</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handle2FAVerify}
                      disabled={saving || !twoFAToken.trim()}
                      className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Verifying...' : 'Enable 2FA'}
                    </button>
                    <button
                      onClick={close2FAModal}
                      className="px-4 py-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {twoFAStep === 'disable' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    To disable two-factor authentication, please enter your current password:
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-red-600/10 border border-red-600/30 rounded-md p-3">
                    <p className="text-sm text-red-400">
                      ⚠️ Disabling 2FA will make your account less secure. Make sure your password is strong and unique.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handle2FADisable}
                      disabled={saving || !disablePassword.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                    <button
                      onClick={close2FAModal}
                      className="px-4 py-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {backupCodes.length > 0 && (
                <div className="mt-4 p-4 bg-amber-600/10 border border-amber-600/30 rounded-md">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">Backup Codes</h4>
                  <p className="text-xs text-amber-300 mb-3">
                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-slate-800 px-2 py-1 rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

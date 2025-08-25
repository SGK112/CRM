'use client';

import { useState, useEffect } from 'react';
import { UserIcon, CameraIcon, KeyIcon, BellIcon } from '@heroicons/react/24/outline';

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    newLeads: true,
    projectUpdates: true,
    paymentReminders: true,
    weeklyReports: false,
    sms: true,
    push: true,
    marketing: false,
  });

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        const user = data.user;
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
        });
        setNotificationPreferences({
          ...notificationPreferences,
          ...(user.notificationPreferences || {}),
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update localStorage user data
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.firstName = profileData.firstName;
          user.lastName = profileData.lastName;
          user.phone = profileData.phone;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }

      const response = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
      console.error('Password update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }

      const response = await fetch('/api/users/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: notificationPreferences.newLeads,
          sms: notificationPreferences.sms,
          push: notificationPreferences.push,
          marketing: notificationPreferences.marketing,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Notification preferences updated!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update notifications' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update notification preferences' });
      console.error('Notification update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-slate-400">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-first Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Profile Settings</h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Manage your account information, preferences, and security settings.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/20 text-green-300 border border-green-700/50' 
              : 'bg-red-900/20 text-red-300 border border-red-700/50'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mobile-first Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <a href="#profile" className="flex items-center gap-3 px-3 py-2 rounded-md bg-amber-600/10 text-amber-400 border border-amber-500/30">
                <UserIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Profile</span>
              </a>
              <a href="#security" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors">
                <KeyIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Security</span>
              </a>
              <a href="#notifications" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors">
                <BellIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Notifications</span>
              </a>
            </nav>
          </div>

          {/* Mobile-first Settings Content */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Profile Information */}
              <div id="profile" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-xl sm:text-2xl">
                      {profileData.firstName?.charAt(0) || 'U'}{profileData.lastName?.charAt(0) || 'S'}
                    </div>
                    <button className="absolute bottom-0 right-0 w-6 h-6 bg-slate-800 rounded-full border-2 border-slate-900 flex items-center justify-center hover:bg-slate-700 transition-colors">
                      <CameraIcon className="w-3 h-3 text-slate-300" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profileData.firstName} {profileData.lastName}</h3>
                    <p className="text-slate-400 text-sm">{profileData.email}</p>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="input opacity-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us a little about yourself..."
                      className="input resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 rounded-md border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Password & Security */}
              <div id="security" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold mb-6">Password & Security</h3>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="input"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="border-t border-slate-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-slate-200">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition"
                      >
                        Enable
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Notification Preferences */}
              <div id="notifications" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-slate-200 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { id: 'new-leads', key: 'newLeads', label: 'New lead notifications', description: 'Get notified when new leads are added' },
                        { id: 'project-updates', key: 'projectUpdates', label: 'Project updates', description: 'Updates on project status changes' },
                        { id: 'payment-reminders', key: 'paymentReminders', label: 'Payment reminders', description: 'Reminders for overdue invoices' },
                        { id: 'weekly-reports', key: 'weeklyReports', label: 'Weekly reports', description: 'Weekly summary of your business metrics' }
                      ].map((notification) => (
                        <div key={notification.id} className="flex items-center justify-between py-2">
                          <div>
                            <label htmlFor={notification.id} className="font-medium text-slate-200 text-sm">
                              {notification.label}
                            </label>
                            <p className="text-xs text-slate-400">{notification.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              id={notification.id}
                              checked={notificationPreferences[notification.key as keyof typeof notificationPreferences] as boolean}
                              onChange={(e) => setNotificationPreferences(prev => ({ 
                                ...prev, 
                                [notification.key]: e.target.checked 
                              }))}
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
                    onClick={handleSaveNotifications}
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
      </div>
    </div>
  );
}
                    </div>
                    <button className="absolute bottom-0 right-0 w-6 h-6 bg-slate-800 rounded-full border-2 border-slate-900 flex items-center justify-center hover:bg-slate-700 transition-colors">
                      <CameraIcon className="w-3 h-3 text-slate-300" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">John Doe</h2>
                    <p className="text-slate-400 text-sm">Contractor</p>
                  </div>
                </div>

                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue="John"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Doe"
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      defaultValue="Doe Construction"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      defaultValue="General Contractor"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Experienced general contractor specializing in residential remodeling projects."
                      className="input resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 rounded-md border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Password & Security */}
              <div id="security" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold mb-6">Password & Security</h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="border-t border-slate-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-slate-200">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition"
                      >
                        Enable
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Notification Preferences */}
              <div id="notifications" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-slate-200 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { id: 'new-leads', label: 'New lead notifications', description: 'Get notified when new leads are added' },
                        { id: 'project-updates', label: 'Project updates', description: 'Updates on project status changes' },
                        { id: 'payment-reminders', label: 'Payment reminders', description: 'Reminders for overdue invoices' },
                        { id: 'weekly-reports', label: 'Weekly reports', description: 'Weekly summary of your business metrics' }
                      ].map((notification) => (
                        <div key={notification.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0">
                          <div>
                            <div className="font-medium text-slate-200">{notification.label}</div>
                            <div className="text-sm text-slate-400">{notification.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-4">Push Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { id: 'mobile-leads', label: 'New leads (Mobile)', description: 'Push notifications for new leads' },
                        { id: 'mobile-messages', label: 'Messages', description: 'New messages from clients' },
                        { id: 'mobile-reminders', label: 'Appointment reminders', description: 'Upcoming appointment notifications' }
                      ].map((notification) => (
                        <div key={notification.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0">
                          <div>
                            <div className="font-medium text-slate-200">{notification.label}</div>
                            <div className="text-sm text-slate-400">{notification.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
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
                    className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

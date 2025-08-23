import { Metadata } from 'next'
import { UserIcon, CameraIcon, KeyIcon, BellIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Profile Settings | Remodely CRM',
  description: 'Manage your Remodely CRM profile settings, preferences, and account information.'
}

export default function ProfileSettingsPage() {
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
                      JD
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

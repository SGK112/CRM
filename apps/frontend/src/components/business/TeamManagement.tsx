'use client';

import { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  UserGroupIcon,
  CogIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'owner' | 'admin' | 'manager' | 'foreman' | 'crew' | 'office';
  permissions: string[];
  status: 'active' | 'invited' | 'inactive';
  hireDate: Date;
  lastLogin?: Date;
  avatar?: string;
}

interface TeamRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number; // 1=owner, 2=admin, 3=manager, 4=foreman, 5=crew, 6=office
}

interface TeamManagementProps {
  businessId?: string;
  currentUser?: { id: string; role: string };
  onTeamUpdate?: (members: TeamMember[]) => void;
  className?: string;
}

const DEFAULT_ROLES: TeamRole[] = [
  {
    id: 'owner',
    name: 'Business Owner',
    description: 'Full access to all features and billing',
    permissions: ['*'],
    level: 1,
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage team, projects, and most business operations',
    permissions: [
      'manage_team',
      'manage_projects',
      'manage_clients',
      'view_reports',
      'manage_estimates',
    ],
    level: 2,
  },
  {
    id: 'manager',
    name: 'Project Manager',
    description: 'Oversee projects, estimates, and client communication',
    permissions: ['manage_projects', 'manage_clients', 'create_estimates', 'view_reports'],
    level: 3,
  },
  {
    id: 'foreman',
    name: 'Foreman',
    description: 'Lead field crews and update project progress',
    permissions: ['update_projects', 'view_schedules', 'upload_photos', 'crew_management'],
    level: 4,
  },
  {
    id: 'crew',
    name: 'Crew Member',
    description: 'View assignments and update work progress',
    permissions: ['view_assignments', 'update_progress', 'upload_photos'],
    level: 5,
  },
  {
    id: 'office',
    name: 'Office Staff',
    description: 'Handle scheduling, invoicing, and client communications',
    permissions: ['manage_schedule', 'create_invoices', 'client_communication', 'data_entry'],
    level: 6,
  },
];

export default function TeamManagement({
  businessId,
  currentUser,
  onTeamUpdate,
  className = '',
}: TeamManagementProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New member form state
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'crew' as TeamMember['role'],
  });

  useEffect(() => {
    fetchTeamMembers();
  }, [businessId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockTeam: TeamMember[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@remodelycrm.com',
          phone: '(555) 123-4567',
          role: 'owner',
          permissions: ['*'],
          status: 'active',
          hireDate: new Date('2023-01-01'),
          lastLogin: new Date(),
          avatar: undefined,
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@remodelycrm.com',
          phone: '(555) 234-5678',
          role: 'admin',
          permissions: ['manage_team', 'manage_projects', 'manage_clients'],
          status: 'active',
          hireDate: new Date('2023-02-15'),
          lastLogin: new Date(Date.now() - 86400000),
          avatar: undefined,
        },
      ];
      setTeamMembers(mockTeam);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.firstName || !newMember.lastName || !newMember.email) return;

    setLoading(true);
    try {
      const invitation: TeamMember = {
        id: Date.now().toString(),
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
        permissions: DEFAULT_ROLES.find(r => r.id === newMember.role)?.permissions || [],
        status: 'invited',
        hireDate: new Date(),
      };

      const updatedTeam = [...teamMembers, invitation];
      setTeamMembers(updatedTeam);
      onTeamUpdate?.(updatedTeam);

      // Reset form
      setNewMember({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'crew',
      });
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: TeamMember['role']) => {
    const updatedTeam = teamMembers.map(member =>
      member.id === memberId
        ? {
            ...member,
            role: newRole,
            permissions: DEFAULT_ROLES.find(r => r.id === newRole)?.permissions || [],
          }
        : member
    );
    setTeamMembers(updatedTeam);
    onTeamUpdate?.(updatedTeam);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      const updatedTeam = teamMembers.filter(member => member.id !== memberId);
      setTeamMembers(updatedTeam);
      onTeamUpdate?.(updatedTeam);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = `${member.firstName} ${member.lastName} ${member.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: TeamMember['role']) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      manager: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      foreman: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      crew: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      office: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    };
    return colors[role] || colors.crew;
  };

  const getStatusColor = (status: TeamMember['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      invited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    return colors[status];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)] flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6" />
            Team Management
          </h2>
          <p className="text-sm text-[var(--text-dim)] mt-1">
            Manage your team members, roles, and permissions
          </p>
        </div>

        <button
          onClick={() => setShowInviteForm(true)}
          className="pill pill-tint-amber flex items-center gap-2"
        >
          <UserPlusIcon className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {/* Filters */}
      <div className="surface-solid p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Search Team</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
            >
              <option value="all">All Roles</option>
              {DEFAULT_ROLES.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="surface-solid">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="font-medium text-[var(--text)]">
            Team Members ({filteredMembers.length})
          </h3>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-dim)]">Loading team members...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-dim)]">No team members found</div>
          ) : (
            filteredMembers.map(member => (
              <div
                key={member.id}
                className="p-4 hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--accent)]/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-[var(--accent)]">
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[var(--text)]">
                          {member.firstName} {member.lastName}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}
                        >
                          {DEFAULT_ROLES.find(r => r.id === member.role)?.name || member.role}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}
                        >
                          {member.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-dim)]">
                        <span className="flex items-center gap-1">
                          <EnvelopeIcon className="w-4 h-4" />
                          {member.email}
                        </span>
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <PhoneIcon className="w-4 h-4" />
                            {member.phone}
                          </span>
                        )}
                        {member.lastLogin && (
                          <span>Last login: {member.lastLogin.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={e =>
                        handleUpdateMemberRole(member.id, e.target.value as TeamMember['role'])
                      }
                      className="px-3 py-1 bg-[var(--input-bg)] border border-[var(--border)] rounded text-sm text-[var(--text)]"
                      disabled={member.role === 'owner' && currentUser?.role !== 'owner'}
                    >
                      {DEFAULT_ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>

                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Remove member"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface-solid)] rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text)]">Invite Team Member</h3>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="p-2 hover:bg-[var(--surface-hover)] rounded transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={newMember.firstName}
                      onChange={e => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={newMember.lastName}
                      onChange={e => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={e => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={e => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">
                    Role *
                  </label>
                  <select
                    value={newMember.role}
                    onChange={e =>
                      setNewMember(prev => ({
                        ...prev,
                        role: e.target.value as TeamMember['role'],
                      }))
                    }
                    className="w-full p-2 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm"
                    required
                  >
                    {DEFAULT_ROLES.filter(role => role.id !== 'owner').map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="pill pill-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="pill pill-tint-amber disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

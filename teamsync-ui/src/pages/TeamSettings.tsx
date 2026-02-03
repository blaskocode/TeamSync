import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamsApi } from '../api/teams';
import { usersApi } from '../api/users';
import { TeamDetails, TeamMember } from '../types/team';
import { Modal } from '../components/shared/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TeamSettings: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'coach' | 'member'>('member');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  const loadTeam = async () => {
    if (!teamId) return;

    try {
      const teamData = await teamsApi.getById(parseInt(teamId));
      setTeam(teamData);
    } catch (error) {
      toast.error('Failed to load team');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!team || !newMemberEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setIsSearching(true);

    try {
      // Search for user by email
      const userResult = await usersApi.searchByEmail(newMemberEmail.trim());

      // Check if user is already a member
      const existingMember = team.members.find((m) => m.user_id === userResult.id);
      if (existingMember) {
        toast.error('User is already a member of this team');
        setIsSearching(false);
        return;
      }

      // Add member to team
      await teamsApi.addMember(team.id, userResult.id, newMemberRole);
      toast.success('Member added successfully');
      setShowAddModal(false);
      setNewMemberEmail('');
      setNewMemberRole('member');
      loadTeam();
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('User not found with that email');
      } else {
        toast.error('Failed to add member');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateRole = async (member: TeamMember) => {
    if (!team) return;

    const newRole = member.role === 'coach' ? 'member' : 'coach';

    try {
      await teamsApi.updateMember(team.id, member.id, newRole);
      toast.success('Role updated successfully');
      loadTeam();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!team) return;

    if (
      !window.confirm(
        `Are you sure you want to remove ${member.first_name} ${member.last_name} from the team?`
      )
    ) {
      return;
    }

    try {
      await teamsApi.removeMember(team.id, member.id);
      toast.success('Member removed successfully');
      loadTeam();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleBack = () => {
    navigate(`/teams/${teamId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Team not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="text-gray-600 hover:text-gray-900">
                ← Back to Team
              </button>
              <h1 className="text-xl font-bold text-gray-900">TeamSync</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.full_name} ({user?.role})
              </span>
              <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{team.members.length} members</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                + Add Member
              </button>
            </div>

            <div className="space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'coach'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateRole(member)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Change Role
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {team.members.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No members yet. Click "Add Member" to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewMemberEmail('');
          setNewMemberRole('member');
        }}
        title="Add Team Member"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as 'coach' | 'member')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="member">Member</option>
              <option value="coach">Coach</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewMemberEmail('');
                setNewMemberRole('member');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={isSearching}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSearching ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamSettings;

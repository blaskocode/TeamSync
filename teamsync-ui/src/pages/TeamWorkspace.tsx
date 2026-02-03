import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MeetingProvider } from '../contexts/MeetingContext';
import { useAuth } from '../contexts/AuthContext';
import MeetingHeader from '../components/meeting/MeetingHeader';
import TeamGoal from '../components/scorecard/TeamGoal';
import ObjectiveList from '../components/scorecard/ObjectiveList';
import StrategicTopics from '../components/meeting/StrategicTopics';
import AgendaSection from '../components/meeting/AgendaSection';
import CascadingComms from '../components/meeting/CascadingComms';
import Whiteboard from '../components/meeting/Whiteboard';
import { UnsavedChangesIndicator } from '../components/shared/UnsavedChangesIndicator';

const TeamWorkspace: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!teamId) {
    return <div>Team not found</div>;
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <MeetingProvider teamId={parseInt(teamId)}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Back to Teams
                </button>
                <h1 className="text-xl font-bold text-gray-900">TeamSync</h1>
                <button
                  onClick={() => navigate(`/teams/${teamId}/settings`)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ⚙️ Team Settings
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user?.full_name} ({user?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 space-y-6">
            <MeetingHeader />

            <TeamGoal />

            <ObjectiveList />

            <StrategicTopics />

            <AgendaSection />

            <CascadingComms />

            <Whiteboard />
          </div>
        </main>

        <UnsavedChangesIndicator />
      </div>
    </MeetingProvider>
  );
};

export default TeamWorkspace;

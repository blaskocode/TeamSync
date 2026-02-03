require 'rails_helper'

RSpec.describe "Api::V1::Meetings", type: :request do
  let(:user) { create(:user) }
  let(:team) { create(:team) }
  let!(:team_membership) { create(:team_membership, user: user, team: team, role: :coach) }
  let(:meeting) { create(:meeting, team: team, meeting_date: Date.today) }
  let(:token) { AuthenticationService.encode_token({ user_id: user.id }) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe "GET /api/v1/teams/:team_id/meetings/current" do
    context "with authentication" do
      context "when current meeting exists" do
        it "returns the current meeting" do
          get "/api/v1/teams/#{team.id}/meetings/current", headers: headers

          expect(response).to have_http_status(:success)
          json = JSON.parse(response.body)
          expect(json['id']).to eq(meeting.id)
          expect(json['team_id']).to eq(team.id)
          expect(json['is_current']).to be true
        end
      end

      context "when no meeting exists" do
        let(:empty_team) { create(:team) }
        let!(:empty_team_membership) { create(:team_membership, user: user, team: empty_team) }

        it "returns 404" do
          get "/api/v1/teams/#{empty_team.id}/meetings/current", headers: headers

          expect(response).to have_http_status(:not_found)
        end
      end
    end

    context "without authentication" do
      it "returns 401 unauthorized" do
        get "/api/v1/teams/#{team.id}/meetings/current"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with unauthorized team access" do
      let(:other_team) { create(:team) }
      let!(:other_meeting) { create(:meeting, team: other_team) }

      it "returns 403 forbidden" do
        get "/api/v1/teams/#{other_team.id}/meetings/current", headers: headers

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "GET /api/v1/meetings/:id" do
    it "returns meeting details with nested data" do
      objective = create(:objective, meeting: meeting)
      agenda_item = create(:agenda_item, meeting: meeting)

      get "/api/v1/meetings/#{meeting.id}", headers: headers

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['id']).to eq(meeting.id)
      expect(json['objectives']).to be_an(Array)
      expect(json['objectives'].first['id']).to eq(objective.id)
      expect(json['agenda_items']).to be_an(Array)
      expect(json['agenda_items'].first['id']).to eq(agenda_item.id)
    end
  end

  describe "PATCH /api/v1/meetings/:id" do
    context "as a coach" do
      it "updates meeting fields" do
        patch "/api/v1/meetings/#{meeting.id}",
              params: { team_goal: 'Updated goal', strategic_topics: '<p>Updated topics</p>' },
              headers: headers

        expect(response).to have_http_status(:success)
        meeting.reload
        expect(meeting.team_goal).to eq('Updated goal')
        expect(meeting.strategic_topics).to include('Updated topics')
      end

      it "sanitizes HTML content" do
        patch "/api/v1/meetings/#{meeting.id}",
              params: { strategic_topics: '<p>Safe content</p><script>alert("XSS")</script>' },
              headers: headers

        expect(response).to have_http_status(:success)
        meeting.reload
        expect(meeting.strategic_topics).to include('Safe content')
        expect(meeting.strategic_topics).not_to include('<script>')
      end
    end

    context "as a regular member" do
      let!(:member_membership) { create(:team_membership, user: user, team: team, role: :member) }

      before { team_membership.destroy }

      it "returns 403 forbidden" do
        patch "/api/v1/meetings/#{meeting.id}",
              params: { team_goal: 'Updated goal' },
              headers: headers

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "GET /api/v1/meetings/:id/poll" do
    it "returns update timestamps" do
      get "/api/v1/meetings/#{meeting.id}/poll", headers: headers

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['meeting_updated_at']).to be_present
      expect(json['objectives_updated_at']).to be_present
      expect(json['agenda_items_updated_at']).to be_present
    end
  end

  describe "POST /api/v1/teams/:team_id/meetings" do
    context "as a coach" do
      it "creates a new meeting" do
        expect {
          post "/api/v1/teams/#{team.id}/meetings",
               params: { meeting_date: Date.tomorrow.to_s },
               headers: headers
        }.to change(Meeting, :count).by(1)

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['meeting_date']).to eq(Date.tomorrow.to_s)
      end

      it "copies strategic topics from previous meeting" do
        meeting.update(strategic_topics: '<p>Previous topics</p>')

        post "/api/v1/teams/#{team.id}/meetings",
             params: { meeting_date: Date.tomorrow.to_s },
             headers: headers

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['strategic_topics']).to include('Previous topics')
      end
    end

    context "with duplicate meeting date" do
      it "returns 422" do
        post "/api/v1/teams/#{team.id}/meetings",
             params: { meeting_date: meeting.meeting_date.to_s },
             headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end

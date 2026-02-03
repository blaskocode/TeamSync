require 'rails_helper'

RSpec.describe "Api::V1::Objectives", type: :request do
  let(:user) { create(:user) }
  let(:team) { create(:team) }
  let!(:team_membership) { create(:team_membership, user: user, team: team) }
  let(:meeting) { create(:meeting, team: team) }
  let(:objective) { create(:objective, meeting: meeting) }
  let(:token) { AuthenticationService.encode_token({ user_id: user.id }) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe "POST /api/v1/meetings/:meeting_id/objectives" do
    let(:valid_params) do
      {
        title: 'New Objective',
        objective_type: 'defining',
        status_color: 'yellow',
        description: '<p>Description</p>'
      }
    end

    it "creates a new objective" do
      expect {
        post "/api/v1/meetings/#{meeting.id}/objectives",
             params: valid_params,
             headers: headers
      }.to change(Objective, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New Objective')
      expect(json['objective_type']).to eq('defining')
    end

    it "sanitizes HTML in description" do
      post "/api/v1/meetings/#{meeting.id}/objectives",
           params: valid_params.merge(description: '<p>Safe</p><script>alert("XSS")</script>'),
           headers: headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['description']).to include('Safe')
      expect(json['description']).not_to include('<script>')
    end

    it "returns 422 with invalid params" do
      post "/api/v1/meetings/#{meeting.id}/objectives",
           params: { title: '' },
           headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/v1/objectives/:id" do
    it "updates objective fields" do
      patch "/api/v1/objectives/#{objective.id}",
            params: { title: 'Updated Title', status_color: 'green' },
            headers: headers

      expect(response).to have_http_status(:success)
      objective.reload
      expect(objective.title).to eq('Updated Title')
      expect(objective.status_color).to eq('green')
    end

    it "validates title presence" do
      patch "/api/v1/objectives/#{objective.id}",
            params: { title: '' },
            headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/objectives/:id" do
    it "deletes the objective" do
      objective_id = objective.id

      expect {
        delete "/api/v1/objectives/#{objective_id}", headers: headers
      }.to change(Objective, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /api/v1/objectives/reorder" do
    let(:objective1) { create(:objective, meeting: meeting, display_order: 0) }
    let(:objective2) { create(:objective, meeting: meeting, display_order: 1) }
    let(:objective3) { create(:objective, meeting: meeting, display_order: 2) }

    it "reorders objectives" do
      post '/api/v1/objectives/reorder',
           params: { objective_ids: [objective3.id, objective1.id, objective2.id] },
           headers: headers

      expect(response).to have_http_status(:success)

      objective1.reload
      objective2.reload
      objective3.reload

      expect(objective3.display_order).to eq(0)
      expect(objective1.display_order).to eq(1)
      expect(objective2.display_order).to eq(2)
    end

    it "returns 422 with missing params" do
      post '/api/v1/objectives/reorder', headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end

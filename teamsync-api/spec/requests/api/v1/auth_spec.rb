require 'rails_helper'

RSpec.describe "Api::V1::Auth", type: :request do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123') }

  describe "POST /api/v1/auth/login" do
    context "with valid credentials" do
      it "returns a token and user info" do
        post '/api/v1/auth/login', params: { email: user.email, password: 'password123' }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['user']['email']).to eq(user.email)
        expect(json['user']['first_name']).to eq(user.first_name)
        expect(json['user']['last_name']).to eq(user.last_name)
        expect(json['user']['role']).to eq(user.role)
      end
    end

    context "with invalid password" do
      it "returns 401 unauthorized" do
        post '/api/v1/auth/login', params: { email: user.email, password: 'wrong_password' }

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to be_present
      end
    end

    context "with non-existent email" do
      it "returns 401 unauthorized" do
        post '/api/v1/auth/login', params: { email: 'nonexistent@example.com', password: 'password123' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with missing parameters" do
      it "returns 422 with missing email" do
        post '/api/v1/auth/login', params: { password: 'password123' }

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns 422 with missing password" do
        post '/api/v1/auth/login', params: { email: user.email }

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "POST /api/v1/auth/refresh" do
    let(:token) { AuthenticationService.encode_token({ user_id: user.id }) }

    context "with valid token" do
      it "returns a new token" do
        post '/api/v1/auth/refresh', headers: { 'Authorization' => "Bearer #{token}" }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['token']).not_to eq(token)
      end
    end

    context "with invalid token" do
      it "returns 401 unauthorized" do
        post '/api/v1/auth/refresh', headers: { 'Authorization' => 'Bearer invalid_token' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with missing token" do
      it "returns 401 unauthorized" do
        post '/api/v1/auth/refresh'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end

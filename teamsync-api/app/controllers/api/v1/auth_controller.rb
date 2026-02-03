module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:login]

      def login
        user = User.find_by(email: params[:email]&.downcase)

        if user&.authenticate(params[:password])
          token = AuthenticationService.encode_token({ user_id: user.id })
          render json: {
            token: token,
            user: {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              full_name: user.full_name,
              role: user.role
            }
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def refresh
        token = AuthenticationService.encode_token({ user_id: current_user.id })
        render json: { token: token }, status: :ok
      end
    end
  end
end

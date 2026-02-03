module Api
  module V1
    class UsersController < ApplicationController
      def search
        email = params[:email]&.downcase&.strip

        if email.blank?
          return render json: { error: "Email parameter required" }, status: :bad_request
        end

        user = User.find_by(email: email)

        if user
          render json: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: user.full_name
          }
        else
          render json: { error: "User not found" }, status: :not_found
        end
      end
    end
  end
end

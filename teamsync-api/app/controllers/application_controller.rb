class ApplicationController < ActionController::API
  before_action :authenticate_user!

  def current_user
    return @current_user if @current_user

    token = request.headers["Authorization"]&.split(" ")&.last
    return nil unless token

    payload = AuthenticationService.decode_token(token)
    @current_user = User.find_by(id: payload["user_id"]) if payload
  end

  def authenticate_user!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

  def current_user=(user)
    @current_user = user
  end
end

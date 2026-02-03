class ApplicationController < ActionController::API
  before_action :authenticate_user!

  # Global error handlers
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :record_invalid
  rescue_from ActionController::ParameterMissing, with: :parameter_missing
  rescue_from StandardError, with: :internal_server_error

  def current_user
    return @current_user if @current_user

    token = request.headers["Authorization"]&.split(" ")&.last
    return nil unless token

    payload = AuthenticationService.decode_token(token)
    @current_user = User.find_by(id: payload["user_id"]) if payload
  rescue StandardError => e
    Rails.logger.error("Authentication error: #{e.message}")
    nil
  end

  def authenticate_user!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

  def current_user=(user)
    @current_user = user
  end

  private

  def record_not_found(exception)
    render json: { error: "Record not found", details: exception.message }, status: :not_found
  end

  def record_invalid(exception)
    render json: {
      error: "Validation failed",
      details: exception.record.errors.full_messages
    }, status: :unprocessable_entity
  end

  def parameter_missing(exception)
    render json: {
      error: "Missing parameter",
      details: exception.message
    }, status: :bad_request
  end

  def internal_server_error(exception)
    Rails.logger.error("Internal server error: #{exception.class} - #{exception.message}")
    Rails.logger.error(exception.backtrace.join("\n"))

    render json: {
      error: "Internal server error",
      details: Rails.env.development? ? exception.message : "An unexpected error occurred"
    }, status: :internal_server_error
  end
end

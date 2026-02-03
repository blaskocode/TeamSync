# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In development, allow any localhost port
    # In production, use FRONTEND_URL env variable
    if Rails.env.development?
      origins(/http:\/\/localhost:\d+/)
    else
      origins ENV.fetch("FRONTEND_URL", "http://localhost:5173")
    end

    resource "*",
      headers: :any,
      methods: [:get, :post, :patch, :delete, :options],
      credentials: true
  end
end

# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow all origins in test environment, specific origin in other environments
    if Rails.env.test?
      origins "*"
    elsif Rails.env.production?
      origins "https://kaikai-app-1.onrender.com", "https://kaikai-app.onrender.com"  # 本番環境のフロントエンドURL
    else
      origins "http://localhost:5173"  # 開発環境
    end

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end

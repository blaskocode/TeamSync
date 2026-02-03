Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Authentication
      post "auth/login", to: "auth#login"
      post "auth/refresh", to: "auth#refresh"

      # Users
      get "users/search", to: "users#search"

      # Teams
      resources :teams, only: [:index, :show, :create, :update, :destroy] do
        resources :members, controller: :team_memberships, only: [:create, :update, :destroy]
        resources :meetings, only: [:index, :create]
        get "meetings/current", to: "meetings#current"
      end

      # Meetings
      resources :meetings, only: [:show, :update, :destroy] do
        get "poll", on: :member
        get "export", on: :member
        resources :objectives, only: [:create]
        resources :agenda_items, only: [:create]
      end

      # Objectives
      resources :objectives, only: [:update, :destroy]
      post "objectives/reorder", to: "objectives#reorder"

      # Agenda Items
      resources :agenda_items, only: [:update, :destroy]
      patch "agenda_items/:id/complete", to: "agenda_items#complete"
      post "agenda_items/reorder", to: "agenda_items#reorder"
    end
  end
end

module Api
  module V1
    class TeamsController < ApplicationController
      def index
        teams = current_user.admin? ? Team.all : current_user.teams
        render json: teams.map { |team|
          {
            id: team.id,
            name: team.name,
            created_at: team.created_at,
            updated_at: team.updated_at
          }
        }
      end

      def show
        team = find_team
        return unless team

        render json: {
          id: team.id,
          name: team.name,
          members: team.team_memberships.includes(:user).map { |tm|
            {
              id: tm.id,
              user_id: tm.user_id,
              first_name: tm.user.first_name,
              last_name: tm.user.last_name,
              email: tm.user.email,
              role: tm.role,
              working_genius_profile: tm.working_genius_profile
            }
          },
          created_at: team.created_at,
          updated_at: team.updated_at
        }
      end

      def create
        unless current_user.admin? || current_user.coach?
          return render json: { error: "Unauthorized" }, status: :forbidden
        end

        team = Team.new(team_params)

        if team.save
          # Add creator as coach if they're not admin
          if current_user.coach?
            team.team_memberships.create!(user: current_user, role: :coach)
          end

          render json: { id: team.id, name: team.name }, status: :created
        else
          render json: { errors: team.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        team = find_team
        return unless team
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_team?(team)

        if team.update(team_params)
          render json: { id: team.id, name: team.name }
        else
          render json: { errors: team.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        team = find_team
        return unless team
        return render json: { error: "Unauthorized" }, status: :forbidden unless current_user.admin?

        team.destroy
        head :no_content
      end

      private

      def find_team
        team = Team.find_by(id: params[:id])
        unless team
          render json: { error: "Team not found" }, status: :not_found
          return nil
        end

        unless current_user.admin? || current_user.teams.include?(team)
          render json: { error: "Unauthorized" }, status: :forbidden
          return nil
        end

        team
      end

      def can_manage_team?(team)
        current_user.admin? || team.coaches.include?(current_user)
      end

      def team_params
        params.require(:team).permit(:name)
      end
    end
  end
end

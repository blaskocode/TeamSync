module Api
  module V1
    class TeamMembershipsController < ApplicationController
      before_action :find_team

      def create
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_team?

        user = User.find_by(id: params[:user_id])
        unless user
          return render json: { error: "User not found" }, status: :not_found
        end

        membership = @team.team_memberships.new(
          user: user,
          role: params[:role] || :member,
          working_genius_profile: params[:working_genius_profile]
        )

        if membership.save
          render json: {
            id: membership.id,
            user_id: membership.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: membership.role,
            working_genius_profile: membership.working_genius_profile
          }, status: :created
        else
          render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_team?

        membership = @team.team_memberships.find(params[:id])

        if membership.update(membership_params)
          render json: {
            id: membership.id,
            user_id: membership.user_id,
            role: membership.role,
            working_genius_profile: membership.working_genius_profile
          }
        else
          render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_team?

        membership = @team.team_memberships.find(params[:id])
        membership.destroy
        head :no_content
      end

      private

      def find_team
        @team = Team.find_by(id: params[:team_id])
        unless @team
          render json: { error: "Team not found" }, status: :not_found
          return
        end

        unless current_user.admin? || current_user.teams.include?(@team)
          render json: { error: "Unauthorized" }, status: :forbidden
          return
        end
      end

      def can_manage_team?
        current_user.admin? || @team.coaches.include?(current_user)
      end

      def membership_params
        params.permit(:role, :working_genius_profile)
      end
    end
  end
end

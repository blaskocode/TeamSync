module Api
  module V1
    class ObjectivesController < ApplicationController
      before_action :find_meeting, only: [:create]
      before_action :find_objective, only: [:update, :destroy]

      def create
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_meeting?

        # Calculate next display_order
        max_order = @meeting.objectives.maximum(:display_order) || -1

        objective = @meeting.objectives.new(objective_params.merge(display_order: max_order + 1))

        if objective.save
          render json: {
            id: objective.id,
            meeting_id: objective.meeting_id,
            objective_type: objective.objective_type,
            title: objective.title,
            description: objective.description,
            status_color: objective.status_color,
            display_order: objective.display_order,
            created_at: objective.created_at,
            updated_at: objective.updated_at
          }, status: :created
        else
          render json: { errors: objective.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_objective?

        if @objective.update(objective_params)
          render json: {
            id: @objective.id,
            meeting_id: @objective.meeting_id,
            objective_type: @objective.objective_type,
            title: @objective.title,
            description: @objective.description,
            status_color: @objective.status_color,
            display_order: @objective.display_order,
            created_at: @objective.created_at,
            updated_at: @objective.updated_at
          }
        else
          render json: { errors: @objective.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_objective?

        @objective.destroy
        head :no_content
      end

      def reorder
        return render json: { error: "Unauthorized" }, status: :forbidden unless current_user.admin? || current_user.coach?

        objective_ids = params[:objective_ids]

        ActiveRecord::Base.transaction do
          objective_ids.each_with_index do |id, index|
            Objective.find(id).update!(display_order: index)
          end
        end

        head :no_content
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Objective not found" }, status: :not_found
      end

      private

      def find_meeting
        @meeting = Meeting.find_by(id: params[:meeting_id])
        unless @meeting
          render json: { error: "Meeting not found" }, status: :not_found
          return
        end

        unless current_user.admin? || current_user.teams.include?(@meeting.team)
          render json: { error: "Unauthorized" }, status: :forbidden
          return
        end
      end

      def find_objective
        @objective = Objective.find_by(id: params[:id])
        unless @objective
          render json: { error: "Objective not found" }, status: :not_found
          return
        end

        unless current_user.admin? || current_user.teams.include?(@objective.meeting.team)
          render json: { error: "Unauthorized" }, status: :forbidden
          return
        end
      end

      def can_manage_meeting?
        current_user.admin? || @meeting.team.coaches.include?(current_user)
      end

      def can_manage_objective?
        current_user.admin? || @objective.meeting.team.coaches.include?(current_user)
      end

      def objective_params
        params.permit(:objective_type, :title, :description, :status_color)
      end
    end
  end
end

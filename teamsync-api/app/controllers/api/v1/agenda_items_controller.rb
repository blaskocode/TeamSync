module Api
  module V1
    class AgendaItemsController < ApplicationController
      before_action :find_meeting, only: [:create]
      before_action :find_agenda_item, only: [:update, :destroy, :complete]

      def create
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_meeting?

        # Calculate next display_order
        max_order = @meeting.agenda_items.maximum(:display_order) || -1

        agenda_item = @meeting.agenda_items.new(agenda_item_params.merge(display_order: max_order + 1))

        if agenda_item.save
          render json: {
            id: agenda_item.id,
            meeting_id: agenda_item.meeting_id,
            title: agenda_item.title,
            description: agenda_item.description,
            display_order: agenda_item.display_order,
            is_complete: agenda_item.is_complete,
            decision_notes: agenda_item.decision_notes,
            created_at: agenda_item.created_at,
            updated_at: agenda_item.updated_at
          }, status: :created
        else
          render json: { errors: agenda_item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_agenda_item?

        if @agenda_item.update(agenda_item_params)
          render json: {
            id: @agenda_item.id,
            meeting_id: @agenda_item.meeting_id,
            title: @agenda_item.title,
            description: @agenda_item.description,
            display_order: @agenda_item.display_order,
            is_complete: @agenda_item.is_complete,
            decision_notes: @agenda_item.decision_notes,
            created_at: @agenda_item.created_at,
            updated_at: @agenda_item.updated_at
          }
        else
          render json: { errors: @agenda_item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_agenda_item?

        @agenda_item.destroy
        head :no_content
      end

      def complete
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_agenda_item?

        if @agenda_item.update(is_complete: params[:is_complete], decision_notes: params[:decision_notes])
          render json: {
            id: @agenda_item.id,
            meeting_id: @agenda_item.meeting_id,
            title: @agenda_item.title,
            description: @agenda_item.description,
            display_order: @agenda_item.display_order,
            is_complete: @agenda_item.is_complete,
            decision_notes: @agenda_item.decision_notes,
            created_at: @agenda_item.created_at,
            updated_at: @agenda_item.updated_at
          }
        else
          render json: { errors: @agenda_item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def reorder
        return render json: { error: "Unauthorized" }, status: :forbidden unless current_user.admin? || current_user.coach?

        agenda_item_ids = params[:agenda_item_ids]

        ActiveRecord::Base.transaction do
          agenda_item_ids.each_with_index do |id, index|
            AgendaItem.find(id).update!(display_order: index)
          end
        end

        head :no_content
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Agenda item not found" }, status: :not_found
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

      def find_agenda_item
        @agenda_item = AgendaItem.find_by(id: params[:id])
        unless @agenda_item
          render json: { error: "Agenda item not found" }, status: :not_found
          return
        end

        unless current_user.admin? || current_user.teams.include?(@agenda_item.meeting.team)
          render json: { error: "Unauthorized" }, status: :forbidden
          return
        end
      end

      def can_manage_meeting?
        current_user.admin? || @meeting.team.coaches.include?(current_user)
      end

      def can_manage_agenda_item?
        current_user.admin? || @agenda_item.meeting.team.coaches.include?(current_user)
      end

      def agenda_item_params
        params.permit(:title, :description, :is_complete, :decision_notes)
      end
    end
  end
end

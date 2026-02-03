module Api
  module V1
    class MeetingsController < ApplicationController
      before_action :find_team, only: [:index, :create, :current]
      before_action :find_meeting, only: [:show, :update, :destroy, :poll, :export]

      def index
        meetings = @team.meetings.reverse_chronological
        render json: meetings.map { |m|
          {
            id: m.id,
            team_id: m.team_id,
            meeting_date: m.meeting_date,
            created_at: m.created_at,
            updated_at: m.updated_at
          }
        }
      end

      def current
        meeting = @team.meetings.current_or_latest
        if meeting
          render_meeting(meeting)
        else
          render json: { error: "No meetings found" }, status: :not_found
        end
      end

      def show
        render_meeting(@meeting)
      end

      def create
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_team?

        meeting = MeetingCreatorService.new(@team, params[:meeting_date]).call

        if meeting.persisted?
          render_meeting(meeting)
        else
          render json: { errors: meeting.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end

      def update
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_team?

        if @meeting.update(meeting_params)
          render_meeting(@meeting)
        else
          render json: { errors: @meeting.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        return render json: { error: "Unauthorized" }, status: :forbidden unless can_manage_team?

        @meeting.destroy
        head :no_content
      end

      def poll
        render json: {
          id: @meeting.id,
          updated_at: @meeting.updated_at,
          objectives_updated_at: @meeting.objectives.maximum(:updated_at),
          agenda_items_updated_at: @meeting.agenda_items.maximum(:updated_at),
          next_meeting_id: @meeting.next_meeting&.id,
          previous_meeting_id: @meeting.previous_meeting&.id,
          is_current: @meeting.is_current?
        }
      end

      def export
        pdf = PdfGeneratorService.new(@meeting).generate
        send_data pdf.render,
                  filename: "meeting-#{@meeting.team.name.parameterize}-#{@meeting.meeting_date}.pdf",
                  type: 'application/pdf',
                  disposition: 'attachment'
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

      def find_meeting
        @meeting = Meeting.find_by(id: params[:id])
        unless @meeting
          render json: { error: "Meeting not found" }, status: :not_found
          return
        end

        unless current_user.admin? || current_user.teams.include?(@meeting.team)
          render json: { error: "Unauthorized" }, status: :forbidden
          return
        end
      end

      def can_manage_team?
        current_user.admin? || @meeting&.team&.coaches&.include?(current_user) || @team&.coaches&.include?(current_user)
      end

      def meeting_params
        params.permit(:team_goal, :strategic_topics, :cascading_communications, :whiteboard_notes)
      end

      def render_meeting(meeting)
        render json: {
          id: meeting.id,
          team_id: meeting.team_id,
          meeting_date: meeting.meeting_date,
          team_goal: meeting.team_goal,
          strategic_topics: meeting.strategic_topics,
          cascading_communications: meeting.cascading_communications,
          whiteboard_notes: meeting.whiteboard_notes,
          is_current: meeting.is_current?,
          next_meeting_id: meeting.next_meeting&.id,
          previous_meeting_id: meeting.previous_meeting&.id,
          objectives: meeting.objectives.by_display_order.map { |obj|
            {
              id: obj.id,
              meeting_id: obj.meeting_id,
              objective_type: obj.objective_type,
              title: obj.title,
              description: obj.description,
              status_color: obj.status_color,
              display_order: obj.display_order,
              created_at: obj.created_at,
              updated_at: obj.updated_at
            }
          },
          agenda_items: meeting.agenda_items.by_display_order.map { |item|
            {
              id: item.id,
              meeting_id: item.meeting_id,
              title: item.title,
              description: item.description,
              display_order: item.display_order,
              is_complete: item.is_complete,
              decision_notes: item.decision_notes,
              created_at: item.created_at,
              updated_at: item.updated_at
            }
          },
          participants: meeting.meeting_participants.map { |p|
            {
              id: p.id,
              user_id: p.user_id,
              first_name: p.first_name,
              last_name: p.last_name,
              role: p.role,
              working_genius_profile: p.working_genius_profile
            }
          },
          created_at: meeting.created_at,
          updated_at: meeting.updated_at
        }
      end
    end
  end
end

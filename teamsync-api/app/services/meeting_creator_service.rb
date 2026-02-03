class MeetingCreatorService
  def initialize(team, meeting_date)
    @team = team
    @meeting_date = meeting_date
  end

  def call
    ActiveRecord::Base.transaction do
      meeting = create_meeting
      create_participant_snapshots(meeting)
      copy_strategic_topics(meeting)
      meeting
    end
  end

  private

  def create_meeting
    @team.meetings.create!(meeting_date: @meeting_date)
  end

  def create_participant_snapshots(meeting)
    @team.team_memberships.includes(:user).each do |membership|
      meeting.meeting_participants.create!(
        user: membership.user,
        first_name: membership.user.first_name,
        last_name: membership.user.last_name,
        role: membership.role,
        working_genius_profile: membership.working_genius_profile
      )
    end
  end

  def copy_strategic_topics(meeting)
    last_meeting = @team.meetings.where("meeting_date < ?", @meeting_date).order(meeting_date: :desc).first
    if last_meeting && last_meeting.strategic_topics.present?
      meeting.update(strategic_topics: last_meeting.strategic_topics)
    end
  end
end

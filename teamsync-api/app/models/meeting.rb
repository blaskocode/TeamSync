class Meeting < ApplicationRecord
  belongs_to :team
  has_many :objectives, dependent: :destroy
  has_many :agenda_items, dependent: :destroy
  has_many :meeting_participants, dependent: :destroy

  validates :meeting_date, presence: true
  validates :meeting_date, uniqueness: { scope: :team_id }

  scope :current_or_latest, -> { where("meeting_date >= ?", Date.today).order(:meeting_date).first || order(meeting_date: :desc).first }
  scope :for_date, ->(date) { where(meeting_date: date) }
  scope :chronological, -> { order(meeting_date: :asc) }
  scope :reverse_chronological, -> { order(meeting_date: :desc) }

  def next_meeting
    team.meetings.where("meeting_date > ?", meeting_date).order(:meeting_date).first
  end

  def previous_meeting
    team.meetings.where("meeting_date < ?", meeting_date).order(meeting_date: :desc).first
  end

  def is_current?
    meeting_date >= Date.today
  end
end

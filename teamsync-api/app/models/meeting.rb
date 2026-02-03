class Meeting < ApplicationRecord
  belongs_to :team
  has_many :objectives, dependent: :destroy
  has_many :agenda_items, dependent: :destroy
  has_many :meeting_participants, dependent: :destroy

  validates :meeting_date, presence: true
  validates :meeting_date, uniqueness: { scope: :team_id, message: "already has a meeting scheduled" }
  validates :team_goal, length: { maximum: 1000 }, allow_blank: true
  validates :strategic_topics, length: { maximum: 10000 }, allow_blank: true
  validates :cascading_communications, length: { maximum: 10000 }, allow_blank: true
  validates :whiteboard_notes, length: { maximum: 10000 }, allow_blank: true

  before_save :sanitize_html_fields

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

  private

  def sanitize_html_fields
    self.strategic_topics = sanitize_html(strategic_topics) if strategic_topics.present?
    self.cascading_communications = sanitize_html(cascading_communications) if cascading_communications.present?
    self.whiteboard_notes = sanitize_html(whiteboard_notes) if whiteboard_notes.present?
  end

  def sanitize_html(content)
    ActionController::Base.helpers.sanitize(content, tags: %w[p br strong em u ul ol li], attributes: %w[])
  end
end

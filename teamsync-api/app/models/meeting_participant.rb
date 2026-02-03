class MeetingParticipant < ApplicationRecord
  belongs_to :meeting
  belongs_to :user

  validates :first_name, presence: true
  validates :last_name, presence: true
end

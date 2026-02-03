class TeamMembership < ApplicationRecord
  belongs_to :user
  belongs_to :team

  enum :role, { coach: 0, member: 1 }

  validates :user_id, uniqueness: { scope: :team_id }
  validates :role, presence: true
end

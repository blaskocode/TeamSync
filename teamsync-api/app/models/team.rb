class Team < ApplicationRecord
  has_many :team_memberships, dependent: :destroy
  has_many :users, through: :team_memberships
  has_many :meetings, dependent: :destroy

  validates :name, presence: true

  def coaches
    users.joins(:team_memberships).where(team_memberships: { team_id: id, role: 0 })
  end

  def members
    users.joins(:team_memberships).where(team_memberships: { team_id: id, role: 1 })
  end
end

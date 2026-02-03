class User < ApplicationRecord
  has_secure_password

  has_many :team_memberships, dependent: :destroy
  has_many :teams, through: :team_memberships

  enum :role, { admin: 0, coach: 1, member: 2 }

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :role, presence: true

  before_save :downcase_email

  def full_name
    "#{first_name} #{last_name}"
  end

  private

  def downcase_email
    self.email = email.downcase
  end
end

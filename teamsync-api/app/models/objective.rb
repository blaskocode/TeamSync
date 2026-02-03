class Objective < ApplicationRecord
  belongs_to :meeting

  enum :objective_type, { defining: 0, standard_operating: 1 }
  enum :status_color, { red: 0, yellow: 1, green: 2 }

  validates :title, presence: true, length: { minimum: 1, maximum: 500 }
  validates :objective_type, presence: true
  validates :status_color, presence: true
  validates :display_order, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :description, length: { maximum: 5000 }, allow_blank: true

  before_save :sanitize_description

  scope :by_display_order, -> { order(:display_order) }
  scope :defining_objectives, -> { where(objective_type: :defining) }
  scope :standard_operating_objectives, -> { where(objective_type: :standard_operating) }

  private

  def sanitize_description
    self.description = ActionController::Base.helpers.sanitize(
      description,
      tags: %w[p br strong em u ul ol li],
      attributes: %w[]
    ) if description.present?
  end
end

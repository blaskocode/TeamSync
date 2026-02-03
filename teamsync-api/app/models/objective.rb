class Objective < ApplicationRecord
  belongs_to :meeting

  enum :objective_type, { defining: 0, standard_operating: 1 }
  enum :status_color, { red: 0, yellow: 1, green: 2 }

  validates :title, presence: true
  validates :objective_type, presence: true
  validates :status_color, presence: true
  validates :display_order, presence: true

  scope :by_display_order, -> { order(:display_order) }
  scope :defining_objectives, -> { where(objective_type: :defining) }
  scope :standard_operating_objectives, -> { where(objective_type: :standard_operating) }
end

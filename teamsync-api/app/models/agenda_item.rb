class AgendaItem < ApplicationRecord
  belongs_to :meeting

  validates :title, presence: true, length: { minimum: 1, maximum: 500 }
  validates :display_order, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :description, length: { maximum: 5000 }, allow_blank: true
  validates :decision_notes, length: { maximum: 5000 }, allow_blank: true

  scope :by_display_order, -> { order(:display_order) }
  scope :completed, -> { where(is_complete: true) }
  scope :incomplete, -> { where(is_complete: false) }
end

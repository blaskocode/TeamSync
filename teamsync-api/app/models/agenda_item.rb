class AgendaItem < ApplicationRecord
  belongs_to :meeting

  validates :title, presence: true
  validates :display_order, presence: true

  scope :by_display_order, -> { order(:display_order) }
  scope :completed, -> { where(is_complete: true) }
  scope :incomplete, -> { where(is_complete: false) }
end

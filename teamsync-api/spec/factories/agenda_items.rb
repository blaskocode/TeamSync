FactoryBot.define do
  factory :agenda_item do
    meeting { nil }
    title { "MyString" }
    description { "MyText" }
    display_order { 1 }
    is_complete { false }
    decision_notes { "MyText" }
  end
end

FactoryBot.define do
  factory :objective do
    meeting { nil }
    objective_type { 1 }
    title { "MyString" }
    description { "MyText" }
    status_color { 1 }
    display_order { 1 }
  end
end

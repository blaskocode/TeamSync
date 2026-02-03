FactoryBot.define do
  factory :meeting_participant do
    meeting { nil }
    user { nil }
    first_name { "MyString" }
    last_name { "MyString" }
    role { "MyString" }
    working_genius_profile { "MyText" }
  end
end

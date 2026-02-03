FactoryBot.define do
  factory :meeting do
    team { nil }
    meeting_date { "2026-02-02" }
    team_goal { "MyText" }
    strategic_topics { "MyText" }
    cascading_communications { "MyText" }
    whiteboard_notes { "MyText" }
  end
end

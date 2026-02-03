# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding database..."

# Create admin user
admin = User.find_or_create_by!(email: "admin@example.com") do |u|
  u.password = "password123"
  u.first_name = "Admin"
  u.last_name = "User"
  u.role = :admin
end
puts "Created admin user: #{admin.email}"

# Create coach user
coach = User.find_or_create_by!(email: "coach@example.com") do |u|
  u.password = "password123"
  u.first_name = "Coach"
  u.last_name = "User"
  u.role = :coach
end
puts "Created coach user: #{coach.email}"

# Create member users
member1 = User.find_or_create_by!(email: "member1@example.com") do |u|
  u.password = "password123"
  u.first_name = "Alice"
  u.last_name = "Johnson"
  u.role = :member
end
puts "Created member user: #{member1.email}"

member2 = User.find_or_create_by!(email: "member2@example.com") do |u|
  u.password = "password123"
  u.first_name = "Bob"
  u.last_name = "Smith"
  u.role = :member
end
puts "Created member user: #{member2.email}"

# Create demo team
team = Team.find_or_create_by!(name: "Demo Team") do |t|
  # Team is created here
end
puts "Created team: #{team.name}"

# Add team memberships
TeamMembership.find_or_create_by!(user: coach, team: team) do |tm|
  tm.role = :coach
  tm.working_genius_profile = "W/I/T"
end
puts "Added #{coach.full_name} as coach"

TeamMembership.find_or_create_by!(user: member1, team: team) do |tm|
  tm.role = :member
  tm.working_genius_profile = "D/G/E"
end
puts "Added #{member1.full_name} as member"

TeamMembership.find_or_create_by!(user: member2, team: team) do |tm|
  tm.role = :member
  tm.working_genius_profile = "I/E/T"
end
puts "Added #{member2.full_name} as member"

# Create a meeting
meeting = Meeting.find_or_create_by!(team: team, meeting_date: Date.today) do |m|
  m.team_goal = "Deliver Q1 Product Launch Successfully"
  m.strategic_topics = "<p><strong>Key Initiatives:</strong></p><ul><li>Product roadmap alignment</li><li>Resource allocation</li><li>Market positioning</li></ul>"
  m.cascading_communications = "<p>Communicate launch timeline to all stakeholders</p>"
  m.whiteboard_notes = "<p>Discussion notes will go here...</p>"
end
puts "Created meeting for #{meeting.meeting_date}"

# Add meeting participants
MeetingParticipant.find_or_create_by!(meeting: meeting, user: coach) do |mp|
  mp.first_name = coach.first_name
  mp.last_name = coach.last_name
  mp.role = "coach"
  mp.working_genius_profile = "W/I/T"
end

MeetingParticipant.find_or_create_by!(meeting: meeting, user: member1) do |mp|
  mp.first_name = member1.first_name
  mp.last_name = member1.last_name
  mp.role = "member"
  mp.working_genius_profile = "D/G/E"
end

MeetingParticipant.find_or_create_by!(meeting: meeting, user: member2) do |mp|
  mp.first_name = member2.first_name
  mp.last_name = member2.last_name
  mp.role = "member"
  mp.working_genius_profile = "I/E/T"
end
puts "Added meeting participants"

# Create objectives
Objective.find_or_create_by!(
  meeting: meeting,
  objective_type: :defining,
  title: "Launch New Product",
  display_order: 0
) do |obj|
  obj.description = "<p>Successfully launch our flagship product to market by Q1 end</p>"
  obj.status_color = :green
end

Objective.find_or_create_by!(
  meeting: meeting,
  objective_type: :defining,
  title: "Achieve 100 Beta Users",
  display_order: 1
) do |obj|
  obj.description = "<p>Recruit and onboard 100 beta testers before official launch</p>"
  obj.status_color = :yellow
end

Objective.find_or_create_by!(
  meeting: meeting,
  objective_type: :standard_operating,
  title: "Weekly Team Standups",
  display_order: 2
) do |obj|
  obj.description = "<p>Maintain consistent weekly check-ins with all team members</p>"
  obj.status_color = :green
end

Objective.find_or_create_by!(
  meeting: meeting,
  objective_type: :standard_operating,
  title: "Customer Support Response Time < 24h",
  display_order: 3
) do |obj|
  obj.description = "<p>Respond to all customer inquiries within 24 hours</p>"
  obj.status_color = :yellow
end
puts "Created objectives"

# Create agenda items
AgendaItem.find_or_create_by!(
  meeting: meeting,
  title: "Review Q1 Progress",
  display_order: 0
) do |item|
  item.description = "Review progress against Q1 goals and adjust as needed"
  item.is_complete = true
  item.decision_notes = "Team is on track. Minor adjustments to marketing timeline."
end

AgendaItem.find_or_create_by!(
  meeting: meeting,
  title: "Discuss Beta Feedback",
  display_order: 1
) do |item|
  item.description = "Review feedback from beta testers and prioritize fixes"
  item.is_complete = false
end

AgendaItem.find_or_create_by!(
  meeting: meeting,
  title: "Plan Launch Event",
  display_order: 2
) do |item|
  item.description = "Finalize details for product launch event"
  item.is_complete = false
end
puts "Created agenda items"

puts "Seeding complete!"

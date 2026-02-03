# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_03_053230) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "agenda_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "decision_notes"
    t.text "description"
    t.integer "display_order", default: 0, null: false
    t.boolean "is_complete", default: false, null: false
    t.bigint "meeting_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["meeting_id", "display_order"], name: "index_agenda_items_on_meeting_id_and_display_order"
    t.index ["meeting_id"], name: "index_agenda_items_on_meeting_id"
  end

  create_table "meeting_participants", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.bigint "meeting_id", null: false
    t.string "role"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.text "working_genius_profile"
    t.index ["meeting_id"], name: "index_meeting_participants_on_meeting_id"
    t.index ["user_id"], name: "index_meeting_participants_on_user_id"
  end

  create_table "meetings", force: :cascade do |t|
    t.text "cascading_communications"
    t.datetime "created_at", null: false
    t.date "meeting_date", null: false
    t.text "strategic_topics"
    t.text "team_goal"
    t.bigint "team_id", null: false
    t.datetime "updated_at", null: false
    t.text "whiteboard_notes"
    t.index ["meeting_date"], name: "index_meetings_on_meeting_date"
    t.index ["team_id", "meeting_date"], name: "index_meetings_on_team_id_and_meeting_date", unique: true
    t.index ["team_id"], name: "index_meetings_on_team_id"
  end

  create_table "objectives", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "display_order", default: 0, null: false
    t.bigint "meeting_id", null: false
    t.integer "objective_type", null: false
    t.integer "status_color", default: 0, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["meeting_id", "display_order"], name: "index_objectives_on_meeting_id_and_display_order"
    t.index ["meeting_id"], name: "index_objectives_on_meeting_id"
  end

  create_table "team_memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "role", default: 1, null: false
    t.bigint "team_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.text "working_genius_profile"
    t.index ["team_id"], name: "index_team_memberships_on_team_id"
    t.index ["user_id", "team_id"], name: "index_team_memberships_on_user_id_and_team_id", unique: true
    t.index ["user_id"], name: "index_team_memberships_on_user_id"
  end

  create_table "teams", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "password_digest", null: false
    t.integer "role", default: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "agenda_items", "meetings"
  add_foreign_key "meeting_participants", "meetings"
  add_foreign_key "meeting_participants", "users"
  add_foreign_key "meetings", "teams"
  add_foreign_key "objectives", "meetings"
  add_foreign_key "team_memberships", "teams"
  add_foreign_key "team_memberships", "users"
end

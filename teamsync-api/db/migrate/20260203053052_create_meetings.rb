class CreateMeetings < ActiveRecord::Migration[8.1]
  def change
    create_table :meetings do |t|
      t.references :team, null: false, foreign_key: true
      t.date :meeting_date, null: false
      t.text :team_goal
      t.text :strategic_topics
      t.text :cascading_communications
      t.text :whiteboard_notes

      t.timestamps
    end

    add_index :meetings, [:team_id, :meeting_date], unique: true
    add_index :meetings, :meeting_date
  end
end

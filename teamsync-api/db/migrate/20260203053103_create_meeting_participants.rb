class CreateMeetingParticipants < ActiveRecord::Migration[8.1]
  def change
    create_table :meeting_participants do |t|
      t.references :meeting, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :first_name
      t.string :last_name
      t.string :role
      t.text :working_genius_profile

      t.timestamps
    end
  end
end

class CreateTeamMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :team_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :team, null: false, foreign_key: true
      t.integer :role, null: false, default: 1
      t.text :working_genius_profile

      t.timestamps
    end

    add_index :team_memberships, [:user_id, :team_id], unique: true
  end
end

class CreateObjectives < ActiveRecord::Migration[8.1]
  def change
    create_table :objectives do |t|
      t.references :meeting, null: false, foreign_key: true
      t.integer :objective_type, null: false
      t.string :title, null: false
      t.text :description
      t.integer :status_color, null: false, default: 0
      t.integer :display_order, null: false, default: 0

      t.timestamps
    end

    add_index :objectives, [:meeting_id, :display_order]
  end
end

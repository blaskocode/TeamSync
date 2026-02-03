class CreateAgendaItems < ActiveRecord::Migration[8.1]
  def change
    create_table :agenda_items do |t|
      t.references :meeting, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.integer :display_order, null: false, default: 0
      t.boolean :is_complete, null: false, default: false
      t.text :decision_notes

      t.timestamps
    end

    add_index :agenda_items, [:meeting_id, :display_order]
  end
end

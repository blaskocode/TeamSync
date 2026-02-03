require 'prawn'

class PdfGeneratorService
  def initialize(meeting)
    @meeting = meeting
  end

  def generate
    Prawn::Document.new do |pdf|
      # Header
      pdf.text @meeting.team.name, size: 24, style: :bold
      pdf.text "Team Meeting", size: 18, style: :bold
      pdf.move_down 10
      pdf.text "Date: #{@meeting.meeting_date.strftime('%A, %B %d, %Y')}", size: 12
      pdf.stroke_horizontal_rule
      pdf.move_down 20

      # Team Goal
      if @meeting.team_goal.present?
        pdf.text "Team Goal", size: 16, style: :bold
        pdf.move_down 5
        pdf.text strip_html(@meeting.team_goal), size: 11
        pdf.move_down 15
      end

      # Defining Objectives
      defining = @meeting.objectives.defining_objectives.by_display_order
      if defining.any?
        pdf.text "Defining Objectives", size: 16, style: :bold
        pdf.move_down 10
        defining.each do |obj|
          render_objective(pdf, obj)
        end
        pdf.move_down 15
      end

      # Standard Operating Objectives
      standard = @meeting.objectives.standard_operating_objectives.by_display_order
      if standard.any?
        pdf.text "Standard Operating Objectives", size: 16, style: :bold
        pdf.move_down 10
        standard.each do |obj|
          render_objective(pdf, obj)
        end
        pdf.move_down 15
      end

      # Strategic Topics
      if @meeting.strategic_topics.present?
        pdf.text "Strategic Topics", size: 16, style: :bold
        pdf.move_down 5
        pdf.text strip_html(@meeting.strategic_topics), size: 11
        pdf.move_down 15
      end

      # Agenda Items
      agenda_items = @meeting.agenda_items.by_display_order
      if agenda_items.any?
        pdf.text "Agenda", size: 16, style: :bold
        pdf.move_down 10
        agenda_items.each do |item|
          render_agenda_item(pdf, item)
        end
        pdf.move_down 15
      end

      # Cascading Communications
      if @meeting.cascading_communications.present?
        pdf.text "Cascading Communications", size: 16, style: :bold
        pdf.move_down 5
        pdf.text strip_html(@meeting.cascading_communications), size: 11
        pdf.move_down 15
      end

      # Whiteboard Notes
      if @meeting.whiteboard_notes.present?
        pdf.text "Whiteboard / Notes", size: 16, style: :bold
        pdf.move_down 5
        pdf.text strip_html(@meeting.whiteboard_notes), size: 11
      end

      # Footer
      pdf.move_down 30
      pdf.stroke_horizontal_rule
      pdf.move_down 10
      pdf.text "Generated on #{Time.current.strftime('%B %d, %Y at %I:%M %p')}", size: 9, align: :center, style: :italic
    end
  end

  private

  def render_objective(pdf, obj)
    status_text = case obj.status_color
                  when 'green' then '🟢'
                  when 'yellow' then '🟡'
                  when 'red' then '🔴'
                  else '⚪'
                  end

    pdf.text "#{status_text} #{obj.title}", size: 12, style: :bold
    if obj.description.present?
      pdf.move_down 3
      pdf.text strip_html(obj.description), size: 10, indent_paragraphs: 20
    end
    pdf.move_down 8
  end

  def render_agenda_item(pdf, item)
    checkbox = item.is_complete ? '☑' : '☐'
    pdf.text "#{checkbox} #{item.title}", size: 12, style: :bold

    if item.description.present?
      pdf.move_down 3
      pdf.text item.description, size: 10, indent_paragraphs: 20
    end

    if item.is_complete && item.decision_notes.present?
      pdf.move_down 5
      pdf.text "Decision: #{item.decision_notes}", size: 10, indent_paragraphs: 20, style: :italic
    end

    pdf.move_down 8
  end

  def strip_html(html)
    return '' if html.blank?
    # Simple HTML stripping - removes tags and decodes entities
    html.gsub(/<\/?[^>]*>/, '').gsub('&nbsp;', ' ').gsub('&amp;', '&').gsub('&lt;', '<').gsub('&gt;', '>').strip
  end
end

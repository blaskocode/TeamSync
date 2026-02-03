import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onBlur?: () => void;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder: _placeholder = 'Start typing...',
  onBlur,
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) onBlur();
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2 border border-gray-300 rounded-md',
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-300 rounded-md ${disabled ? 'bg-gray-100' : ''}`}>
      {!disabled && (
        <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-sm rounded ${
              editor.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
            type="button"
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-sm rounded ${
              editor.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
            type="button"
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-sm rounded ${
              editor.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
            type="button"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-sm rounded ${
              editor.isActive('orderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
            type="button"
          >
            1. List
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

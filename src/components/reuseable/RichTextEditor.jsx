'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdLink,
  MdLinkOff,
  MdUndo,
  MdRedo
} from 'react-icons/md';

/**
 * Deliberately simple rich-text editor for Christian Articles' `content`
 * field (see app/models/article.js) - Tiptap, with only the toolbar
 * actions the spec calls for. No tables, colours, fonts, emojis, code
 * blocks, raw HTML editing, or embedded media - those extensions are
 * either not installed at all, or explicitly disabled below so a markdown
 * shortcut (e.g. ``` or ~~) can't sneak one in past the toolbar.
 *
 * Uncontrolled after mount, same as any Tiptap editor: it initializes from
 * `value` once and calls `onChange(html)` as the admin types. To load a
 * different article (or reset to a blank one) into the same drawer, give
 * this component a fresh `key` from the parent (e.g. `key={fields._id ||
 * 'new'}`) - that remounts the editor with the new initial content instead
 * of fighting a controlled-value sync on every keystroke.
 */
const ToolbarButton = ({ onClick, active, disabled, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline-secondary'}`}
    style={{ border: active ? undefined : '1px solid #dee2e6' }}
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
      })
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'form-control border-dark',
        style: 'min-height: 220px; overflow-y: auto;'
      }
    }
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    // eslint-disable-next-line no-alert
    const url = window.prompt('Enter a URL', previousUrl || 'https://');

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-1 mb-2 p-2" style={{ border: '1px solid #dee2e6', borderRadius: '0.375rem 0.375rem 0 0', backgroundColor: '#f8f9fa' }}>
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <MdFormatBold size={18} />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <MdFormatItalic size={18} />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <MdFormatUnderlined size={18} />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <ToolbarButton label="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <MdFormatListBulleted size={18} />
        </ToolbarButton>
        <ToolbarButton label="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <MdFormatListNumbered size={18} />
        </ToolbarButton>
        <ToolbarButton label="Block Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <MdFormatQuote size={18} />
        </ToolbarButton>
        <ToolbarButton label="Add Link" active={editor.isActive('link')} onClick={setLink}>
          <MdLink size={18} />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton label="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <MdLinkOff size={18} />
          </ToolbarButton>
        )}
        <div className="vr mx-1" />
        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <MdUndo size={18} />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <MdRedo size={18} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

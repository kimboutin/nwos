import { defineField } from 'sanity'

/**
 * Minimal rich-text block used across all long-text fields.
 * Supports: italic, bold, and external links.
 */
export const richTextBlock = {
  type: 'block' as const,
  styles: [{ title: 'Normal', value: 'normal' }],
  lists: [],
  marks: {
    decorators: [
      { title: 'Italic', value: 'em' },
      { title: 'Bold',   value: 'strong' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'External Link',
        fields: [
          defineField({ name: 'href',  title: 'URL',             type: 'url' }),
          defineField({ name: 'blank', title: 'Open in new tab', type: 'boolean', initialValue: true }),
        ],
      },
    ],
  },
}

import { defineField, defineType } from 'sanity'
import { richTextBlock } from './shared'

export const festivalTheme = defineType({
  name: 'festivalTheme',
  title: 'Theme',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: '1 = first. Controls the left-to-right order on the homepage.',
    }),
    defineField({
      name: 'videoLoop',
      title: 'Video Loop',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Looping video (MP4). Will play silently on the homepage.',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'array',
      of: [richTextBlock],
      description: 'Supports italic, bold, and links.',
    }),
    defineField({
      name: 'participants',
      title: 'Participants',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Names of participants for this theme (one per entry).',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'order' },
  },
})

import { defineField, defineType } from 'sanity'
import { richTextBlock } from './shared'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'array',
      of: [richTextBlock],
      description: 'Supports italic, bold, and links.',
    }),
    defineField({
      name: 'generalEmail',
      title: 'General Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'pressEmail',
      title: 'Press Inquiries Email',
      type: 'string',
    }),
  ],
  preview: { select: { title: 'title' } },
})

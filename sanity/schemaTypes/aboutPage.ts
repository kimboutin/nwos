import { defineField, defineType } from 'sanity'
import { richTextBlock } from './shared'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      initialValue: 'About',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Featured image shown beside the body text.',
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'array',
      of: [richTextBlock],
      description: 'Supports italic, bold, and links.',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
  },
})

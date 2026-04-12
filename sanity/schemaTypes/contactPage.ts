import { defineField, defineType } from 'sanity'

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
      type: 'text',
      rows: 3,
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

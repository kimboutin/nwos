import { defineField, defineType } from 'sanity'

export const edition2026Page = defineType({
  name: 'edition2026Page',
  title: '2026 Edition Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Main heading on the 2026 page.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'string',
      description: 'e.g. "October 2026"',
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration Form URL',
      type: 'url',
      description: 'Link to your Typeform, Tally, or other registration form.',
    }),
  ],
  preview: {
    select: { title: 'heroTitle' },
  },
})

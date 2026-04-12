import { defineField, defineType } from 'sanity'

export const edition = defineType({
  name: 'edition',
  title: 'Edition',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (rule) => rule.required().integer().min(2000),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Past', value: 'past' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'overviewDescription',
      title: 'Overview Description',
      type: 'text',
      rows: 4,
      description: 'Paragraph displayed below the aftermovie.',
    }),
    defineField({
      name: 'aftermovie',
      title: 'Aftermovie',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Upload the aftermovie video file (MP4 recommended).',
    }),
    defineField({
      name: 'aftermoviePoster',
      title: 'Aftermovie Poster',
      type: 'image',
      options: { hotspot: true },
      description: 'Thumbnail shown before the user presses play.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'year' },
  },
})

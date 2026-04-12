import { defineField, defineType } from 'sanity'

export const supportPage = defineType({
  name: 'supportPage',
  title: 'Support Us Page',
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
      rows: 4,
    }),
    defineField({
      name: 'partnershipEmail',
      title: 'Partnership Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'ways',
      title: 'Ways to Support',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title',       type: 'string', title: 'Title' }),
          defineField({ name: 'description', type: 'text',   title: 'Description', rows: 3 }),
          defineField({ name: 'ctaLabel',    type: 'string', title: 'Button Label' }),
          defineField({ name: 'ctaUrl',      type: 'url',    title: 'Button URL' }),
        ],
        preview: { select: { title: 'title' } },
      }],
    }),
  ],
  preview: { select: { title: 'title' } },
})

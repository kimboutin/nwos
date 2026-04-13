import { defineField, defineType } from 'sanity'
import { richTextBlock } from './shared'

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
      type: 'array',
      of: [richTextBlock],
      description: 'Supports italic, bold, and links.',
    }),
    defineField({
      name: 'ways',
      title: 'Ways to Support',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title',       type: 'string', title: 'Title' }),
          defineField({ name: 'description', type: 'array',  title: 'Description', of: [richTextBlock] }),
          defineField({ name: 'ctaLabel',    type: 'string', title: 'Button Label' }),
          defineField({ name: 'ctaUrl',      type: 'url',    title: 'Button URL' }),
        ],
        preview: { select: { title: 'title' } },
      }],
    }),
    defineField({
      name: 'partners',
      title: 'Partners',
      type: 'array',
      description: 'Partners and collaborators shown on this page.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name',        type: 'string', title: 'Partner Name' }),
          defineField({ name: 'role',        type: 'string', title: 'Role (e.g. Strategic Partner)' }),
          defineField({ name: 'description', type: 'array',  title: 'Description', of: [richTextBlock] }),
        ],
        preview: { select: { title: 'name', subtitle: 'role' } },
      }],
    }),
    defineField({
      name: 'partnershipEmail',
      title: 'Partnership Contact Email',
      type: 'string',
    }),
  ],
  preview: { select: { title: 'title' } },
})

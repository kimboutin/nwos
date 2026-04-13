import { defineField, defineType } from 'sanity'
import { richTextBlock } from './shared'

export const speaker = defineType({
  name: 'speaker',
  title: 'Speaker',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
      description: 'Auto-generated from name — used for the speaker profile URL.',
    }),
    defineField({
      name: 'role',
      title: 'Job Title',
      type: 'string',
    }),
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'array',
      of: [richTextBlock],
      description: 'Supports italic, bold, and links.',
    }),
    defineField({
      name: 'workImages',
      title: 'Images of Work',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (rule) => rule.max(12),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})

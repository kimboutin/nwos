import { defineField, defineType } from 'sanity'

export const partner = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'tier',
      title: 'Tier',
      type: 'string',
      options: {
        list: [
          { title: 'Main', value: 'main' },
          { title: 'Support', value: 'support' },
          { title: 'Media', value: 'media' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tier', media: 'logo' },
  },
})

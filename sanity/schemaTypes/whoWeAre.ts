import { defineField, defineType } from 'sanity'
import { richTextBlock } from './shared'

export const whoWeAre = defineType({
  name: 'whoWeAre',
  title: 'Who We Are',
  type: 'document',
  fields: [
    defineField({
      name: 'introText',
      title: 'Intro Paragraph',
      type: 'array',
      of: [richTextBlock],
      description: 'Large opening text. Supports italic, bold, and links.',
    }),
    defineField({
      name: 'participantQuote',
      title: 'Participant Quote',
      type: 'array',
      of: [richTextBlock],
      description: 'Displayed in the quote section. Include quotation marks in the text.',
    }),
    defineField({
      name: 'aboutText',
      title: 'About Paragraph',
      type: 'array',
      of: [richTextBlock],
      description: 'Shorter paragraph below the collage.',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
      type: 'array',
      description: 'Photos for the auto-scrolling slideshow.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'introText' },
    prepare() {
      return { title: 'Who We Are' }
    },
  },
})

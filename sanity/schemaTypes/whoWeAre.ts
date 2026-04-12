import { defineField, defineType } from 'sanity'

export const whoWeAre = defineType({
  name: 'whoWeAre',
  title: 'Who We Are',
  type: 'document',
  fields: [
    defineField({
      name: 'introText',
      title: 'Intro Paragraph',
      type: 'text',
      rows: 5,
      description: 'Large opening text. Any occurrence of "New Ways of Seeing" will be italicised automatically on the site.',
    }),
    defineField({
      name: 'participantQuote',
      title: 'Participant Quote',
      type: 'string',
      description: 'Displayed in the photo collage. Include the quotation marks.',
    }),
    defineField({
      name: 'aboutText',
      title: 'About Paragraph',
      type: 'text',
      rows: 4,
      description: 'Shorter paragraph below the collage.',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
      type: 'array',
      description: 'Photos for the auto-scrolling slideshow. Add as many as you like.',
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
    prepare({ title }) {
      return { title: 'Who We Are', subtitle: title?.slice(0, 80) ?? '' }
    },
  },
})

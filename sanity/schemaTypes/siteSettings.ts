import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'festivalName',
      title: 'Festival Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    // ── Backdrop ──────────────────────────────────────────────────────────────
    defineField({
      name: 'backdropType',
      title: 'Backdrop Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video (looping)', value: 'video' },
          { title: 'Image',          value: 'image' },
        ],
        layout: 'radio',
      },
      initialValue: 'video',
      description: 'Choose whether the full-bleed background is a looping video or a still image.',
    }),
    defineField({
      name: 'backdropVideo',
      title: 'Backdrop Video',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Looping background video (MP4 recommended). Leave empty to use the default loop.',
      hidden: ({ document }) => (document?.backdropType as string) === 'image',
    }),
    defineField({
      name: 'backdropImage',
      title: 'Backdrop Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-bleed background image.',
      hidden: ({ document }) => (document?.backdropType as string) !== 'image',
    }),

    // ── Links ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'mailingListUrl',
      title: 'Mailing List URL',
      type: 'url',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'supportUrl',
      title: 'Support Us URL',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'festivalName' },
  },
})

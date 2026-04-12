import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([

      // ── Who We Are ─────────────────────────────────────────
      S.listItem()
        .title('Who We Are')
        .child(
          S.document()
            .schemaType('whoWeAre')
            .documentId('whoWeAre')
            .title('Who We Are')
        ),

      S.divider(),

      // ── 2025 Edition ────────────────────────────────────────
      S.listItem()
        .title('2025 Edition')
        .child(
          S.list()
            .title('2025 Edition')
            .items([
              S.listItem()
                .title('Aftermovie & Info')
                .child(
                  S.documentList()
                    .title('Editions')
                    .filter('_type == "edition"')
                ),
              S.listItem()
                .title('Line-Up (Speakers)')
                .child(
                  S.documentList()
                    .title('Speakers')
                    .filter('_type == "speaker"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'asc' }])
                ),
              S.listItem()
                .title('Themes')
                .child(
                  S.documentList()
                    .title('Themes')
                    .filter('_type == "festivalTheme"')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }])
                ),
            ])
        ),

      S.divider(),

      // ── 2026 Edition Page ───────────────────────────────────
      S.listItem()
        .title('2026 Edition Page')
        .child(
          S.document()
            .schemaType('edition2026Page')
            .documentId('edition2026Page')
            .title('2026 Edition Page')
        ),

      S.divider(),

      // ── Support Us Page ─────────────────────────────────────
      S.listItem()
        .title('Support Us Page')
        .child(
          S.document()
            .schemaType('supportPage')
            .documentId('supportPage')
            .title('Support Us Page')
        ),

      // ── Contact Page ────────────────────────────────────────
      S.listItem()
        .title('Contact Page')
        .child(
          S.document()
            .schemaType('contactPage')
            .documentId('contactPage')
            .title('Contact Page')
        ),

      S.divider(),

      // ── Site Settings (backdrop, links, contact) ───────────
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings')
        ),

    ])

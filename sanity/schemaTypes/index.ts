import { type SchemaTypeDefinition } from 'sanity'
import { whoWeAre } from './whoWeAre'
import { edition } from './edition'
import { speaker } from './speaker'
import { festivalTheme } from './festivalTheme'
import { venue } from './venue'
import { partner } from './partner'
import { siteSettings } from './siteSettings'
import { edition2026Page } from './edition2026Page'
import { supportPage } from './supportPage'
import { contactPage } from './contactPage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [whoWeAre, edition, speaker, festivalTheme, venue, partner, siteSettings, edition2026Page, supportPage, contactPage],
}

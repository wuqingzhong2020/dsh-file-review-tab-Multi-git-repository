import type { Context } from '@deepseek-ai/cordis'
import type { SettingsForms } from '@deepseek-ai/dsh-settings'
import { reviewProjectSchema, reviewSettingsSchema } from './repository-schemas.ts'
import type { ReviewProject, ReviewProjectSettings, SaveReviewProjects } from './repository-types.ts'
import { PACKAGE_NAME } from './typert-descriptors.ts'

/** All writes go through the Desktop profile's native revision-fenced settings. */
export class RepositorySettings {
  private settings: SettingsForms | undefined

  constructor(private readonly ctx: Context, private readonly initial: ReviewProject[] = []) {
    ctx.inject(['settings'], (sctx) => {
      this.settings = sctx.settings
      ctx.effect(() => sctx.settings.configure({ auto: false }, ctx.fiber), 'file-review: custom settings')
      return () => { this.settings = undefined }
    })
  }

  get(): ReviewProjectSettings {
    const entry = this.entry()
    const descriptor = this.settings?.describe({ redactSecrets: true }).find(item => item.ns === entry?.options.id)
    const value = descriptor?.value as { projects?: unknown } | undefined
    return {
      projects: reviewProjectSchema.array().parse(value?.projects ?? this.initial),
      revision: descriptor?.revision ?? 0,
    }
  }

  async save(request: SaveReviewProjects): Promise<ReviewProjectSettings> {
    const validated = reviewSettingsSchema.parse(request)
    const entry = this.entry()
    if (this.settings === undefined || typeof entry?.options.id !== 'string') throw new Error('Native project settings are unavailable')
    await this.settings.update(entry.options.id, { projects: validated.projects }, validated.revision)
    return this.get()
  }

  private entry() {
    const loader = (this.ctx as Context & { loader?: { entries(): Iterable<{ fiber?: unknown; options: { id?: string; name?: string } }> } }).loader
    return [...(loader?.entries() ?? [])].find(entry => entry.fiber === this.ctx.fiber && entry.options.name === PACKAGE_NAME)
  }
}

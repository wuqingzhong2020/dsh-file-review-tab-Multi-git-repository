import schema from '@deepseek-ai/schemastery'

export interface FileReviewConfig {
  reviewSettings?: {
    layout: 'unified' | 'split'
    wrap: boolean
    dock: boolean
    adaptive: boolean
    foldMessages: boolean
  }
}

/** Review preferences belong here; project declarations belong to the manager. */
export const Config: schema = schema.object({
  reviewSettingsOwner: schema.const('dsh-file-review-tab-multi-git-repository'),
  reviewSettings: schema.object({
    layout: schema.union([schema.const('unified'), schema.const('split')]).default('unified'),
    wrap: schema.boolean().default(true),
    dock: schema.boolean().default(true),
    adaptive: schema.boolean().default(true),
    foldMessages: schema.boolean().default(true),
  }).default({}).volatile(),
})

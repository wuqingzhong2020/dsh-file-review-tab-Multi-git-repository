import schema from '@deepseek-ai/schemastery'
import type { ReviewProject } from './repository-types.ts'

export interface FileReviewConfig {
  enabled?: boolean
  projects: ReviewProject[]
  reviewSettings?: {
    layout: 'unified' | 'split'
    wrap: boolean
    dock: boolean
    adaptive: boolean
    foldMessages: boolean
  }
}

/** DSH's volatile schema preserves the service and recordings during live saves. */
export const Config: schema = schema.object({
  reviewSettingsOwner: schema.const('dsh-file-review-tab-multi-git-repository'),
  reviewSettings: schema.object({
    layout: schema.union([schema.const('unified'), schema.const('split')]).default('unified'),
    wrap: schema.boolean().default(true),
    dock: schema.boolean().default(true),
    adaptive: schema.boolean().default(true),
    foldMessages: schema.boolean().default(true),
  }).default({}).volatile(),
  enabled: schema.boolean().default(true).i18n({ zh: '是否启用多代码仓管理', en: 'Enable multi-repository management' }),
  projects: schema.array(schema.object({
    name: schema.string().default(''),
    root: schema.string().required(),
    enabled: schema.boolean().default(true).i18n({ zh: '是否启用该项目的多代码仓管理', en: 'Enable multi-repository management for this project' }),
    includeProjectRoot: schema.boolean().default(true),
    configFiles: schema.array(schema.string()).default([]),
    repositories: schema.array(schema.string()).default([]),
  })).default([]).volatile(),
})

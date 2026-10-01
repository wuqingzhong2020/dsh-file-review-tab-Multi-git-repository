import schema from '@deepseek-ai/schemastery'
import type { ReviewProject } from './repository-types.ts'

export interface FileReviewConfig {
  enabled?: boolean
  projects: ReviewProject[]
}

/** DSH's volatile schema preserves the service and recordings during live saves. */
export const Config: schema = schema.object({
  enabled: schema.boolean().default(true).description('是否启用多代码仓管理'),
  projects: schema.array(schema.object({
    name: schema.string().default(''),
    root: schema.string().required(),
    enabled: schema.boolean().default(true).description('是否启用该项目的多代码仓管理'),
    includeProjectRoot: schema.boolean().default(true),
    configFiles: schema.array(schema.string()).default([]),
    repositories: schema.array(schema.string()).default([]),
  })).default([]).volatile(),
})

/** Strict Typert codecs shared by the Host and browser contribution artifacts. */

import { z } from 'zod'
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'
import { namedReviewRepositorySchema, reviewProjectPageSchema, reviewWorkspaceSchema, saveReviewProjectSchema } from './repository-schemas.ts'
import { gitReviewDiffSchema, gitReviewFileRequestSchema, gitReviewRequestSchema, gitReviewResultSchema } from './git-review-schemas.ts'
import { USER_GUIDE_IMAGES } from './user-guide.ts'

export const PACKAGE_NAME = 'dsh-file-review-tab-multi-git-repository'

const userGuideDocumentSchema = z.object({
  path: z.string().min(1).max(4096), markdown: z.string().max(512 * 1024),
  images: z.partialRecord(z.enum(USER_GUIDE_IMAGES.map(name => `image/${name}`)), z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(2 * 1024 * 1024)),
})

const locationRequestSchema = z.object({
  repository: z.string().min(1).max(4096), path: z.string().min(1).max(4096), source: z.string().max(4096),
  side: z.enum(['old', 'new']), line: z.number().int().min(1).max(10000000), endLine: z.number().int().min(1).max(10000000),
  quote: z.string().max(65536), before: z.string().max(65536), after: z.string().max(65536),
  fullText: z.string().max(8 * 1024 * 1024).optional(), allowRelocate: z.boolean().optional(), editorPath: z.string().max(4096).optional(),
})
const locationResultSchema = z.object({
  state: z.enum(['exact', 'moved', 'ambiguous', 'changed', 'missing', 'unsupported', 'started', 'editor-missing', 'error']),
  line: z.number().int().min(1).optional(), endLine: z.number().int().min(1).optional(), reason: z.string().optional(),
})

const diffSchema = z.object({
  path: z.string(),
  oldText: z.string().nullable(),
  newText: z.string(),
  oldStart: z.number().int().min(1).optional(),
  newStart: z.number().int().min(1).optional(),
})

const requestSchema = z.object({
  action: z.enum(['undo', 'redo']),
  files: z.array(z.object({ path: z.string(), diffs: z.array(diffSchema) })),
})

const resultSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    state: z.enum(['applied', 'undone', 'conflict', 'unsupported', 'error']),
    changed: z.boolean(),
    reason: z.string().optional(),
  })),
})

const agentCodec = {
  mode: 'strict' as const,
  typeSymbol: '@deepseek-ai/dsh-session/types#SessionId',
  create: () => z.intersection(z.string(), z.unknown()),
}

const requestCodec = {
  mode: 'strict' as const,
  typeSymbol: `${PACKAGE_NAME}#FileReviewRequest`,
  create: () => requestSchema,
}

const resultCodec = {
  mode: 'strict' as const,
  typeSymbol: `${PACKAGE_NAME}#FileReviewResult`,
  create: () => resultSchema,
}

const recordedMutationSchema = z.object({
  rootCallId: z.string(),
  name: z.string(),
  path: z.string(),
  before: z.string().nullable(),
  after: z.string(),
})

const recordedRequestSchema = z.object({
  rootCallIds: z.array(z.string()),
})

const recordedResultSchema = z.object({
  mutations: z.array(recordedMutationSchema),
})

const recordedRequestCodec = {
  mode: 'strict' as const,
  typeSymbol: `${PACKAGE_NAME}#RecordedRequest`,
  create: () => recordedRequestSchema,
}

const recordedResultCodec = {
  mode: 'strict' as const,
  typeSymbol: `${PACKAGE_NAME}#RecordedResult`,
  create: () => recordedResultSchema,
}

function descriptor(method: 'status' | 'apply'): InvocationDescriptor {
  return {
    id: `${PACKAGE_NAME}#fileReview/${method}`,
    service: 'fileReview',
    namespace: 'fileReview',
    method,
    invocation: { kind: 'direct' },
    scope: { context: 'agent', wire: 'agentId' },
    parameters: [{
      name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec,
    }, {
      name: 'request', wire: 'request', source: 'json', codec: requestCodec,
    }],
    result: resultCodec,
  }
}

function recordedDescriptor(): InvocationDescriptor {
  return {
    id: `${PACKAGE_NAME}#fileReview/recorded`,
    service: 'fileReview',
    namespace: 'fileReview',
    method: 'recorded',
    invocation: { kind: 'direct' },
    scope: { context: 'agent', wire: 'agentId' },
    parameters: [{
      name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec,
    }, {
      name: 'request', wire: 'request', source: 'json', codec: recordedRequestCodec,
    }],
    result: recordedResultCodec,
  }
}

export const FILE_REVIEW_INVOCATIONS: readonly InvocationDescriptor[] = [
  ...(['locateReference', 'openEditor'] as const).map(method => ({
    id: `${PACKAGE_NAME}#fileReview/${method}`, service: 'fileReview', namespace: 'fileReview', method,
    invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'request', wire: 'request', source: 'json', codec: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewLocationRequest`, create: () => locationRequestSchema } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewLocationResult`, create: () => locationResultSchema },
  } satisfies InvocationDescriptor)),
  ...(['gitReview', 'gitReviewDiff'] as const).map(method => ({
    id: `${PACKAGE_NAME}#fileReview/${method}`, service: 'fileReview', namespace: 'fileReview', method,
    invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'request', wire: 'request', source: 'json', codec: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#${method === 'gitReview' ? 'GitReviewRequest' : 'GitReviewFileRequest'}`, create: () => method === 'gitReview' ? gitReviewRequestSchema : gitReviewFileRequestSchema } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#${method === 'gitReview' ? 'GitReviewResult' : 'GitReviewDiff'}`, create: () => method === 'gitReview' ? gitReviewResultSchema : gitReviewDiffSchema },
  } satisfies InvocationDescriptor)),
  {
    id: `${PACKAGE_NAME}#fileReview/directoryStart`, service: 'fileReview', namespace: 'fileReview',
    method: 'directoryStart', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'path', wire: 'path', source: 'json', codec: { mode: 'strict', typeSymbol: 'string', create: () => z.string().max(4096) } },
    ],
    result: { mode: 'strict', typeSymbol: 'string', create: () => z.string() },
  },
  {
    id: `${PACKAGE_NAME}#fileReview/userGuide`, service: 'fileReview', namespace: 'fileReview',
    method: 'userGuide', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'language', wire: 'language', source: 'json', codec: { mode: 'strict', typeSymbol: "'zh' | 'en'", create: () => z.enum(['zh', 'en']) } },
    ],
    result: { mode: 'strict', typeSymbol: 'string', create: () => z.string().min(1) },
  },
  descriptor('status'),
  {
    id: `${PACKAGE_NAME}#fileReview/userGuideDocument`, service: 'fileReview', namespace: 'fileReview',
    method: 'userGuideDocument', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'language', wire: 'language', source: 'json', codec: { mode: 'strict', typeSymbol: "'zh' | 'en'", create: () => z.enum(['zh', 'en']) } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#UserGuideDocument`, create: () => userGuideDocumentSchema },
  },
  descriptor('apply'),
  recordedDescriptor(),
  {
    id: `${PACKAGE_NAME}#fileReview/workspace`, service: 'fileReview', namespace: 'fileReview',
    method: 'workspace', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [{ name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec }],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewWorkspace`, create: () => reviewWorkspaceSchema },
  },
  {
    id: `${PACKAGE_NAME}#fileReview/project`, service: 'fileReview', namespace: 'fileReview',
    method: 'project', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [{ name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec }],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewProjectPage`, create: () => reviewProjectPageSchema },
  },
  {
    id: `${PACKAGE_NAME}#fileReview/saveProject`, service: 'fileReview', namespace: 'fileReview',
    method: 'saveProject', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'request', wire: 'request', source: 'json', codec: {
        mode: 'strict', typeSymbol: `${PACKAGE_NAME}#SaveReviewProject`, create: () => saveReviewProjectSchema,
      } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewProjectPage`, create: () => reviewProjectPageSchema },
  },
  {
    id: `${PACKAGE_NAME}#fileReview/setTemporaryRepositories`, service: 'fileReview', namespace: 'fileReview',
    method: 'setTemporaryRepositories', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'entries', wire: 'entries', source: 'json', codec: {
        mode: 'strict', typeSymbol: `${PACKAGE_NAME}#NamedReviewRepositories`, create: () => z.array(namedReviewRepositorySchema).max(512),
      } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewWorkspace`, create: () => reviewWorkspaceSchema },
  },
]

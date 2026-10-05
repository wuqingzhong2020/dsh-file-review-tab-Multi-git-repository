import { FILE_REVIEW_SERVICE_NAME } from './service-names.ts'
/** Strict Typert codecs shared by the Host and browser contribution artifacts. */

import { z } from 'zod'
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'
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
  path: z.string().min(1).max(4096),
  oldText: z.string().max(1024 * 1024).nullable(),
  newText: z.string().max(1024 * 1024),
  oldStart: z.number().int().min(1).optional(),
  newStart: z.number().int().min(1).optional(),
  recordId: z.string().uuid().optional(),
  sourceCallId: z.string().max(256).optional(),
})

const requestSchema = z.object({
  action: z.enum(['undo', 'redo']),
  files: z.array(z.object({
    path: z.string().min(1).max(4096),
    diffs: z.array(diffSchema).max(4000),
  })).max(256),
}).refine(
  value => new TextEncoder().encode(JSON.stringify(value)).length <= 16 * 1024 * 1024,
  'Review request exceeds the 16 MiB budget',
)

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
  subCallId: z.string().optional(),
  name: z.string(),
  path: z.string(),
  before: z.string().nullable(),
  after: z.string(),
  recordId: z.string().uuid().optional(),
  complete: z.boolean().optional(),
  reason: z.string().optional(),
})

const recordedRequestSchema = z.object({
  rootCallIds: z.array(z.string().max(256)).max(4000),
})

const recordedResultSchema = z.object({
  mutations: z.array(recordedMutationSchema),
  warnings: z.array(z.string().max(1024)).max(8).optional(),
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
    id: `${PACKAGE_NAME}#${FILE_REVIEW_SERVICE_NAME}/${method}`,
    service: FILE_REVIEW_SERVICE_NAME,
    namespace: FILE_REVIEW_SERVICE_NAME,
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
    id: `${PACKAGE_NAME}#${FILE_REVIEW_SERVICE_NAME}/recorded`,
    service: FILE_REVIEW_SERVICE_NAME,
    namespace: FILE_REVIEW_SERVICE_NAME,
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
    id: `${PACKAGE_NAME}#${FILE_REVIEW_SERVICE_NAME}/${method}`, service: FILE_REVIEW_SERVICE_NAME, namespace: FILE_REVIEW_SERVICE_NAME, method,
    invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'request', wire: 'request', source: 'json', codec: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewLocationRequest`, create: () => locationRequestSchema } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#ReviewLocationResult`, create: () => locationResultSchema },
  } satisfies InvocationDescriptor)),
  ...(['gitReview', 'gitReviewDiff'] as const).map(method => ({
    id: `${PACKAGE_NAME}#${FILE_REVIEW_SERVICE_NAME}/${method}`, service: FILE_REVIEW_SERVICE_NAME, namespace: FILE_REVIEW_SERVICE_NAME, method,
    invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'request', wire: 'request', source: 'json', codec: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#${method === 'gitReview' ? 'GitReviewRequest' : 'GitReviewFileRequest'}`, create: () => method === 'gitReview' ? gitReviewRequestSchema : gitReviewFileRequestSchema } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#${method === 'gitReview' ? 'GitReviewResult' : 'GitReviewDiff'}`, create: () => method === 'gitReview' ? gitReviewResultSchema : gitReviewDiffSchema },
  } satisfies InvocationDescriptor)),
  {
    id: `${PACKAGE_NAME}#${FILE_REVIEW_SERVICE_NAME}/userGuide`, service: FILE_REVIEW_SERVICE_NAME, namespace: FILE_REVIEW_SERVICE_NAME,
    method: 'userGuide', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'language', wire: 'language', source: 'json', codec: { mode: 'strict', typeSymbol: "'zh' | 'en'", create: () => z.enum(['zh', 'en']) } },
    ],
    result: { mode: 'strict', typeSymbol: 'string', create: () => z.string().min(1) },
  },
  descriptor('status'),
  {
    id: `${PACKAGE_NAME}#${FILE_REVIEW_SERVICE_NAME}/userGuideDocument`, service: FILE_REVIEW_SERVICE_NAME, namespace: FILE_REVIEW_SERVICE_NAME,
    method: 'userGuideDocument', invocation: { kind: 'direct' }, scope: { context: 'agent', wire: 'agentId' },
    parameters: [
      { name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent', codec: agentCodec },
      { name: 'language', wire: 'language', source: 'json', codec: { mode: 'strict', typeSymbol: "'zh' | 'en'", create: () => z.enum(['zh', 'en']) } },
    ],
    result: { mode: 'strict', typeSymbol: `${PACKAGE_NAME}#UserGuideDocument`, create: () => userGuideDocumentSchema },
  },
  descriptor('apply'),
  recordedDescriptor(),

]

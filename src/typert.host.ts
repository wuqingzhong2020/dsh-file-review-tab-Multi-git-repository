import { FILE_REVIEW_SERVICE_NAME } from './service-names.ts'
/** Host Typert contribution discovered through the package's `./typert` export. */

import type { TypertContribution } from '@deepseek-ai/dsh-typert-registry/types'
import { FILE_REVIEW_INVOCATIONS, PACKAGE_NAME } from './typert-descriptors.ts'

export const TYPERT: TypertContribution = {
  package: PACKAGE_NAME,
  face: 'host',
  schemas: [],
  invocations: FILE_REVIEW_INVOCATIONS,
  model: {
    services: [{
      key: FILE_REVIEW_SERVICE_NAME,
      exportName: 'FileReviewService',
      summary: 'Safely inspect and toggle one turn of produced text changes.',
      tags: [],
      members: [],
      types: [],
    }],
    events: [],
    objects: [],
  },
}

export default TYPERT

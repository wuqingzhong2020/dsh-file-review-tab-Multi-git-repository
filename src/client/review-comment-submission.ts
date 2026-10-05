import type { Context } from '@deepseek-ai/cordis'
import { formatReviewComments, type ReviewComment } from './review-comments.ts'
import { ReviewSendFailure, sendReviewComments } from './review-comments-send.ts'
import {
  isAdmittedDiscussionState,
  type ReviewDiscussion,
  type ReviewDiscussionStore,
} from './review-discussions.ts'
import { commentPositionLabel, commentScopeLabel } from './review-comment-labels.ts'
import { t } from './locales.ts'
import { serializeReviewPacket, REVIEW_PACKET_PACKAGE } from './review-comment-packet.ts'

const PARENT_RESPONSE_LIMIT = 20_000

/** Follow-up opinions include each parent once, with a bounded copy of its replies. */
export function formatReviewSubmission(
  comments: readonly ReviewComment[],
  discussions: readonly ReviewDiscussion[],
): string {
  let message = formatReviewComments(comments, {
    introduction: t('commentPrompt'),
    repository: t('repository'),
    file: t('commentFile'),
    source: t('commentSource'),
    reference: t('commentReference'),
    opinion: t('commentOpinion'),
    scope: commentScopeLabel,
    turn: turn => t('turn', { n: turn }),
    position: commentPositionLabel,
  })
  const parentIds = new Set(comments.map(comment => comment.discussionId).filter(Boolean))
  for (const parentId of parentIds) {
    const parent = discussions.find(discussion => discussion.id === parentId)
    if (parent === undefined) continue
    const opinions = parent.comments.map(comment => comment.text).join('\n')
    const replies = parent.replies
      .map(reply => reply.text)
      .join('\n')
      .slice(0, PARENT_RESPONSE_LIMIT)
    message += `\n\n${t('discussionReply')}:\n${opinions}\n${t('discussionResponse')}:\n${replies}`
  }
  return message
}

interface ReviewSubmissionOptions {
  ctx: Context
  sessionId: string
  comments: readonly ReviewComment[]
  discussions: readonly ReviewDiscussion[]
  discussionStore: ReviewDiscussionStore
  discussionEnabled: boolean
}

/** Persist request identity before sending so late admission can acknowledge the right drafts. */
export async function submitReviewCommentBatch({
  ctx,
  sessionId,
  comments,
  discussions,
  discussionStore,
  discussionEnabled,
}: ReviewSubmissionOptions): Promise<void> {
  const message = serializeReviewPacket({
    package: REVIEW_PACKET_PACKAGE,
    version: 1,
    sessionId,
    batchId: globalThis.crypto.randomUUID(),
    comments,
    context: formatReviewSubmission(comments, discussions),
  })
  let discussionId: string | undefined
  const prepare = discussionEnabled
    ? (requestId: string) => {
        discussionId = discussionStore.begin(comments, requestId, comments[0]?.discussionId)
      }
    : undefined

  try {
    await sendReviewComments(ctx, sessionId, message, prepare)
    if (discussionId) {
      const discussion = discussionStore
        .getSnapshot()
        .records.find(record => record.id === discussionId)
      discussionStore.settle(discussionId, discussion?.requestId ? 'queued' : 'unlinked')
    }
  } catch (cause) {
    const admitted =
      discussionId &&
      discussionStore.getSnapshot().records.find(record => record.id === discussionId)
    // An event can confirm admission before the send Promise reports a transport failure.
    if (admitted && isAdmittedDiscussionState(admitted.state)) return
    if (discussionId) {
      const definiteFailure = cause instanceof ReviewSendFailure && !cause.uncertain
      discussionStore.settle(discussionId, definiteFailure ? 'failed' : 'unknown')
    }
    throw cause
  }
}

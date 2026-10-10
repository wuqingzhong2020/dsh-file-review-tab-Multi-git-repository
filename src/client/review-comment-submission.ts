import { reviewStateFor } from './review-session-state.ts'
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
  /** Resend an existing failed/uncertain batch instead of opening a new discussion. */
  resubmitId?: string | undefined
}

/** Persist request identity before sending so late admission can acknowledge the right drafts. */
async function sendReviewCommentBatch({
  ctx,
  sessionId,
  comments,
  discussions,
  discussionStore,
  discussionEnabled,
  resubmitId,
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
        discussionId =
          resubmitId === undefined
            ? discussionStore.begin(comments, requestId, comments[0]?.discussionId)
            : discussionStore.reopen(resubmitId, requestId)
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
      discussionStore.settle(
        discussionId,
        definiteFailure ? 'failed' : 'unknown',
        submissionError(cause),
      )
    }
    throw cause
  }
}

/** Host rejection code, or the transport message when the send never reached the gateway. */
function submissionError(cause: unknown): string {
  if (cause instanceof ReviewSendFailure) return cause.code
  return cause instanceof Error ? cause.message : String(cause)
}

/** Shared activity permission prevents reset from overlapping admission or resend. */
export async function submitReviewCommentBatch(options: ReviewSubmissionOptions): Promise<void> {
  const state = reviewStateFor(options.sessionId)
  const generation = state.getSnapshot().generation
  if (options.comments.some(comment => comment.anchor.generation !== undefined && comment.anchor.generation !== generation))
    throw new Error(t('reviewResetTargetGone'))
  return state.runActivity(generation, () => sendReviewCommentBatch(options))
}

import { createContext } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import {
  ReviewCommentStore,
  type ReviewComment,
  type ReviewCommentAnchor,
  type ReviewCommentSnapshot,
} from './review-comments.ts'
import { ReviewDiscussionStore, type DiscussionSnapshot } from './review-discussions.ts'

export interface CommentComposer {
  anchor: ReviewCommentAnchor
  id?: string | undefined
  discussionId?: string | undefined
  text: string
  placement: 'inline' | 'list'
}

export interface ReviewCommentsContext {
  snapshot: ReviewCommentSnapshot
  store: ReviewCommentStore
  composer: CommentComposer | null
  setComposer: (value: CommentComposer | null) => void
  start: (
    anchor: ReviewCommentAnchor,
    placement: CommentComposer['placement'],
    comment?: ReviewComment,
    discussionId?: string,
  ) => void
  discussions: DiscussionSnapshot
  discussionStore: ReviewDiscussionStore
  ctx: Context
  sessionId: string
}

export const ReviewCommentsContext = createContext<ReviewCommentsContext | null>(null)

const commentStores = new Map<string, ReviewCommentStore>()
const discussionStores = new Map<string, ReviewDiscussionStore>()

/** Missing browser storage still allows drafts and discussions to work in memory. */
function browserStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function commentStoreFor(sessionId: string): ReviewCommentStore {
  let store = commentStores.get(sessionId)
  if (store === undefined) {
    store = new ReviewCommentStore(
      browserStorage(),
      `dsh-file-review-tab-multi-git-repository:comments:${sessionId}`,
    )
    commentStores.set(sessionId, store)
  }
  return store
}

export function discussionStoreFor(sessionId: string): ReviewDiscussionStore {
  let store = discussionStores.get(sessionId)
  if (store === undefined) {
    store = new ReviewDiscussionStore(
      browserStorage(),
      `dsh-file-review-tab-multi-git-repository:discussions:${sessionId}`,
    )
    discussionStores.set(sessionId, store)
  }
  return store
}

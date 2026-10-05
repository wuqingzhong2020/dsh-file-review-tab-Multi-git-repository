/** Package-owned identities allow this plugin to coexist with the original file review. */
export const FILE_REVIEW_SERVICE_NAME = 'multiGitFileReviewByWqz' as const
export const FILE_REVIEW_REMOTE_NAMESPACE = `remote.${FILE_REVIEW_SERVICE_NAME}` as const
export const FILE_REVIEW_CHAT_LOCALE_NAMESPACE = `${FILE_REVIEW_SERVICE_NAME}.chat` as const

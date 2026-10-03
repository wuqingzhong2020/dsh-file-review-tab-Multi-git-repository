import type { Context } from '@deepseek-ai/cordis';
import type { GitReviewDiff, GitReviewFile as GitReviewFileChange } from '../git-review-types.ts';
import type { ReviewCommentTarget } from './review-comments.ts';
interface GitReviewFileProps {
    readonly ctx: Context;
    readonly sessionId: string;
    readonly file: GitReviewFileChange;
    readonly target: ReviewCommentTarget;
    readonly sourceKey: string;
    readonly open: boolean;
    readonly diff: GitReviewDiff | string | null | undefined;
    readonly onToggle: () => void;
}
/** Controlled Git file display; comparison requests and loading stay in the panel. */
export declare function GitReviewFile({ ctx, sessionId, file, target, sourceKey, open, diff, onToggle, }: GitReviewFileProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GitReviewFile.d.ts.map
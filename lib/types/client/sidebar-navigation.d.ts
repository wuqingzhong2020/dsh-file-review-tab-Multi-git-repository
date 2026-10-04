import type { ISidebarRight, SidebarRightTabActions } from '@deepseek-ai/dsh-client-ui-sidebar-right/client';
export declare const REVIEW_KIND = "file-review";
export declare const REVIEW_IMPLEMENTATION = "dsh-file-review-tab-multi-git-repository:file-review";
export declare const LEGACY_GUIDE_KIND = "file-review-guide";
export declare const LEGACY_GUIDE_IMPLEMENTATION = "dsh-file-review-tab-multi-git-repository:legacy-guide";
/** Chat actions may only navigate the session currently owned by the public controller. */
export declare function openReviewTab(sidebar: Pick<ISidebarRight, 'mounted' | 'openTab'>, sessionId: string, paths: readonly string[], turn?: number): void;
/** Keep file opens bound to their originating tab, including after asynchronous work. */
export declare function openReviewResource(actions: Pick<SidebarRightTabActions, 'openResource'>, sessionId: string, cwd: string | undefined, path: string, signal: AbortSignal): void;
//# sourceMappingURL=sidebar-navigation.d.ts.map
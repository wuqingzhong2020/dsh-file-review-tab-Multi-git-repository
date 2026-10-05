/** Shipped documentation, read through the Agent-scoped plugin service. */
export interface UserGuideDocument {
    path: string;
    markdown: string;
    /** Only the plugin's named screenshots, keyed by their authored relative destinations. */
    images: Record<string, string>;
}
export declare const USER_GUIDE_IMAGES: readonly ["01-file-review-overview.jpg", "02-git-review-scope.jpg", "03-multi-repository-settings.jpg", "04-unified-diff-context-controls.jpg", "05-expanded-context-collapse.jpg", "06-split-diff-search.jpg", "07-line-selection-context-menu.jpg", "08-diff-appearance-settings.jpg", "09-external-editor-settings.jpg", "10-range-comment-editor.jpg", "11-pending-review-comments.jpg", "12-review-discussion-history.jpg", "13-review-enhancements-zh.jpg", "14-review-enhancements-en.jpg", "15-profile-settings-zh.jpg", "16-profile-settings-en.jpg", "17-review-packet-zh.jpg", "18-review-packet-en.jpg"];
//# sourceMappingURL=user-guide.d.ts.map
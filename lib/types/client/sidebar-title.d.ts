import type { BetterSidebarService } from 'dsh-better-sidebar/client/service';
/** Native sidebar chips keep a stored title, separate from the tab descriptor. */
export declare function followReviewTabTitle(sidebar: Pick<BetterSidebarService, 'updateTab'>, tab: {
    readonly id: string;
    readonly title: string;
}): () => void;
//# sourceMappingURL=sidebar-title.d.ts.map
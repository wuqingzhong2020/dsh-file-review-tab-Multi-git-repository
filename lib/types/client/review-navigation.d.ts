import { type ReactNode } from 'react';
export type ReviewFileOpener = (absolutePath: string) => void;
/** One navigation capability covers file headers, comments and selection fallbacks. */
export declare function ReviewNavigationProvider({ openFile, children }: {
    readonly openFile: ReviewFileOpener;
    readonly children: ReactNode;
}): import("react").JSX.Element;
export declare function useReviewFileOpener(): ReviewFileOpener;
//# sourceMappingURL=review-navigation.d.ts.map
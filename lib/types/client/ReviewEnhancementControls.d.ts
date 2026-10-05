import type { DiffViewPreferences } from './diff-view-preferences.ts';
declare const ENHANCEMENTS: readonly [{
    readonly key: "dock";
    readonly label: "reviewDock";
}, {
    readonly key: "adaptive";
    readonly label: "reviewAdaptive";
}, {
    readonly key: "foldMessages";
    readonly label: "reviewFoldMessages";
}];
export type ReviewEnhancement = typeof ENHANCEMENTS[number]['key'];
interface ReviewEnhancementControlsProps {
    value: Pick<DiffViewPreferences, ReviewEnhancement>;
    onChange: (key: ReviewEnhancement, checked: boolean) => void;
    disabled?: boolean;
    className?: string | undefined;
}
/** The dialog and official settings card expose the same portable enhancement fields. */
export declare function ReviewEnhancementControls({ value, onChange, disabled, className, }: ReviewEnhancementControlsProps): import("react").JSX.Element[];
export {};
//# sourceMappingURL=ReviewEnhancementControls.d.ts.map
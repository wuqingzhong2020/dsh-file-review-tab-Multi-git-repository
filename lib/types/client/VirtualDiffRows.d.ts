import { type ReactNode } from 'react';
interface VirtualDiffRowsProps {
    readonly count: number;
    readonly enabled: boolean;
    readonly estimate: number;
    readonly identity: string;
    readonly render: (index: number) => ReactNode;
    readonly focusIndex?: number;
    readonly focusVersion?: number;
    readonly keepIndices?: readonly number[];
}
/** Variable-height rows include wrapping and complete comment threads. Both split cells are one measured row. */
export declare function VirtualDiffRows({ count, enabled, estimate, identity, render, focusIndex, focusVersion, keepIndices, }: VirtualDiffRowsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=VirtualDiffRows.d.ts.map
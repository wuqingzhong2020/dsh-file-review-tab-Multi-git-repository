import { type ReactNode } from 'react';
/** Variable-height rows include wrapping and complete comment threads. Both split cells are one measured row. */
export declare function VirtualDiffRows({ count, enabled, estimate, identity, render, focusIndex, focusVersion, keepIndices }: {
    count: number;
    enabled: boolean;
    estimate: number;
    identity: string;
    render: (index: number) => ReactNode;
    focusIndex?: number;
    focusVersion?: number;
    keepIndices?: readonly number[];
}): import("react").JSX.Element;
//# sourceMappingURL=VirtualDiffRows.d.ts.map